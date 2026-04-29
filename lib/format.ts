import { format } from "date-fns";

export function formatCredits(value: number) {
  return `${value} credits`;
}

export function formatDateTime(value: string) {
  return format(new Date(value), "EEE, MMM d • h:mm a");
}
