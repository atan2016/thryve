import { fetchHtml } from "@/lib/schedule-sync/fetch-html";
import { parseDayTimeRules } from "@/lib/schedule-sync/parse-utils";
import type { RecurringClass, ScheduleScrapeResult, TeacherScheduleContext } from "@/lib/schedule-sync/types";

const PEACEBANK_RECESS_URL =
  "https://peacebank-yoga.recess.tv/embed/checkout/explore?displayClass=list&hideMenu=true&splitLiveClassInSeparateTabs=false&class_type=LIVE&displayDays=14";
const PEACEBANK_SITE = "https://www.peacebankyoga.com/schedule";
const YOGA_SOURCE_SCHEDULE = "https://yogasource.com/schedule/";
const YOGA_SOURCE_PROFILE = "https://yogasource.com/team-item/blu-high/";
const BLUBAYU_YOGA = "https://www.blubayu.com/yoga";

const BLU_RECURRING_FALLBACK: Omit<RecurringClass, "teacherId" | "teacherSlug">[] = [
  {
    sourceUrl: PEACEBANK_RECESS_URL,
    sourceLabel: "Peacebank Yoga (Recess)",
    title: "4BEAT Vinyasa",
    description: "Breath-synced Vinyasa with Rocket-inspired sequencing, music, and steady four-count rhythm.",
    location: "Peacebank Yoga Studio · Redwood City, CA",
    dayOfWeek: 3,
    hour: 17,
    minute: 30,
    durationMinutes: 60,
    offeringId: "offering-19",
    hostId: "host-peacebank-yoga-studio",
    eventType: "Workshop"
  },
  {
    sourceUrl: PEACEBANK_RECESS_URL,
    sourceLabel: "Peacebank Yoga (Recess)",
    title: "4BEAT Vinyasa",
    description: "Morning 4BEAT flow at Peacebank — all levels welcome.",
    location: "Peacebank Yoga Studio · Redwood City, CA",
    dayOfWeek: 4,
    hour: 9,
    minute: 0,
    durationMinutes: 60,
    offeringId: "offering-19",
    hostId: "host-peacebank-yoga-studio",
    eventType: "Workshop"
  },
  {
    sourceUrl: PEACEBANK_RECESS_URL,
    sourceLabel: "Peacebank Yoga (Recess)",
    title: "4BEAT Vinyasa",
    description: "Weekend morning 4BEAT Vinyasa at Peacebank.",
    location: "Peacebank Yoga Studio · Redwood City, CA",
    dayOfWeek: 6,
    hour: 8,
    minute: 0,
    durationMinutes: 60,
    offeringId: "offering-19",
    hostId: "host-peacebank-yoga-studio",
    eventType: "Workshop"
  },
  {
    sourceUrl: PEACEBANK_RECESS_URL,
    sourceLabel: "Peacebank Yoga (Recess)",
    title: "4BEAT Vinyasa",
    description: "Weekend late-morning 4BEAT Vinyasa at Peacebank.",
    location: "Peacebank Yoga Studio · Redwood City, CA",
    dayOfWeek: 6,
    hour: 9,
    minute: 15,
    durationMinutes: 60,
    offeringId: "offering-19",
    hostId: "host-peacebank-yoga-studio",
    eventType: "Workshop"
  },
  {
    sourceUrl: PEACEBANK_RECESS_URL,
    sourceLabel: "Peacebank Yoga (Recess)",
    title: "4BEAT Vinyasa",
    description: "Sunday morning community flow at Peacebank.",
    location: "Peacebank Yoga Studio · Redwood City, CA",
    dayOfWeek: 0,
    hour: 9,
    minute: 30,
    durationMinutes: 60,
    offeringId: "offering-19",
    hostId: "host-peacebank-yoga-studio",
    eventType: "Workshop"
  },
  {
    sourceUrl: YOGA_SOURCE_SCHEDULE,
    sourceLabel: "Yoga Source Palo Alto",
    title: "Heated Vinyasa",
    description: "Breath-led heated Vinyasa building strength, flexibility, and balance.",
    location: "Yoga Source Palo Alto · Palo Alto, CA",
    dayOfWeek: 0,
    hour: 7,
    minute: 0,
    durationMinutes: 60,
    offeringId: "offering-20",
    hostId: "host-yoga-source-palo-alto",
    eventType: "Workshop"
  }
];

function extractBluHintsFromText(text: string) {
  const hints: Array<{ dayOfWeek?: number; hour?: number; minute?: number; note?: string }> = [];
  const bluBlocks = text.split(/Blu\s*High/i).slice(1);
  for (const block of bluBlocks.slice(0, 3)) {
    const slice = block.slice(0, 500);
    hints.push(...parseDayTimeRules(slice));
  }
  if (/4\s*beat|4beat/i.test(text) && /blu/i.test(text)) {
    hints.push({ note: "4BEAT mentioned near Blu" });
  }
  return hints;
}

export async function scrapeBluHighSchedule(teacher: TeacherScheduleContext): Promise<ScheduleScrapeResult> {
  const sources = [PEACEBANK_RECESS_URL, PEACEBANK_SITE, YOGA_SOURCE_SCHEDULE, YOGA_SOURCE_PROFILE, BLUBAYU_YOGA];
  const warnings: string[] = [];
  let usedFallback = true;

  for (const url of [BLUBAYU_YOGA, PEACEBANK_SITE, YOGA_SOURCE_PROFILE]) {
    const result = await fetchHtml(url);
    if (!result.ok) {
      warnings.push(`${url} returned ${result.error}`);
      continue;
    }
    const hints = extractBluHintsFromText(result.html);
    if (hints.some((h) => h.dayOfWeek !== undefined)) {
      usedFallback = false;
      warnings.push(`Found schedule hints on ${url} (using curated recurring times)`);
    }
  }

  const recess = await fetchHtml(PEACEBANK_RECESS_URL);
  if (recess.ok) {
    if (/blu/i.test(recess.html) && /vinyasa|4beat|4 beat/i.test(recess.html)) {
      usedFallback = false;
      warnings.push("Peacebank Recess HTML mentions Blu — embed is JS-heavy; using curated Peacebank recurring times");
    } else {
      warnings.push("Peacebank Recess page fetched but Blu not in static HTML (expected for SPA)");
    }
  } else {
    warnings.push(`Peacebank Recess: ${recess.error}`);
  }

  const recurring = BLU_RECURRING_FALLBACK.map((row) => ({
    teacherId: teacher.teacherId,
    teacherSlug: teacher.teacherSlug,
    ...row
  }));

  if (usedFallback) {
    warnings.push(
      "Using curated Blu High recurring schedule from public instructor/studio sources (Recess requires browser render for live scrape)"
    );
  }

  return { recurring, sources, warnings };
}
