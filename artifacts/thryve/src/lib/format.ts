import { format } from "date-fns";

export function formatCredits(value: number) {
  return `${value} credits`;
}

export function formatDateTime(value: string) {
  return format(new Date(value), "EEE, MMM d • h:mm a");
}

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

export function formatEventDateInputValue(value: Date | string | number | null | undefined) {
  if (value == null) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
