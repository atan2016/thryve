import { format } from "date-fns";

export function formatCredits(value: number) {
  return `${value} credits`;
}

export function formatDateTime(value: string) {
  return format(new Date(value), "EEE, MMM d • h:mm a");
}

/**
 * Formats a calendar day using UTC so DATE-style events stored at midnight UTC
 * (e.g. from `<input type="date">`) do not shift to the previous local day.
 */
export function formatEventCalendarDayUtc(
  value: Date | string | number | null | undefined,
  options?: { year?: "numeric" }
): string | undefined {
  if (value == null) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(options?.year ? { year: "numeric" } : {}),
    timeZone: "UTC"
  }).format(date);
}
