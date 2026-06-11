/**
 * Scrapes Blu High & Robin Jaffe schedules from public web sources and syncs to Postgres.
 *
 * Usage:
 *   node scripts/scrape-sync-blu-robin-schedules.cjs
 *   node scripts/scrape-sync-blu-robin-schedules.cjs --dry-run
 *
 * Requires DATABASE_URL (.env / .env.local via dotenv).
 */

const path = require("path");
const { config } = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const { expandRecurring } = require("./schedule-scrape/parse-utils.cjs");
const { scrapeRobinJaffeSchedule } = require("./schedule-scrape/scrape-robin-jaffe.cjs");
const { scrapeBluHighSchedule } = require("./schedule-scrape/scrape-blu-high.cjs");

const root = path.join(__dirname, "..");
if (require("fs").existsSync(path.join(root, ".env"))) {
  config({ path: path.join(root, ".env") });
}
if (require("fs").existsSync(path.join(root, ".env.local"))) {
  config({ path: path.join(root, ".env.local"), override: true });
}

const DRY_RUN = process.argv.includes("--dry-run");
const DAYS_AHEAD = 13;
const SYNC_TEACHER_IDS = ["teacher-4", "teacher-6"];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const now = new Date();

  console.log(`Scraping schedules (${DRY_RUN ? "dry run" : "live"})…\n`);

  const [robin, blu] = await Promise.all([scrapeRobinJaffeSchedule(), scrapeBluHighSchedule()]);

  for (const result of [
    { name: "Robin Jaffe", ...robin },
    { name: "Blu High", ...blu }
  ]) {
    console.log(`## ${result.name}`);
    console.log("Sources:", result.sources.join("\n  "));
    if (result.warnings.length) {
      console.log("Warnings:");
      for (const w of result.warnings) console.log(`  - ${w}`);
    }
    console.log(`Recurring rules: ${result.recurring.length}\n`);
  }

  const allRecurring = [...robin.recurring, ...blu.recurring];
  const sessions = allRecurring.flatMap((rule) => expandRecurring(rule, now, DAYS_AHEAD));

  console.log(`Expanded ${sessions.length} calendar sessions for the next ${DAYS_AHEAD + 1} days.\n`);

  if (DRY_RUN) {
    for (const s of sessions.slice(0, 12)) {
      console.log(`  ${s.startsAt.toISOString()}  ${s.title}  @ ${s.location}`);
    }
    if (sessions.length > 12) console.log(`  … and ${sessions.length - 12} more`);
    await prisma.$disconnect();
    return;
  }

  for (const teacherId of SYNC_TEACHER_IDS) {
    const deleted = await prisma.teacherCalendarSession.deleteMany({
      where: {
        teacherId,
        isBooked: false,
        id: { startsWith: "sync-" }
      }
    });
    console.log(`Removed ${deleted.count} prior sync-* sessions for ${teacherId}`);
  }

  let created = 0;
  for (const s of sessions) {
    await prisma.teacherCalendarSession.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        teacherId: s.teacherId,
        offeringId: s.offeringId,
        title: s.title,
        description: s.description,
        location: s.location,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        timezone: s.timezone,
        sourceUrl: s.sourceUrl,
        isBooked: false
      },
      update: {
        offeringId: s.offeringId,
        title: s.title,
        description: s.description,
        location: s.location,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        timezone: s.timezone,
        sourceUrl: s.sourceUrl
      }
    });
    created += 1;
  }

  // Upcoming events — one row per recurring series (next occurrence)
  const eventByKey = new Map();
  for (const s of sessions) {
    const key = `${s.teacherId}:${s.title}:${s.location}`;
    const existing = eventByKey.get(key);
    if (!existing || s.startsAt < existing.startsAt) {
      eventByKey.set(key, s);
    }
  }

  for (const s of eventByKey.values()) {
    const eventId = `event-sync-${s.teacherSlug}-${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}`;
    await prisma.teacherUpcomingEvent.upsert({
      where: { id: eventId },
      create: {
        id: eventId,
        teacherId: s.teacherId,
        hostId: s.hostId ?? null,
        title: s.title,
        eventType: s.eventType ?? "Workshop",
        hostName: s.location.split("·")[0]?.trim() ?? null,
        address: s.location,
        eventTime: s.startsAt.toLocaleTimeString("en-US", {
          timeZone: s.timezone,
          hour: "numeric",
          minute: "2-digit"
        }),
        eventUrl: s.sourceUrl,
        eventDate: s.startsAt
      },
      update: {
        hostId: s.hostId ?? null,
        title: s.title,
        hostName: s.location.split("·")[0]?.trim() ?? null,
        address: s.location,
        eventTime: s.startsAt.toLocaleTimeString("en-US", {
          timeZone: s.timezone,
          hour: "numeric",
          minute: "2-digit"
        }),
        eventUrl: s.sourceUrl,
        eventDate: s.startsAt
      }
    });
  }

  console.log(`\nUpserted ${created} calendar sessions and ${eventByKey.size} upcoming event rows.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
