import type { ExpandedScheduleSession, RecurringClass } from "@/lib/schedule-sync/types";

export const TZ = "America/Los_Angeles";

export function matchAllText(html: string, re: RegExp): string[] {
  const out: string[] = [];
  const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
  const global = new RegExp(re.source, flags);
  let m: RegExpExecArray | null;
  while ((m = global.exec(html)) !== null) {
    out.push(m[1] ?? m[0]);
  }
  return out;
}

export function parseDayTimeRules(text: string): Array<{ dayOfWeek: number; hour: number; minute: number }> {
  const normalized = text.replace(/\s+/g, " ").trim();
  const results: Array<{ dayOfWeek: number; hour: number; minute: number }> = [];

  const blockRe =
    /((?:Mondays?|Tuesdays?|Wednesdays?|Thursdays?|Fridays?|Saturdays?|Sundays?)(?:\s+and\s+(?:Mondays?|Tuesdays?|Wednesdays?|Thursdays?|Fridays?|Saturdays?|Sundays?))*)\s+(\d{1,2}):(\d{2})\s*(am|pm)/gi;
  let block: RegExpExecArray | null;
  while ((block = blockRe.exec(normalized)) !== null) {
    const daysPart = block[1];
    const hour12 = Number(block[2]);
    const minute = Number(block[3]);
    const ampm = block[4].toLowerCase();
    let hour = hour12 % 12;
    if (ampm === "pm") hour += 12;

    const dayRe = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/gi;
    let dayMatch: RegExpExecArray | null;
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    while ((dayMatch = dayRe.exec(daysPart)) !== null) {
      const key = dayMatch[1].toLowerCase();
      const dayOfWeek = dayMap[key];
      if (dayOfWeek !== undefined) {
        results.push({ dayOfWeek, hour, minute });
      }
    }
  }

  return results;
}

export function expandRecurring(rule: RecurringClass, from: Date, daysAhead: number): ExpandedScheduleSession[] {
  const sessions: ExpandedScheduleSession[] = [];
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

    sessions.push({
      teacherId: rule.teacherId,
      teacherSlug: rule.teacherSlug,
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

export function slugifyForEventId(value: string, maxLen = 30) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, maxLen);
}
