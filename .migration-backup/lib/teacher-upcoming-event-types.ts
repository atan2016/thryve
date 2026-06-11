/** Values aligned with homepage event category chips (`FeaturedEventsCarousel`). */
export const TEACHER_UPCOMING_EVENT_TYPE_OPTIONS = [
  "Workshop",
  "Retreat",
  "Community",
  "Meditation",
  "Breathwork",
  "Somatic Healing"
] as const;

export type TeacherUpcomingEventTypeOption = (typeof TEACHER_UPCOMING_EVENT_TYPE_OPTIONS)[number];

const OPTION_SET = new Set<string>(TEACHER_UPCOMING_EVENT_TYPE_OPTIONS);

export function normalizeTeacherUpcomingEventType(raw: string | undefined | null): TeacherUpcomingEventTypeOption {
  const trimmed = raw?.trim();
  if (trimmed && OPTION_SET.has(trimmed)) {
    return trimmed as TeacherUpcomingEventTypeOption;
  }
  return "Workshop";
}
