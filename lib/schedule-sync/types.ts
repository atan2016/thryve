export type TeacherScheduleContext = {
  teacherId: string;
  teacherSlug: string;
  fullName: string;
  claimEmail?: string | null;
  userEmail?: string | null;
  city?: string | null;
  websiteUrl?: string | null;
  studioScheduleUrl?: string | null;
  studioWebsiteUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
};

export type RecurringClass = {
  teacherId: string;
  teacherSlug: string;
  sourceUrl: string;
  sourceLabel: string;
  title: string;
  description: string;
  location: string;
  dayOfWeek: number;
  hour: number;
  minute: number;
  durationMinutes: number;
  offeringId?: string;
  hostId?: string;
  eventType?: string;
};

export type ScheduleScrapeResult = {
  recurring: RecurringClass[];
  sources: string[];
  warnings: string[];
};

export type ExpandedScheduleSession = {
  teacherId: string;
  teacherSlug: string;
  title: string;
  description: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  sourceUrl: string;
  sourceLabel: string;
  hostId?: string;
  eventType?: string;
};

export type SyncUpcomingEventsResult = {
  eventCount: number;
  sources: string[];
  warnings: string[];
};

export const DAYS_AHEAD = 13;
export const SCHEDULE_FETCH_HEADERS = {
  "User-Agent": "ThryveScheduleScrape/1.0 (+https://thryvewell.net)"
};
