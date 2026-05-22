/**
 * Shared helpers for studio schedule scraping scripts.
 */

const TZ = "America/Los_Angeles";

/** @typedef {{ sourceUrl: string; sourceLabel: string; title: string; description: string; location: string; dayOfWeek: number; hour: number; minute: number; durationMinutes: number; offeringId: string; hostId?: string; eventType?: string }} RecurringClass */

/**
 * @param {string} html
 * @param {RegExp} re
 */
function matchAllText(html, re) {
  const out = [];
  let m;
  const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
  const global = new RegExp(re.source, flags);
  while ((m = global.exec(html)) !== null) {
    out.push(m[1] ?? m[0]);
  }
  return out;
}

/**
 * Parse "Mondays 12:00pm" / "Tuesdays and Thursdays 11:15am"
 * @returns {{ dayOfWeek: number; hour: number; minute: number }[]}
 */
function parseDayTimeRules(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const results = [];

  const blockRe = /((?:Mondays?|Tuesdays?|Wednesdays?|Thursdays?|Fridays?|Saturdays?|Sundays?)(?:\s+and\s+(?:Mondays?|Tuesdays?|Wednesdays?|Thursdays?|Fridays?|Saturdays?|Sundays?))*)\s+(\d{1,2}):(\d{2})\s*(am|pm)/gi;
  let block;
  while ((block = blockRe.exec(normalized)) !== null) {
    const daysPart = block[1];
    const hour12 = Number(block[2]);
    const minute = Number(block[3]);
    const ampm = block[4].toLowerCase();
    let hour = hour12 % 12;
    if (ampm === "pm") hour += 12;

    const dayRe = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/gi;
    let dayMatch;
    while ((dayMatch = dayRe.exec(daysPart)) !== null) {
      const dayMap = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
      };
      const key = dayMatch[1].toLowerCase();
      const dayOfWeek = dayMap[key];
      if (dayOfWeek !== undefined) {
        results.push({ dayOfWeek, hour, minute });
      }
    }
  }

  return results;
}

/**
 * @param {RecurringClass} rule
 * @param {Date} from
 * @param {number} daysAhead
 */
function expandRecurring(rule, from, daysAhead) {
  const sessions = [];
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);

  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + offset);
    if (day.getDay() !== rule.dayOfWeek) continue;

    const startsAt = new Date(day);
    startsAt.setHours(rule.hour, rule.minute, 0, 0);
    const endsAt = new Date(startsAt);
    endsAt.setMinutes(endsAt.getMinutes() + rule.durationMinutes);

    if (startsAt < from) continue;

    const dateKey = startsAt.toISOString().slice(0, 10);
    const slug = rule.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);
    const locSlug = rule.location
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 24);

    sessions.push({
      id: `sync-${rule.teacherSlug}-${dateKey}-${slug}-${locSlug}`,
      teacherId: rule.teacherId,
      teacherSlug: rule.teacherSlug,
      offeringId: rule.offeringId,
      title: rule.title,
      description: rule.description,
      location: rule.location,
      startsAt,
      endsAt,
      timezone: TZ,
      sourceUrl: rule.sourceUrl,
      sourceLabel: rule.sourceLabel,
      hostId: rule.hostId,
      eventType: rule.eventType
    });
  }

  return sessions;
}

/**
 * @param {Date} startsAt
 */
function pacificParts(startsAt) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const parts = fmt.formatToParts(startsAt);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    weekday: get("weekday"),
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: Number(get("hour")),
    minute: Number(get("minute"))
  };
}

module.exports = {
  TZ,
  matchAllText,
  parseDayTimeRules,
  expandRecurring,
  pacificParts
};
