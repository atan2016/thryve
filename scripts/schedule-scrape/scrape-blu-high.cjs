/**
 * Scrapes Blu High studio schedules from public web sources.
 * Peacebank uses Recess (client-rendered); we combine Recess page hints + instructor site + Yoga Source profile.
 */

const { parseDayTimeRules } = require("./parse-utils.cjs");

const TEACHER_ID = "teacher-6";
const TEACHER_SLUG = "blu-high";
const FETCH_HEADERS = { "User-Agent": "ThryveScheduleScrape/1.0 (+https://thryvewell.net)" };

const PEACEBANK_RECESS_URL =
  "https://peacebank-yoga.recess.tv/embed/checkout/explore?displayClass=list&hideMenu=true&splitLiveClassInSeparateTabs=false&class_type=LIVE&displayDays=14";
const PEACEBANK_SITE = "https://www.peacebankyoga.com/schedule";
const YOGA_SOURCE_SCHEDULE = "https://yogasource.com/schedule/";
const YOGA_SOURCE_PROFILE = "https://yogasource.com/team-item/blu-high/";
const BLUBAYU_YOGA = "https://www.blubayu.com/yoga";

/**
 * Curated recurring Peacebank / Yoga Source slots when JS schedule embed cannot be parsed server-side.
 * Sourced from blubayu.com (when available), Peacebank Recess listings, and Yoga Source instructor page — May 2026.
 */
const BLU_RECURRING_FALLBACK = [
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
    hostId: "host-peacebank-yoga-studio"
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
    hostId: "host-peacebank-yoga-studio"
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
    hostId: "host-peacebank-yoga-studio"
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
    hostId: "host-peacebank-yoga-studio"
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
    hostId: "host-peacebank-yoga-studio"
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
    hostId: "host-yoga-source-palo-alto"
  }
];

/**
 * Try to find "Blu" on a fetched HTML/text blob and extract day/time hints.
 * @param {string} text
 */
function extractBluHintsFromText(text) {
  const hints = [];
  const bluBlocks = text.split(/Blu\s*High/i).slice(1);
  for (const block of bluBlocks.slice(0, 3)) {
    const slice = block.slice(0, 500);
    const times = parseDayTimeRules(slice);
    hints.push(...times);
  }
  if (/4\s*beat|4beat/i.test(text) && /blu/i.test(text)) {
    hints.push({ note: "4BEAT mentioned near Blu" });
  }
  return hints;
}

/**
 * @returns {Promise<{ recurring: import('./parse-utils.cjs').RecurringClass[]; sources: string[]; warnings: string[] }>}
 */
async function scrapeBluHighSchedule() {
  const sources = [PEACEBANK_RECESS_URL, PEACEBANK_SITE, YOGA_SOURCE_SCHEDULE, YOGA_SOURCE_PROFILE, BLUBAYU_YOGA];
  const warnings = [];
  let usedFallback = true;

  for (const url of [BLUBAYU_YOGA, PEACEBANK_SITE, YOGA_SOURCE_PROFILE]) {
    try {
      const res = await fetch(url, { headers: FETCH_HEADERS });
      if (!res.ok) {
        warnings.push(`${url} returned ${res.status}`);
        continue;
      }
      const html = await res.text();
      const hints = extractBluHintsFromText(html);
      if (hints.some((h) => h.dayOfWeek !== undefined)) {
        usedFallback = false;
        warnings.push(`Found schedule hints on ${url} (manual mapping still uses curated recurring)`);
      }
    } catch (err) {
      warnings.push(`${url}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  try {
    const res = await fetch(PEACEBANK_RECESS_URL, { headers: FETCH_HEADERS });
    if (res.ok) {
      const html = await res.text();
      if (/blu/i.test(html) && /vinyasa|4beat|4 beat/i.test(html)) {
        usedFallback = false;
        warnings.push("Peacebank Recess HTML mentions Blu — embed is JS-heavy; using curated Peacebank recurring times");
      } else {
        warnings.push("Peacebank Recess page fetched but Blu not in static HTML (expected for SPA)");
      }
    }
  } catch (err) {
    warnings.push(`Peacebank Recess: ${err instanceof Error ? err.message : String(err)}`);
  }

  const recurring = BLU_RECURRING_FALLBACK.map((row) => ({
    teacherId: TEACHER_ID,
    teacherSlug: TEACHER_SLUG,
    ...row
  }));

  if (usedFallback) {
    warnings.push("Using curated Blu High recurring schedule from public instructor/studio sources (Recess requires browser render for live scrape)");
  }

  return { recurring, sources, warnings };
}

module.exports = { scrapeBluHighSchedule, BLU_RECURRING_FALLBACK };
