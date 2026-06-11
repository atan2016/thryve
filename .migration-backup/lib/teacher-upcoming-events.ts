import { isBefore, startOfDay } from "date-fns";

/**
 * One-time events with a calendar date should disappear after that local server day.
 * Events with no date are treated as ongoing (schedules, evergreen links).
 */
export function isUpcomingTeacherEventDateEligible(eventDate?: Date | string | null, now = new Date()) {
  if (eventDate == null || eventDate === "") {
    return true;
  }

  const d = typeof eventDate === "string" ? new Date(eventDate) : eventDate;
  if (Number.isNaN(d.getTime())) {
    return true;
  }

  const eventDay = startOfDay(d);
  const today = startOfDay(now);
  return !isBefore(eventDay, today);
}
