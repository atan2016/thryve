const DEFAULT_EVENT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Max upload size for teacher upcoming event images (stored in DB as bytes).
 * Override with `EVENT_IMAGE_MAX_BYTES` (integer, bytes).
 */
export function getEventImageMaxBytes(): number {
  const raw = process.env.EVENT_IMAGE_MAX_BYTES;
  if (!raw?.trim()) {
    return DEFAULT_EVENT_IMAGE_MAX_BYTES;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_EVENT_IMAGE_MAX_BYTES;
  }
  return parsed;
}

/** Public URL to stream a DB-stored event image (see `app/api/teacher-upcoming-events/[eventId]/image/route.ts`). */
export function getTeacherUpcomingEventImageApiPath(eventId: string) {
  return `/api/teacher-upcoming-events/${eventId}/image`;
}

/** Human-readable limit (matches server validation messaging). */
export function getEventImageMaxSizeLabel(): string {
  const maxBytes = getEventImageMaxBytes();
  return `${(maxBytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** `next/image` cannot optimize same-origin API streams without extra config; pass as `unoptimized`. */
export function isTeacherUpcomingEventImageApiUrl(src: string): boolean {
  return src.startsWith("/api/teacher-upcoming-events/") && src.endsWith("/image");
}

export function resolveTeacherUpcomingEventImageUrl(event: {
  id: string;
  imageUrl?: string | null;
  eventImageMimeType?: string | null;
}): string | undefined {
  if (event.eventImageMimeType?.trim()) {
    return getTeacherUpcomingEventImageApiPath(event.id);
  }
  const url = event.imageUrl?.trim();
  return url || undefined;
}
