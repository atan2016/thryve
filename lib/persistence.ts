import { createHash, randomBytes } from "crypto";

import { endOfMonth, format, isBefore, isWithinInterval, startOfDay, startOfMonth } from "date-fns";

import { getCachedHomepageExternalJobs } from "@/lib/jobs/external-job-search";
import { formatEventCalendarDayUtc } from "@/lib/format";
import { resolveTeacherUpcomingEventImageUrl } from "@/lib/teacher-upcoming-event-image";
import { normalizeTeacherUpcomingEventType } from "@/lib/teacher-upcoming-event-types";
import { isUpcomingTeacherEventDateEligible } from "@/lib/teacher-upcoming-events";
import { Prisma, CertificationSubmissionStatus, DiscussionAuthorRole, Role, StoryMediaType } from "@prisma/client";

import { getAppBaseUrl } from "@/lib/app-base-url";
import { db } from "@/lib/db";
import { sendEmailChangeVerificationEmail } from "@/lib/email/verification";
import { buildTeacherImportDraft, type TeacherImportSourceInput } from "@/lib/teacher-profile-import";
import { demoCalendarSessions, demoEventHosts, demoTeachers, demoUserEventHostFollows, demoUserTeacherFollows, demoUserTeacherHearts } from "@/lib/mock-data";
import {
  deleteUserForAdmin as deleteUserForAdminInStore,
  getAdminContentFilters as getAdminContentFiltersFromStore,
  getTeacherSupplement,
  listUsersForAdmin as listUsersForAdminInStore,
  setTeacherPublicCalendarVisibility,
  updateAdminContentFilters as updateAdminContentFiltersInStore
} from "@/lib/store";
import type {
  AdminContentFilters,
  AdminManagedUser,
  AdminUserUpdateResult,
  AppUser,
  CommunityDiscussion,
  EventHost,
  HomepageEventCard,
  HomepageJobCard,
  Role as AppRole,
  ServiceCategory,
  TeacherCalendarSession,
  TeacherCertificationSubmission,
  Teacher,
  TeacherStory,
  TeacherUpcomingEvent
} from "@/lib/types";

const ASHLEY_LEGACY_SCHEDULE_URL = "https://www.j8hotpilatesyoga.com/about/classes/";
const ASHLEY_CALENDLY_URL = "https://calendly.com/ashleyt-_z90/1-hour-meeting";
const FOLLOWED_EVENT_LABEL = "From people you follow";
/** Final homepage carousel length after merge, filters, and sort by listing time. */
const HOMEPAGE_EVENT_LIMIT = 36;
/** Rows to read from DB before merge (must comfortably exceed final limit + curated count). */
const HOMEPAGE_EVENT_QUERY_LIMIT = 320;
/** Slightly longer list when signed-in user has no follows yet. */
const NO_FOLLOW_EVENT_LIMIT = 42;
function getTodayStart() {
  return startOfDay(new Date());
}

/** Teacher events listed on the homepage: rows created during the current calendar month. */
function getHomepagePersistedNewListingsWhere(): Prisma.TeacherUpcomingEventWhereInput {
  const now = new Date();
  return {
    createdAt: { gte: startOfDay(startOfMonth(now)), lte: endOfMonth(now) }
  };
}

const ADMIN_CONTENT_SETTINGS_ID = "global";
const DEFAULT_ADMIN_CONTENT_FILTERS: AdminContentFilters = {
  hiddenEventKeywords: [],
  hiddenJobKeywords: []
};
const HOMEPAGE_LOCAL_GIGS: HomepageJobCard[] = [
  {
    id: "1",
    title: "Morning Hatha Yoga Instructor",
    category: "Part-time",
    pay: "$45-60/class",
    company: "Zen Flow Studio",
    location: "San Francisco, CA",
    posted: "2 days ago"
  },
  {
    id: "2",
    title: "Corporate Wellness Program Lead",
    category: "Contract",
    pay: "$75/hour",
    company: "TechCorp Wellness",
    location: "Remote",
    posted: "1 day ago"
  },
  {
    id: "3",
    title: "Weekend Yoga Retreat Facilitator",
    category: "Gig",
    pay: "$1,200/weekend",
    company: "Mountain Peak Retreat",
    location: "Boulder, CO",
    posted: "3 days ago"
  },
  {
    id: "4",
    title: "Prenatal Yoga Specialist",
    category: "Full-time",
    pay: "$50,000-65,000/yr",
    company: "Bloom Yoga Center",
    location: "Austin, TX",
    posted: "5 days ago"
  },
  {
    id: "5",
    title: "Studio Operations + Yin Instructor",
    category: "Part-time",
    pay: "$28/hour + commission",
    company: "Stillpoint Wellness",
    location: "Los Angeles, CA",
    posted: "4 days ago"
  }
];
const CATEGORY_IMAGE_FALLBACKS: Record<string, string[]> = {
  Retreat: [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=1200&q=80&auto=format&fit=crop"
  ],
  "Somatic Healing": [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80&auto=format&fit=crop"
  ],
  Meditation: [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1528319725582-ddc096101511?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&q=80&auto=format&fit=crop"
  ],
  Breathwork: [
    "https://images.unsplash.com/photo-1528319725582-ddc096101511?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80&auto=format&fit=crop"
  ],
  Community: [
    "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80&auto=format&fit=crop"
  ],
  Workshop: [
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80&auto=format&fit=crop"
  ]
};

/**
 * Card artwork for CSM YTT (same file as on GitHub main under `public/assets/images/`).
 * Same-origin URL avoids broken `/api/.../image` when DB bytes are missing in production.
 */
const CSM_YTT_GRADUATION_HOMEPAGE_IMAGE = "/assets/images/csm-ytt-graduation-card.png";

/** Graduation / CSM YTT–branded titles: prefer static card even if a stale DB image row points at the API route. */
function shouldForceCsmYttGraduationHomepageImage(eventKey: string) {
  const k = eventKey.toLowerCase();
  return k.includes("csm") && k.includes("ytt");
}

function shouldUseCsmYttGraduationWhenNoCustomImage(eventKey: string) {
  const k = eventKey.toLowerCase();
  return (
    k.includes("200-hour") &&
    (k.includes("teacher training") || k.includes("ytt")) &&
    k.includes("college of san mateo")
  );
}

const serviceCategoryLabels: Record<ServiceCategory, string> = {
  studio: "Studio",
  private: "Private",
  "corporate-events": "Corporate / events",
  kids: "Kids",
  older: "Older"
};

function mapRoleToApp(role: Role): AppRole {
  if (role === "TEACHER") return "teacher";
  if (role === "ADMIN") return "admin";
  return "customer";
}

function mapRoleToDb(role: AppRole): Role {
  if (role === "teacher") return "TEACHER";
  if (role === "admin") return "ADMIN";
  return "CUSTOMER";
}

function mapDiscussionRoleToApp(role: DiscussionAuthorRole): CommunityDiscussion["authorRole"] {
  if (role === "TEACHER") return "teacher";
  if (role === "ADMIN") return "admin";
  return "member";
}

function mapDiscussionRoleToDb(role: CommunityDiscussion["authorRole"]): DiscussionAuthorRole {
  if (role === "teacher") return "TEACHER";
  if (role === "admin") return "ADMIN";
  return "MEMBER";
}

function mapStoryMediaTypeToDb(mediaType: TeacherStory["mediaType"]) {
  return mediaType === "video" ? StoryMediaType.VIDEO : StoryMediaType.IMAGE;
}

const userSelect = {
  id: true,
  email: true,
  password: true,
  role: true,
  name: true,
  emailVerifiedAt: true
};

const adminUserSelect = {
  id: true,
  email: true,
  password: true,
  role: true,
  name: true,
  emailVerifiedAt: true,
  teacher: {
    select: {
      id: true,
      fullName: true,
      slug: true
    }
  },
  pendingEmailChanges: {
    where: {
      consumedAt: null,
      cancelledAt: null
    },
    orderBy: {
      createdAt: "desc" as const
    },
    take: 1,
    select: {
      nextEmail: true,
      createdAt: true
    }
  }
};

const legacyUserSelect = {
  id: true,
  email: true,
  password: true,
  role: true,
  name: true
};

const legacyAdminUserSelect = {
  id: true,
  email: true,
  password: true,
  role: true,
  name: true,
  teacher: {
    select: {
      id: true,
      fullName: true,
      slug: true
    }
  }
};

function isMissingUserEmailVerificationInfrastructure(error: unknown) {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2022" &&
      (error.message.includes("User.emailVerifiedAt") || error.message.includes("emailVerifiedAt"))) ||
    (error instanceof Prisma.PrismaClientValidationError &&
      (error.message.includes("Unknown field `emailVerifiedAt`") || error.message.includes("Unknown argument `emailVerifiedAt`")))
  );
}

function isMissingPendingUserEmailChangeInfrastructure(error: unknown) {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2021" || error.code === "P2022") &&
      (error.message.includes("PendingUserEmailChange") ||
        error.message.includes("pendingEmailChanges") ||
        error.message.includes("User.pendingEmailChanges"))) ||
    (error instanceof Prisma.PrismaClientValidationError &&
      (error.message.includes("Unknown field `pendingEmailChanges`") ||
        error.message.includes("Unknown field `PendingUserEmailChange`")))
  );
}

function isMissingAdminContentSettingsInfrastructure(error: unknown) {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2021" || error.code === "P2022") &&
      (error.message.includes("AdminContentSettings") ||
        error.message.includes("hiddenEventKeywords") ||
        error.message.includes("hiddenJobKeywords"))) ||
    (error instanceof Prisma.PrismaClientValidationError &&
      (error.message.includes("AdminContentSettings") ||
        error.message.includes("hiddenEventKeywords") ||
        error.message.includes("hiddenJobKeywords")))
  );
}

async function withUserEmailVerificationFallback<T>(queries: Array<() => Promise<T>>) {
  let lastCompatibilityError: unknown;

  for (const query of queries) {
    try {
      return await query();
    } catch (error) {
      if (isMissingUserEmailVerificationInfrastructure(error)) {
        lastCompatibilityError = error;
        continue;
      }

      throw error;
    }
  }

  throw lastCompatibilityError;
}

async function getAdminUserRecordById(userId: string) {
  try {
    return await db.user.findUnique({
      where: { id: userId },
      select: adminUserSelect
    });
  } catch (error) {
    if (!isMissingUserEmailVerificationInfrastructure(error) && !isMissingPendingUserEmailChangeInfrastructure(error)) {
      throw error;
    }

    return await db.user.findUnique({
      where: { id: userId },
      select: legacyAdminUserSelect
    });
  }
}

async function listAdminUserRecords() {
  try {
    return await db.user.findMany({
      select: adminUserSelect,
      orderBy: [{ role: "asc" }, { name: "asc" }]
    });
  } catch (error) {
    if (!isMissingUserEmailVerificationInfrastructure(error) && !isMissingPendingUserEmailChangeInfrastructure(error)) {
      throw error;
    }

    return await db.user.findMany({
      select: legacyAdminUserSelect,
      orderBy: [{ role: "asc" }, { name: "asc" }]
    });
  }
}

function mapUser(user: {
  id: string;
  email: string;
  password: string;
  role: Role;
  name: string;
  emailVerifiedAt?: Date | null;
}): AppUser {
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    role: mapRoleToApp(user.role),
    name: user.name,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString()
  };
}

function mapAdminManagedUser(user: {
  id: string;
  email: string;
  password: string;
  role: Role;
  name: string;
  emailVerifiedAt?: Date | null;
  teacher?: {
    id: string;
    fullName: string;
    slug: string;
  } | null;
  pendingEmailChanges?: Array<{
    nextEmail: string;
    createdAt: Date;
  }>;
}): AdminManagedUser {
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    role: mapRoleToApp(user.role),
    name: user.name,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
    linkedTeacherId: user.teacher?.id ?? undefined,
    linkedTeacherName: user.teacher?.fullName ?? undefined,
    linkedTeacherSlug: user.teacher?.slug ?? undefined,
    pendingEmailChangeTo: user.pendingEmailChanges?.[0]?.nextEmail ?? undefined,
    pendingEmailChangeRequestedAt: user.pendingEmailChanges?.[0]?.createdAt?.toISOString()
  };
}

function buildClaimableEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.endsWith("@yoga.local")) {
    return normalizedEmail;
  }

  const [localPart] = normalizedEmail.split("@");
  return localPart ? `${localPart}@yoga.local` : normalizedEmail;
}

function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeKeywordList(keywords: string[]) {
  return Array.from(
    new Set(
      keywords
        .map((keyword) => keyword.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function matchesKeywordFilter(values: Array<string | undefined>, keywords: string[]) {
  if (keywords.length === 0) {
    return false;
  }

  const haystack = values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => haystack.includes(keyword));
}

function slugifyLabel(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "teacher";
}

function slugifyTeacherName(name: string) {
  return slugifyLabel(name);
}

async function getUniqueTeacherSlug(name: string) {
  const baseSlug = slugifyTeacherName(name);
  let slug = baseSlug;
  let suffix = 2;

  while (await db.teacher.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function mapTeacherStory(story: {
  id: string;
  teacherId: string;
  title: string;
  caption: string;
  mediaUrl: string;
  mediaType: StoryMediaType;
  sortOrder: number;
  published: boolean;
}): TeacherStory {
  return {
    id: story.id,
    teacherId: story.teacherId,
    title: story.title,
    caption: story.caption,
    mediaUrl: story.mediaUrl,
    mediaType: story.mediaType === "VIDEO" ? "video" : "image",
    sortOrder: story.sortOrder,
    published: story.published
  };
}

function mapUpcomingEvent(event: {
  id: string;
  teacherId: string;
  hostId?: string | null;
  title: string;
  eventType?: string | null;
  hostName: string | null;
  address?: string | null;
  eventTime?: string | null;
  imageUrl?: string | null;
  eventImageMimeType?: string | null;
  eventUrl: string | null;
  eventDate: Date | null;
}): TeacherUpcomingEvent {
  const imageUrl = resolveTeacherUpcomingEventImageUrl({
    id: event.id,
    imageUrl: event.imageUrl,
    eventImageMimeType: event.eventImageMimeType
  });

  return {
    id: event.id,
    teacherId: event.teacherId,
    hostId: event.hostId ?? undefined,
    title: event.title,
    eventType: normalizeTeacherUpcomingEventType(event.eventType),
    hostName: event.hostName ?? undefined,
    address: event.address ?? undefined,
    eventTime: event.eventTime ?? undefined,
    imageUrl,
    eventUrl: event.eventUrl?.trim() ? event.eventUrl.trim() : undefined,
    eventDate: event.eventDate?.toISOString()
  };
}

function mapEventHost(host: {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string | null;
  imageUrl: string | null;
}): EventHost {
  return {
    id: host.id,
    name: host.name,
    slug: host.slug,
    websiteUrl: host.websiteUrl ?? undefined,
    imageUrl: host.imageUrl ?? undefined
  };
}

function mapCalendarSession(session: {
  id: string;
  teacherId: string;
  offeringId: string;
  title: string;
  description: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  sourceUrl: string | null;
  isBooked: boolean;
}): TeacherCalendarSession {
  return {
    id: session.id,
    teacherId: session.teacherId,
    offeringId: session.offeringId,
    title: session.title,
    description: session.description,
    location: session.location,
    startsAt: session.startsAt.toISOString(),
    endsAt: session.endsAt.toISOString(),
    timezone: session.timezone,
    sourceUrl: session.sourceUrl ?? undefined,
    isBooked: session.isBooked
  };
}

function mapCertificationSubmissionStatusToApp(status: CertificationSubmissionStatus): TeacherCertificationSubmission["status"] {
  if (status === "APPROVED") return "approved";
  if (status === "REJECTED") return "rejected";
  return "pending";
}

function mapCertificationSubmission(submission: {
  id: string;
  teacherId: string;
  credentialName: string;
  notes: string | null;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  status: CertificationSubmissionStatus;
  reviewNote: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}): TeacherCertificationSubmission {
  return {
    id: submission.id,
    teacherId: submission.teacherId,
    credentialName: submission.credentialName,
    notes: submission.notes ?? undefined,
    fileUrl: submission.fileUrl,
    fileName: submission.fileName,
    mimeType: submission.mimeType,
    status: mapCertificationSubmissionStatusToApp(submission.status),
    reviewNote: submission.reviewNote ?? undefined,
    reviewedAt: submission.reviewedAt?.toISOString(),
    createdAt: submission.createdAt.toISOString()
  };
}

function mapTeachingHours(counter: {
  teacherId: string;
  category: string;
  totalHours: number;
}) {
  const category = counter.category as ServiceCategory;

  return {
    category: serviceCategoryLabels[category] ?? counter.category,
    totalHours: counter.totalHours
  };
}

function hydratePersistedTeacher(teacher: {
  id: string;
  userId: string | null;
  claimEmail?: string | null;
  slug: string;
  fullName: string;
  avatarUrl: string | null;
  showPublicCalendar?: boolean | null;
  studioName: string | null;
  studioWebsiteUrl: string | null;
  studioScheduleUrl: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  resumeUrl?: string | null;
  resumeFileName?: string | null;
  resumeMimeType?: string | null;
  profileImportConsent?: boolean | null;
  profileImportRequestedAt?: Date | null;
  profileImportCompletedAt?: Date | null;
  profileImportStatus?: string | null;
  profileImportNotes?: string | null;
  platformHoursBooked: number | null;
  city: string;
  serviceRadiusMiles: number;
  training: string;
  experienceYears: number;
  bio: string;
  gender: string;
  certificationStatus: string;
  published: boolean;
  teachingHours: Array<{
    teacherId: string;
    category: string;
    totalHours: number;
  }>;
  certificationSubmissions: Array<{
    id: string;
    teacherId: string;
    credentialName: string;
    notes: string | null;
    fileUrl: string;
    fileName: string;
    mimeType: string;
    status: CertificationSubmissionStatus;
    reviewNote: string | null;
    reviewedAt: Date | null;
    createdAt: Date;
  }>;
  upcomingEvents: Array<{
    id: string;
    teacherId: string;
    title: string;
    eventType?: string | null;
    hostName: string | null;
    address?: string | null;
    eventTime?: string | null;
    imageUrl?: string | null;
    eventUrl: string | null;
    eventDate: Date | null;
  }>;
  calendarSessions?: Array<{
    id: string;
    teacherId: string;
    offeringId: string;
    title: string;
    description: string;
    location: string;
    startsAt: Date;
    endsAt: Date;
    timezone: string;
    sourceUrl: string | null;
    isBooked: boolean;
  }>;
  stories: Array<{
    id: string;
    teacherId: string;
    title: string;
    caption: string;
    mediaUrl: string;
    mediaType: StoryMediaType;
    sortOrder: number;
    published: boolean;
  }>;
}) {
  const supplement = getTeacherSupplement(teacher.id);
  const fromDb = teacher.teachingHours.map(mapTeachingHours);
  const teachingHours =
    fromDb.length > 0 ? fromDb : (supplement.teachingHours ?? []);
  const platformHoursBooked =
    teachingHours.length > 0
      ? teachingHours.reduce((total, counter) => total + counter.totalHours, 0)
      : teacher.platformHoursBooked ?? undefined;
  const studioScheduleUrl =
    teacher.slug === "ashley-tan" && (!teacher.studioScheduleUrl || teacher.studioScheduleUrl === ASHLEY_LEGACY_SCHEDULE_URL)
      ? ASHLEY_CALENDLY_URL
      : teacher.studioScheduleUrl ?? undefined;

  const fallbackCalendarSessions = demoCalendarSessions
    .filter((session) => session.teacherId === teacher.id)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return {
    id: teacher.id,
    userId: teacher.userId ?? undefined,
    claimEmail: teacher.claimEmail ?? undefined,
    slug: teacher.slug,
    fullName: teacher.fullName,
    avatarUrl: teacher.avatarUrl ?? undefined,
    studioName: teacher.studioName ?? undefined,
    studioWebsiteUrl: teacher.studioWebsiteUrl ?? undefined,
    studioScheduleUrl,
    websiteUrl: teacher.websiteUrl ?? undefined,
    linkedinUrl: teacher.linkedinUrl ?? undefined,
    instagramUrl: teacher.instagramUrl ?? undefined,
    facebookUrl: teacher.facebookUrl ?? undefined,
    resumeUrl: teacher.resumeUrl ?? undefined,
    resumeFileName: teacher.resumeFileName ?? undefined,
    resumeMimeType: teacher.resumeMimeType ?? undefined,
    profileImportConsent: teacher.profileImportConsent ?? false,
    profileImportRequestedAt: teacher.profileImportRequestedAt?.toISOString(),
    profileImportCompletedAt: teacher.profileImportCompletedAt?.toISOString(),
    profileImportStatus: (teacher.profileImportStatus as Teacher["profileImportStatus"]) ?? undefined,
    profileImportNotes: teacher.profileImportNotes ?? undefined,
    platformHoursBooked,
    city: teacher.city,
    serviceRadiusMiles: teacher.serviceRadiusMiles,
    training: teacher.training,
    experienceYears: teacher.experienceYears,
    bio: teacher.bio,
    gender: teacher.gender as Teacher["gender"],
    certificationStatus: teacher.certificationStatus as Teacher["certificationStatus"],
    published: teacher.published,
    ...supplement,
    showPublicCalendar: supplement.showPublicCalendar ?? teacher.showPublicCalendar ?? true,
    teachingHours,
    certificationSubmissions: teacher.certificationSubmissions.map(mapCertificationSubmission),
    upcomingEvents: teacher.upcomingEvents
      .filter((event) => isUpcomingTeacherEventDateEligible(event.eventDate))
      .map(mapUpcomingEvent),
    calendarSessions: teacher.calendarSessions?.map(mapCalendarSession) ?? fallbackCalendarSessions,
    stories: teacher.stories.map(mapTeacherStory)
  };
}

function hydrateFallbackTeacher(teacher: Teacher) {
  const supplement = getTeacherSupplement(teacher.id);
  const teachingHours = supplement.teachingHours ?? [];
  const platformHoursBooked =
    teachingHours.length > 0
      ? teachingHours.reduce((total, counter) => total + counter.totalHours, 0)
      : teacher.platformHoursBooked;

  return {
    ...teacher,
    ...supplement,
    platformHoursBooked,
    certificationSubmissions: teacher.certificationSubmissions ?? [],
    upcomingEvents: (teacher.upcomingEvents ?? []).filter((event) => isUpcomingTeacherEventDateEligible(event.eventDate)),
    calendarSessions: demoCalendarSessions
      .filter((session) => session.teacherId === teacher.id)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  };
}

/** List/card views — omit `fileData` so teacher queries do not load multi‑MB blobs. */
const certificationSubmissionCardSelect = {
  id: true,
  teacherId: true,
  credentialName: true,
  notes: true,
  fileUrl: true,
  fileName: true,
  mimeType: true,
  status: true,
  reviewNote: true,
  reviewedAt: true,
  createdAt: true
} as const;

const teacherRelationSelect = {
  teachingHours: {
    orderBy: { category: "asc" as const }
  },
  certificationSubmissions: {
    orderBy: { createdAt: "desc" as const },
    select: certificationSubmissionCardSelect
  },
  stories: {
    where: { published: true },
    orderBy: { sortOrder: "asc" as const }
  },
  upcomingEvents: {
    select: {
      id: true,
      teacherId: true,
      title: true,
      eventType: true,
      hostName: true,
      address: true,
      eventTime: true,
      imageUrl: true,
      eventImageMimeType: true,
      eventUrl: true,
      eventDate: true
    },
    orderBy: [{ eventDate: "asc" as const }, { createdAt: "asc" as const }]
  }
};

const teacherBaseSelect = {
  id: true,
  userId: true,
  claimEmail: true,
  slug: true,
  fullName: true,
  avatarUrl: true,
  showPublicCalendar: true,
  studioName: true,
  studioWebsiteUrl: true,
  studioScheduleUrl: true,
  websiteUrl: true,
  linkedinUrl: true,
  instagramUrl: true,
  facebookUrl: true,
  resumeUrl: true,
  resumeFileName: true,
  resumeMimeType: true,
  profileImportConsent: true,
  profileImportRequestedAt: true,
  profileImportCompletedAt: true,
  profileImportStatus: true,
  profileImportNotes: true,
  platformHoursBooked: true,
  city: true,
  serviceRadiusMiles: true,
  training: true,
  experienceYears: true,
  bio: true,
  gender: true,
  certificationStatus: true,
  published: true
};

const legacyTeacherBaseSelect = {
  id: true,
  userId: true,
  slug: true,
  fullName: true,
  avatarUrl: true,
  studioName: true,
  studioWebsiteUrl: true,
  studioScheduleUrl: true,
  platformHoursBooked: true,
  city: true,
  serviceRadiusMiles: true,
  training: true,
  experienceYears: true,
  bio: true,
  gender: true,
  certificationStatus: true,
  published: true
};

const teacherSelect = {
  ...teacherBaseSelect,
  ...teacherRelationSelect,
  calendarSessions: {
    orderBy: { startsAt: "asc" as const }
  }
};

const teacherSelectWithoutCalendar = {
  ...teacherBaseSelect,
  ...teacherRelationSelect
};

const legacyTeacherSelect = {
  ...legacyTeacherBaseSelect,
  ...teacherRelationSelect,
  calendarSessions: {
    orderBy: { startsAt: "asc" as const }
  }
};

const legacyTeacherSelectWithoutCalendar = {
  ...legacyTeacherBaseSelect,
  ...teacherRelationSelect
};

/** Stale generated clients may not include newer columns on TeacherUpcomingEvent (address, eventTime). */
const teacherRelationSelectWithoutUpcomingEventLocation = {
  teachingHours: {
    orderBy: { category: "asc" as const }
  },
  certificationSubmissions: {
    orderBy: { createdAt: "desc" as const },
    select: certificationSubmissionCardSelect
  },
  stories: {
    where: { published: true },
    orderBy: { sortOrder: "asc" as const }
  },
  upcomingEvents: {
    select: {
      id: true,
      teacherId: true,
      title: true,
      eventType: true,
      hostName: true,
      eventUrl: true,
      eventDate: true
    },
    orderBy: [{ eventDate: "asc" as const }, { createdAt: "asc" as const }]
  }
};

const teacherSelectWithoutUpcomingLocation = {
  ...teacherBaseSelect,
  ...teacherRelationSelectWithoutUpcomingEventLocation,
  calendarSessions: {
    orderBy: { startsAt: "asc" as const }
  }
};

const teacherSelectWithoutCalendarAndUpcomingLocation = {
  ...teacherBaseSelect,
  ...teacherRelationSelectWithoutUpcomingEventLocation
};

const legacyTeacherSelectWithoutUpcomingLocation = {
  ...legacyTeacherBaseSelect,
  ...teacherRelationSelectWithoutUpcomingEventLocation,
  calendarSessions: {
    orderBy: { startsAt: "asc" as const }
  }
};

const legacyTeacherSelectWithoutCalendarAndUpcomingLocation = {
  ...legacyTeacherBaseSelect,
  ...teacherRelationSelectWithoutUpcomingEventLocation
};

/**
 * Older generated Prisma clients (before `eventType` / DB image columns on `TeacherUpcomingEvent`)
 * reject those fields in `select`. Mirror the normal teacher selects but omit them until
 * `prisma generate` matches `schema.prisma`.
 */
const teacherRelationSelectStalePrismaClient = {
  ...teacherRelationSelect,
  upcomingEvents: {
    ...teacherRelationSelect.upcomingEvents,
    select: {
      id: true,
      teacherId: true,
      title: true,
      hostName: true,
      address: true,
      eventTime: true,
      imageUrl: true,
      eventUrl: true,
      eventDate: true
    }
  }
};

const teacherRelationSelectWithoutUpcomingEventLocationStalePrismaClient = {
  ...teacherRelationSelectWithoutUpcomingEventLocation,
  upcomingEvents: {
    ...teacherRelationSelectWithoutUpcomingEventLocation.upcomingEvents,
    select: {
      id: true,
      teacherId: true,
      title: true,
      hostName: true,
      eventUrl: true,
      eventDate: true
    }
  }
};

const teacherSelectStalePrismaClient = {
  ...teacherBaseSelect,
  ...teacherRelationSelectStalePrismaClient,
  calendarSessions: {
    orderBy: { startsAt: "asc" as const }
  }
};

const teacherSelectWithoutCalendarStalePrismaClient = {
  ...teacherBaseSelect,
  ...teacherRelationSelectStalePrismaClient
};

const teacherSelectWithoutUpcomingLocationStalePrismaClient = {
  ...teacherBaseSelect,
  ...teacherRelationSelectWithoutUpcomingEventLocationStalePrismaClient,
  calendarSessions: {
    orderBy: { startsAt: "asc" as const }
  }
};

const teacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient = {
  ...teacherBaseSelect,
  ...teacherRelationSelectWithoutUpcomingEventLocationStalePrismaClient
};

const legacyTeacherSelectStalePrismaClient = {
  ...legacyTeacherBaseSelect,
  ...teacherRelationSelectStalePrismaClient,
  calendarSessions: {
    orderBy: { startsAt: "asc" as const }
  }
};

const legacyTeacherSelectWithoutUpcomingLocationStalePrismaClient = {
  ...legacyTeacherBaseSelect,
  ...teacherRelationSelectWithoutUpcomingEventLocationStalePrismaClient,
  calendarSessions: {
    orderBy: { startsAt: "asc" as const }
  }
};

const legacyTeacherSelectWithoutCalendarStalePrismaClient = {
  ...legacyTeacherBaseSelect,
  ...teacherRelationSelectStalePrismaClient
};

const legacyTeacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient = {
  ...legacyTeacherBaseSelect,
  ...teacherRelationSelectWithoutUpcomingEventLocationStalePrismaClient
};

function isStalePrismaTeacherUpcomingEventTypeField(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientValidationError &&
    error.message.includes("TeacherUpcomingEvent") &&
    (error.message.includes("Unknown field `eventType`") || error.message.includes("Unknown argument `eventType`"))
  );
}

function isStalePrismaTeacherUpcomingEventImageMimeField(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientValidationError &&
    error.message.includes("TeacherUpcomingEvent") &&
    (error.message.includes("Unknown field `eventImageMimeType`") ||
      error.message.includes("Unknown argument `eventImageMimeType`") ||
      error.message.includes("Unknown field `eventImage`") ||
      error.message.includes("Unknown argument `eventImage`"))
  );
}

function isStalePrismaTeacherUpcomingEventSchemaField(error: unknown) {
  return isStalePrismaTeacherUpcomingEventTypeField(error) || isStalePrismaTeacherUpcomingEventImageMimeField(error);
}

function isMissingCalendarSessionTable(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021" &&
    error.message.includes("TeacherCalendarSession")
  );
}

function isMissingTeacherImportInfrastructure(error: unknown) {
  const missingFieldMarkers = [
    "Teacher.websiteUrl",
    "Teacher.linkedinUrl",
    "Teacher.instagramUrl",
    "Teacher.facebookUrl",
    "Teacher.resumeUrl",
    "Teacher.resumeFileName",
    "Teacher.resumeMimeType",
    "Teacher.profileImportConsent",
    "Teacher.profileImportRequestedAt",
    "Teacher.profileImportCompletedAt",
    "Teacher.profileImportStatus",
    "Teacher.profileImportNotes",
    "Teacher.showPublicCalendar",
    "Teacher.claimEmail",
    "websiteUrl",
    "linkedinUrl",
    "instagramUrl",
    "facebookUrl",
    "resumeUrl",
    "resumeFileName",
    "resumeMimeType",
    "profileImportConsent",
    "profileImportRequestedAt",
    "profileImportCompletedAt",
    "profileImportStatus",
    "profileImportNotes",
    "showPublicCalendar",
    "claimEmail"
  ];

  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2022" &&
      missingFieldMarkers.some((marker) => error.message.includes(marker))) ||
    (error instanceof Prisma.PrismaClientValidationError &&
      missingFieldMarkers.some(
        (marker) => error.message.includes(`Unknown field \`${marker}\``) || error.message.includes(`Unknown argument \`${marker}\``)
      ))
  );
}

function isMissingEventFollowInfrastructure(error: unknown) {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      ((error.code === "P2021" &&
        (error.message.includes("EventHost") ||
          error.message.includes("UserTeacherFollow") ||
          error.message.includes("UserEventHostFollow"))) ||
        (error.code === "P2022" && error.message.includes("hostId")))) ||
    (error instanceof Prisma.PrismaClientValidationError &&
      (error.message.includes("Unknown argument `hostId`") ||
        error.message.includes("Unknown field `hostId`") ||
        error.message.includes("Unknown argument `host`") ||
        error.message.includes("Unknown field `host`")))
  );
}

function isMissingTeacherHeartInfrastructure(error: unknown) {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021" &&
      error.message.includes("UserTeacherHeart")) ||
    (error instanceof Prisma.PrismaClientValidationError && error.message.includes("UserTeacherHeart"))
  );
}

function hasTeacherHeartClientSupport() {
  const runtimeDb = db as unknown as Record<string, unknown>;

  return Boolean(runtimeDb.userTeacherHeart);
}

function isTeacherHeartProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

function warnTeacherHeartDemoFallback(reason: string, error?: unknown) {
  const tail = isTeacherHeartProductionRuntime()
    ? " In production, heart counts stay at 0 until Prisma includes UserTeacherHeart and the table exists."
    : " Using in-memory demo store; hearts are not persisted across server restarts.";
  if (error !== undefined) {
    console.warn(`[UserTeacherHeart] ${reason}.${tail}`, error);
  } else {
    console.warn(`[UserTeacherHeart] ${reason}.${tail}`);
  }
}

function throwTeacherHeartPersistenceUnavailable(context: string): never {
  throw new Error(
    `${context} Teacher hearts require the UserTeacherHeart table and a Prisma client generated from the current schema. Run \`npx prisma generate\`, redeploy, and ensure migration 20260515140000_user_teacher_heart is applied to this database.`
  );
}

function isMissingTeacherUpcomingEventLocationColumns(error: unknown) {
  // Stale Prisma client vs schema: validation error when select references unknown fields.
  if (error instanceof Prisma.PrismaClientValidationError && error.message.includes("TeacherUpcomingEvent")) {
    const message = error.message;

    return (
      message.includes("Unknown field `address`") ||
      message.includes("Unknown field `eventTime`") ||
      message.includes("Unknown argument `address`") ||
      message.includes("Unknown argument `eventTime`") ||
      message.includes("Unknown field `imageUrl`") ||
      message.includes("Unknown argument `imageUrl`") ||
      message.includes("Unknown field `eventImage`") ||
      message.includes("Unknown argument `eventImage`") ||
      message.includes("Unknown field `eventImageMimeType`") ||
      message.includes("Unknown argument `eventImageMimeType`") ||
      message.includes("Unknown field `eventType`") ||
      message.includes("Unknown argument `eventType`")
    );
  }

  // Schema migrated but DB not: runtime query fails because columns are missing on the table.
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022") {
    const message = error.message;
    if (!message.includes("TeacherUpcomingEvent")) {
      return false;
    }

    return (
      message.includes("address") ||
      message.includes("eventTime") ||
      message.includes("imageUrl") ||
      message.includes("eventImage") ||
      message.includes("eventImageMimeType") ||
      message.includes("eventType") ||
      message.includes("hostId")
    );
  }

  return false;
}

function hasEventFollowClientSupport() {
  const runtimeDb = db as unknown as Record<string, unknown>;

  return Boolean(runtimeDb.eventHost && runtimeDb.userTeacherFollow && runtimeDb.userEventHostFollow);
}

function hasAdminContentSettingsClientSupport() {
  const runtimeDb = db as unknown as Record<string, unknown>;
  return Boolean(runtimeDb.adminContentSettings);
}

async function withTeacherCompatibilityFallback<T>(queries: Array<() => Promise<T>>) {
  let lastCompatibilityError: unknown;

  for (const query of queries) {
    try {
      return await query();
    } catch (error) {
      if (
        isMissingCalendarSessionTable(error) ||
        isMissingTeacherImportInfrastructure(error) ||
        isMissingTeacherUpcomingEventLocationColumns(error)
      ) {
        lastCompatibilityError = error;
        continue;
      }

      throw error;
    }
  }

  throw lastCompatibilityError;
}

async function insertLegacyTeacherProfile(userId: string, fullName: string) {
  const id = `teacher-${Date.now()}`;
  const slug = await getUniqueTeacherSlug(fullName);

  await db.$executeRaw`
    INSERT INTO "Teacher" (
      "id",
      "userId",
      "slug",
      "fullName",
      "city",
      "serviceRadiusMiles",
      "training",
      "experienceYears",
      "bio",
      "gender",
      "certificationStatus",
      "published",
      "createdAt",
      "updatedAt"
    ) VALUES (
      ${id},
      ${userId},
      ${slug},
      ${fullName},
      ${""},
      ${0},
      ${""},
      ${0},
      ${""},
      ${"other"},
      ${"not_certified"},
      ${false},
      ${new Date()},
      ${new Date()}
    )
  `;
}

function listFallbackTeachers(existingTeacherIds: string[]) {
  const existing = new Set(existingTeacherIds);
  return demoTeachers
    .filter((teacher) => teacher.published && !existing.has(teacher.id))
    .map(hydrateFallbackTeacher);
}

function inferHomepageEventCategory(title: string, hostName?: string | null) {
  const haystack = `${title} ${hostName ?? ""}`.toLowerCase();

  if (haystack.includes("retreat")) return "Retreat";
  if (haystack.includes("breath")) return "Breathwork";
  if (haystack.includes("sound") || haystack.includes("somatic") || haystack.includes("restorative")) return "Somatic Healing";
  if (haystack.includes("meditation")) return "Meditation";
  if (haystack.includes("community") || haystack.includes("tea") || haystack.includes("satsang")) return "Community";

  return "Workshop";
}

function hashLabel(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function buildHomepageEventImage(
  eventKey: string,
  category: string,
  teacher: {
    avatarUrl: string | null;
    stories: Array<{ mediaUrl: string }>;
  },
  host?: { imageUrl: string | null } | null,
  eventImageUrl?: string | null
) {
  if (shouldForceCsmYttGraduationHomepageImage(eventKey)) {
    return CSM_YTT_GRADUATION_HOMEPAGE_IMAGE;
  }

  const eventImage = eventImageUrl?.trim();
  if (eventImage) {
    return eventImage;
  }

  if (shouldUseCsmYttGraduationWhenNoCustomImage(eventKey)) {
    return CSM_YTT_GRADUATION_HOMEPAGE_IMAGE;
  }

  const storyImages = teacher.stories.map((story) => story.mediaUrl).filter(Boolean);
  const categoryImages = CATEGORY_IMAGE_FALLBACKS[category] ?? CATEGORY_IMAGE_FALLBACKS.Workshop;
  const candidates = Array.from(
    new Set(
      [host?.imageUrl, ...storyImages, teacher.avatarUrl, ...categoryImages].filter((value): value is string => Boolean(value))
    )
  );

  if (candidates.length === 0) {
    return CATEGORY_IMAGE_FALLBACKS.Workshop[0];
  }

  return candidates[hashLabel(eventKey) % candidates.length];
}

function buildHomepageEventLocation(teacher: { city: string; studioName: string | null }) {
  if (teacher.city && teacher.studioName) {
    return `${teacher.city} · ${teacher.studioName}`;
  }

  return teacher.city || teacher.studioName || "Online";
}

function mapPersonalizedEventCard(
  event: {
    id: string;
    teacherId: string;
    hostId: string | null;
    title: string;
    eventType?: string | null;
    hostName: string | null;
    address?: string | null;
    eventTime?: string | null;
    imageUrl?: string | null;
    eventImageMimeType?: string | null;
    eventUrl: string | null;
    eventDate: Date | null;
    createdAt: Date;
    teacher: {
      id: string;
      slug: string;
      fullName: string;
      city: string;
      avatarUrl: string | null;
      studioName: string | null;
      stories: Array<{ mediaUrl: string }>;
    };
    host: {
      id: string;
      name: string;
      slug: string;
      websiteUrl: string | null;
      imageUrl: string | null;
    } | null;
  },
  followedTeacherIds: Set<string>,
  followedHostIds: Set<string>,
  personalized: boolean
): HomepageEventCard {
  const venueFromForm = event.hostName?.trim();
  const hostName =
    venueFromForm ||
    event.host?.name?.trim() ||
    event.teacher.studioName?.trim() ||
    event.teacher.fullName.trim();
  const category =
    event.eventType != null && String(event.eventType).trim() !== ""
      ? normalizeTeacherUpcomingEventType(event.eventType)
      : inferHomepageEventCategory(event.title, hostName);
  const linkUrl = event.eventUrl?.trim();
  const href = linkUrl && /^https?:\/\//i.test(linkUrl) ? linkUrl : `/teachers/${event.teacher.slug}`;
  const external = Boolean(linkUrl && /^https?:\/\//i.test(linkUrl));
  const locationFromAddress = event.address?.trim();
  const location = locationFromAddress
    ? `${locationFromAddress} · ${event.teacher.city}`
    : buildHomepageEventLocation(event.teacher);
  const detailParts = [
    event.eventTime?.trim(),
    `Led by ${event.teacher.fullName}`
  ].filter(Boolean);

  return {
    id: event.id,
    teacherId: event.teacher.id,
    teacherSlug: event.teacher.slug,
    hostId: event.host?.id ?? event.hostId ?? undefined,
    sortDate: event.eventDate?.toISOString(),
    listedAt: event.createdAt.toISOString(),
    title: event.title,
    dateRange: event.eventDate ? formatEventCalendarDayUtc(event.eventDate) ?? "Upcoming" : "Upcoming",
    host: hostName,
    location,
    detail: detailParts.join(" · "),
    href,
    external,
    imageSrc: buildHomepageEventImage(
      `${event.id}:${event.title}:${hostName}`,
      category,
      event.teacher,
      event.host,
      resolveTeacherUpcomingEventImageUrl({
        id: event.id,
        imageUrl: event.imageUrl,
        eventImageMimeType: event.eventImageMimeType
      })
    ),
    imageAlt: `${event.title} event image`,
    category,
    featuredLabel: personalized ? FOLLOWED_EVENT_LABEL : undefined,
    isFollowedTeacher: followedTeacherIds.has(event.teacher.id),
    isFollowedHost: event.host?.id ? followedHostIds.has(event.host.id) : event.hostId ? followedHostIds.has(event.hostId) : false
  };
}

function dedupeHomepageEvents(events: HomepageEventCard[]) {
  const seen = new Set<string>();

  return events.filter((event) => {
    if (seen.has(event.id)) {
      return false;
    }

    seen.add(event.id);
    return true;
  });
}

function sortHomepageFeaturedEventsByListingTime(events: HomepageEventCard[]) {
  return [...events].sort((first, second) => {
    const firstTime = first.listedAt ? new Date(first.listedAt).getTime() : 0;
    const secondTime = second.listedAt ? new Date(second.listedAt).getTime() : 0;

    if (secondTime !== firstTime) {
      return secondTime - firstTime;
    }

    return first.title.localeCompare(second.title);
  });
}

function isHomepageFeaturedEventCard(event: HomepageEventCard) {
  const now = new Date();
  const monthStart = startOfDay(startOfMonth(now));
  const monthEnd = endOfMonth(now);

  if (event.sortDate) {
    const eventDay = startOfDay(new Date(event.sortDate));
    if (isBefore(eventDay, getTodayStart())) {
      return false;
    }
  }

  const anchor = event.listedAt ?? event.sortDate;
  if (!anchor) {
    return true;
  }

  return isWithinInterval(new Date(anchor), { start: monthStart, end: monthEnd });
}

function filterHomepageEventsByKeywords(events: HomepageEventCard[], keywords: string[]) {
  if (keywords.length === 0) {
    return events;
  }

  return events.filter(
    (event) =>
      !matchesKeywordFilter([event.title, event.host, event.location, event.detail, event.category], keywords)
  );
}

function filterHomepageJobsByKeywords(jobs: HomepageJobCard[], keywords: string[]) {
  if (keywords.length === 0) {
    return jobs;
  }

  return jobs.filter(
    (job) =>
      !matchesKeywordFilter(
        [job.title, job.category, job.pay, job.company, job.location, job.posted, job.applyUrl ?? ""],
        keywords
      )
  );
}

function includesCollegeOfSanMateo(value?: string | null) {
  return value?.toLowerCase().includes("college of san mateo") ?? false;
}

function isHiddenHomepageUpcomingEvent(event: {
  title: string;
  hostName?: string | null;
  eventUrl?: string | null;
  teacher: {
    studioName?: string | null;
  };
}) {
  const url = event.eventUrl?.toLowerCase() ?? "";
  return (
    includesCollegeOfSanMateo(event.title) ||
    includesCollegeOfSanMateo(event.hostName) ||
    includesCollegeOfSanMateo(event.teacher.studioName) ||
    (url.length > 0 && url.includes("collegeofsanmateo.edu"))
  );
}

function buildFallbackEventHost(name: string, websiteUrl?: string | null) {
  const existing = demoEventHosts.find((host) => host.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return existing;
  }

  const created: EventHost = {
    id: `host-${slugifyLabel(name)}`,
    name,
    slug: slugifyLabel(name),
    websiteUrl: websiteUrl ?? undefined
  };
  demoEventHosts.push(created);
  return created;
}

async function upsertEventHost(name: string, websiteUrl?: string | null) {
  if (!name.trim()) {
    return null;
  }

  if (!hasEventFollowClientSupport()) {
    return buildFallbackEventHost(name, websiteUrl);
  }

  try {
    const host = await db.eventHost.upsert({
      where: { name },
      update: {
        websiteUrl: websiteUrl ?? undefined
      },
      create: {
        id: `host-${slugifyLabel(name)}`,
        name,
        slug: slugifyLabel(name),
        websiteUrl: websiteUrl ?? undefined
      }
    });

    return mapEventHost(host);
  } catch (error) {
    if (isMissingEventFollowInfrastructure(error)) {
      return buildFallbackEventHost(name, websiteUrl);
    }

    throw error;
  }
}

async function syncEventHostsFromUpcomingEvents() {
  if (!hasEventFollowClientSupport()) {
    return;
  }

  try {
    const eventsWithoutHosts = await db.teacherUpcomingEvent.findMany({
      where: {
        hostName: { not: null },
        hostId: null
      },
      select: {
        id: true,
        hostName: true,
        eventUrl: true,
        teacher: {
          select: {
            studioName: true,
            studioWebsiteUrl: true
          }
        }
      }
    });

    for (const event of eventsWithoutHosts) {
      const hostName = event.hostName?.trim();
      if (!hostName) continue;
      const fallbackWebsiteUrl =
        event.teacher.studioName?.toLowerCase() === hostName.toLowerCase()
          ? event.teacher.studioWebsiteUrl
          : /^https?:\/\//.test(event.eventUrl ?? "")
            ? event.eventUrl
            : null;

      const host = await upsertEventHost(hostName, fallbackWebsiteUrl);

      if (!host) continue;

      await db.teacherUpcomingEvent.update({
        where: { id: event.id },
        data: { hostId: host.id }
      });
    }
  } catch (error) {
    if (isMissingEventFollowInfrastructure(error)) {
      return;
    }

    throw error;
  }
}

async function listPersistedHomepageEvents(options: {
  followedTeacherIds?: string[];
  followedHostIds?: string[];
  personalized?: boolean;
  limit?: number;
}) {
  if (!hasEventFollowClientSupport()) {
    const filters: Prisma.TeacherUpcomingEventWhereInput[] = [];

    if (options.followedTeacherIds?.length) {
      filters.push({ teacherId: { in: options.followedTeacherIds } });
    }

    if (options.personalized && filters.length === 0) {
      return [];
    }

    const where = {
      teacher: { is: { published: true } },
      AND: [getHomepagePersistedNewListingsWhere(), ...(options.personalized ? [{ OR: filters }] : [])]
    };

    const orderBy = [{ createdAt: "desc" as const }];
    const take = options.limit ?? HOMEPAGE_EVENT_QUERY_LIMIT;

    const selectWithLocation = {
      id: true,
      teacherId: true,
      title: true,
      eventType: true,
      hostName: true,
      address: true,
      eventTime: true,
      imageUrl: true,
      eventImageMimeType: true,
      eventUrl: true,
      eventDate: true,
      createdAt: true,
      teacher: {
        select: {
          id: true,
          slug: true,
          fullName: true,
          city: true,
          avatarUrl: true,
          studioName: true,
          stories: {
            where: {
              published: true,
              mediaType: StoryMediaType.IMAGE
            },
            orderBy: { sortOrder: "asc" as const },
            take: 1,
            select: { mediaUrl: true }
          }
        }
      }
    };

    const selectWithoutLocation = {
      id: true,
      teacherId: true,
      title: true,
      eventType: true,
      hostName: true,
      imageUrl: true,
      eventImageMimeType: true,
      eventUrl: true,
      eventDate: true,
      createdAt: true,
      teacher: selectWithLocation.teacher
    };

    const selectWithLocationStalePrismaClient = {
      id: true,
      teacherId: true,
      title: true,
      hostName: true,
      address: true,
      eventTime: true,
      imageUrl: true,
      eventUrl: true,
      eventDate: true,
      createdAt: true,
      teacher: selectWithLocation.teacher
    };

    const selectWithoutLocationStalePrismaClient = {
      id: true,
      teacherId: true,
      title: true,
      hostName: true,
      imageUrl: true,
      eventUrl: true,
      eventDate: true,
      createdAt: true,
      teacher: selectWithLocation.teacher
    };

    let events;
    try {
      events = await db.teacherUpcomingEvent.findMany({
        where,
        orderBy,
        take,
        select: selectWithLocation
      });
    } catch (error) {
      if (isStalePrismaTeacherUpcomingEventSchemaField(error)) {
        events = await db.teacherUpcomingEvent.findMany({
          where,
          orderBy,
          take,
          select: selectWithLocationStalePrismaClient
        });
      } else if (isMissingTeacherUpcomingEventLocationColumns(error)) {
        try {
          events = await db.teacherUpcomingEvent.findMany({
            where,
            orderBy,
            take,
            select: selectWithoutLocation
          });
        } catch (error2) {
          if (isStalePrismaTeacherUpcomingEventSchemaField(error2)) {
            events = await db.teacherUpcomingEvent.findMany({
              where,
              orderBy,
              take,
              select: selectWithoutLocationStalePrismaClient
            });
          } else {
            throw error2;
          }
        }
      } else {
        throw error;
      }
    }

    const followedTeacherIds = new Set(options.followedTeacherIds ?? []);

    return events
      .filter((event) => !isHiddenHomepageUpcomingEvent(event))
      .map((event) =>
        mapPersonalizedEventCard(
          { ...event, hostId: null, host: null },
          followedTeacherIds,
          new Set<string>(),
          Boolean(options.personalized)
        )
      );
  }

  try {
    const filters: Prisma.TeacherUpcomingEventWhereInput[] = [];

    if (options.followedTeacherIds?.length) {
      filters.push({ teacherId: { in: options.followedTeacherIds } });
    }

    if (options.followedHostIds?.length) {
      filters.push({ hostId: { in: options.followedHostIds } });
    }

    if (options.personalized && filters.length === 0) {
      return [];
    }

    const where = {
      teacher: { is: { published: true } },
      AND: [getHomepagePersistedNewListingsWhere(), ...(options.personalized ? [{ OR: filters }] : [])]
    };

    const orderBy = [{ createdAt: "desc" as const }];
    const take = options.limit ?? HOMEPAGE_EVENT_QUERY_LIMIT;

    const teacherCardSelect = {
      id: true,
      slug: true,
      fullName: true,
      city: true,
      avatarUrl: true,
      studioName: true,
      stories: {
        where: {
          published: true,
          mediaType: StoryMediaType.IMAGE
        },
        orderBy: { sortOrder: "asc" as const },
        take: 1,
        select: { mediaUrl: true }
      }
    };

    const hostCardSelect = {
      id: true,
      name: true,
      slug: true,
      websiteUrl: true,
      imageUrl: true
    };

    const selectWithLocationAndHost = {
      id: true,
      teacherId: true,
      hostId: true,
      title: true,
      eventType: true,
      hostName: true,
      address: true,
      eventTime: true,
      imageUrl: true,
      eventImageMimeType: true,
      eventUrl: true,
      eventDate: true,
      createdAt: true,
      teacher: { select: teacherCardSelect },
      host: { select: hostCardSelect }
    };

    const selectWithoutLocationAndHost = {
      id: true,
      teacherId: true,
      hostId: true,
      title: true,
      eventType: true,
      hostName: true,
      imageUrl: true,
      eventImageMimeType: true,
      eventUrl: true,
      eventDate: true,
      createdAt: true,
      teacher: { select: teacherCardSelect },
      host: { select: hostCardSelect }
    };

    const selectWithLocationAndHostStalePrismaClient = {
      id: true,
      teacherId: true,
      hostId: true,
      title: true,
      hostName: true,
      address: true,
      eventTime: true,
      imageUrl: true,
      eventUrl: true,
      eventDate: true,
      createdAt: true,
      teacher: { select: teacherCardSelect },
      host: { select: hostCardSelect }
    };

    const selectWithoutLocationAndHostStalePrismaClient = {
      id: true,
      teacherId: true,
      hostId: true,
      title: true,
      hostName: true,
      imageUrl: true,
      eventUrl: true,
      eventDate: true,
      createdAt: true,
      teacher: { select: teacherCardSelect },
      host: { select: hostCardSelect }
    };

    let events;
    try {
      events = await db.teacherUpcomingEvent.findMany({
        where,
        orderBy,
        take,
        select: selectWithLocationAndHost
      });
    } catch (innerError) {
      if (isStalePrismaTeacherUpcomingEventSchemaField(innerError)) {
        events = await db.teacherUpcomingEvent.findMany({
          where,
          orderBy,
          take,
          select: selectWithLocationAndHostStalePrismaClient
        });
      } else if (isMissingTeacherUpcomingEventLocationColumns(innerError)) {
        try {
          events = await db.teacherUpcomingEvent.findMany({
            where,
            orderBy,
            take,
            select: selectWithoutLocationAndHost
          });
        } catch (innerError2) {
          if (isStalePrismaTeacherUpcomingEventSchemaField(innerError2)) {
            events = await db.teacherUpcomingEvent.findMany({
              where,
              orderBy,
              take,
              select: selectWithoutLocationAndHostStalePrismaClient
            });
          } else {
            throw innerError2;
          }
        }
      } else {
        throw innerError;
      }
    }

    const followedTeacherIds = new Set(options.followedTeacherIds ?? []);
    const followedHostIds = new Set(options.followedHostIds ?? []);

    return events
      .filter((event) => !isHiddenHomepageUpcomingEvent(event))
      .map((event) =>
        mapPersonalizedEventCard(event, followedTeacherIds, followedHostIds, Boolean(options.personalized))
      );
  } catch (error) {
    if (isMissingEventFollowInfrastructure(error)) {
      return [];
    }

    throw error;
  }
}

export async function listFollowedTeacherIds(userId: string) {
  if (!hasEventFollowClientSupport()) {
    return demoUserTeacherFollows.filter((follow) => follow.userId === userId).map((follow) => follow.teacherId);
  }

  try {
    const follows = await db.userTeacherFollow.findMany({
      where: { userId },
      select: { teacherId: true }
    });

    return follows.map((follow) => follow.teacherId);
  } catch (error) {
    if (isMissingEventFollowInfrastructure(error)) {
      return demoUserTeacherFollows.filter((follow) => follow.userId === userId).map((follow) => follow.teacherId);
    }

    throw error;
  }
}

export async function listFollowedEventHostIds(userId: string) {
  if (!hasEventFollowClientSupport()) {
    return demoUserEventHostFollows.filter((follow) => follow.userId === userId).map((follow) => follow.hostId);
  }

  try {
    const follows = await db.userEventHostFollow.findMany({
      where: { userId },
      select: { hostId: true }
    });

    return follows.map((follow) => follow.hostId);
  } catch (error) {
    if (isMissingEventFollowInfrastructure(error)) {
      return demoUserEventHostFollows.filter((follow) => follow.userId === userId).map((follow) => follow.hostId);
    }

    throw error;
  }
}

export async function isTeacherFollowedByUser(userId: string, teacherId: string) {
  const followedTeacherIds = await listFollowedTeacherIds(userId);
  return followedTeacherIds.includes(teacherId);
}

export async function followTeacherForUser(userId: string, teacherId: string) {
  if (!hasEventFollowClientSupport()) {
    if (!demoUserTeacherFollows.some((follow) => follow.userId === userId && follow.teacherId === teacherId)) {
      demoUserTeacherFollows.push({
        id: `follow-teacher-${userId}-${teacherId}`,
        userId,
        teacherId,
        createdAt: new Date().toISOString()
      });
    }

    return;
  }

  try {
    await db.userTeacherFollow.upsert({
      where: {
        userId_teacherId: {
          userId,
          teacherId
        }
      },
      update: {},
      create: {
        id: `follow-teacher-${userId}-${teacherId}`,
        userId,
        teacherId
      }
    });
  } catch (error) {
    if (!isMissingEventFollowInfrastructure(error)) {
      throw error;
    }

    if (!demoUserTeacherFollows.some((follow) => follow.userId === userId && follow.teacherId === teacherId)) {
      demoUserTeacherFollows.push({
        id: `follow-teacher-${userId}-${teacherId}`,
        userId,
        teacherId,
        createdAt: new Date().toISOString()
      });
    }
  }
}

export async function unfollowTeacherForUser(userId: string, teacherId: string) {
  if (!hasEventFollowClientSupport()) {
    const fallbackIndex = demoUserTeacherFollows.findIndex((follow) => follow.userId === userId && follow.teacherId === teacherId);
    if (fallbackIndex >= 0) {
      demoUserTeacherFollows.splice(fallbackIndex, 1);
    }

    return;
  }

  try {
    await db.userTeacherFollow.deleteMany({
      where: {
        userId,
        teacherId
      }
    });
  } catch (error) {
    if (!isMissingEventFollowInfrastructure(error)) {
      throw error;
    }
  }

  const fallbackIndex = demoUserTeacherFollows.findIndex((follow) => follow.userId === userId && follow.teacherId === teacherId);
  if (fallbackIndex >= 0) {
    demoUserTeacherFollows.splice(fallbackIndex, 1);
  }
}

export async function mayUserRecordHeartOnTeacher(actorUserId: string, teacherId: string): Promise<boolean> {
  try {
    if (hasTeacherHeartClientSupport()) {
      const teacher = await db.teacher.findUnique({ where: { id: teacherId }, select: { userId: true } });
      if (!teacher) {
        return false;
      }
      return teacher.userId !== actorUserId;
    }
  } catch (error) {
    if (!isMissingTeacherHeartInfrastructure(error)) {
      throw error;
    }
  }

  const t = demoTeachers.find((x) => x.id === teacherId);
  if (!t) {
    return false;
  }
  return t.userId !== actorUserId;
}

export async function countTeacherHeartsForTeachers(teacherIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  for (const id of teacherIds) {
    map.set(id, 0);
  }
  if (teacherIds.length === 0) {
    return map;
  }

  if (!hasTeacherHeartClientSupport()) {
    if (isTeacherHeartProductionRuntime()) {
      warnTeacherHeartDemoFallback("Prisma client has no userTeacherHeart delegate (run prisma generate + redeploy)");
      return map;
    }
    for (const h of demoUserTeacherHearts) {
      if (teacherIds.includes(h.teacherId)) {
        map.set(h.teacherId, (map.get(h.teacherId) ?? 0) + 1);
      }
    }
    return map;
  }

  try {
    const rows = await db.userTeacherHeart.groupBy({
      by: ["teacherId"],
      where: { teacherId: { in: teacherIds } },
      _count: { _all: true }
    });
    for (const row of rows) {
      map.set(row.teacherId, row._count._all);
    }
    return map;
  } catch (error) {
    if (!isMissingTeacherHeartInfrastructure(error)) {
      throw error;
    }
    if (isTeacherHeartProductionRuntime()) {
      warnTeacherHeartDemoFallback("UserTeacherHeart groupBy failed (table missing or DB error?)", error);
      return map;
    }
    warnTeacherHeartDemoFallback("UserTeacherHeart groupBy failed; using demo counts", error);
    for (const h of demoUserTeacherHearts) {
      if (teacherIds.includes(h.teacherId)) {
        map.set(h.teacherId, (map.get(h.teacherId) ?? 0) + 1);
      }
    }
    return map;
  }
}

export async function countTeacherHearts(teacherId: string): Promise<number> {
  const counts = await countTeacherHeartsForTeachers([teacherId]);
  return counts.get(teacherId) ?? 0;
}

export async function listTeacherIdsHeartedByUser(userId: string, teacherIds: string[]): Promise<Set<string>> {
  if (teacherIds.length === 0) {
    return new Set();
  }

  if (!hasTeacherHeartClientSupport()) {
    if (isTeacherHeartProductionRuntime()) {
      warnTeacherHeartDemoFallback("Prisma client has no userTeacherHeart delegate (run prisma generate + redeploy)");
      return new Set();
    }
    return new Set(
      demoUserTeacherHearts.filter((h) => h.userId === userId && teacherIds.includes(h.teacherId)).map((h) => h.teacherId)
    );
  }

  try {
    const rows = await db.userTeacherHeart.findMany({
      where: { userId, teacherId: { in: teacherIds } },
      select: { teacherId: true }
    });
    return new Set(rows.map((r) => r.teacherId));
  } catch (error) {
    if (!isMissingTeacherHeartInfrastructure(error)) {
      throw error;
    }
    if (isTeacherHeartProductionRuntime()) {
      warnTeacherHeartDemoFallback("UserTeacherHeart findMany failed (table missing or DB error?)", error);
      return new Set();
    }
    warnTeacherHeartDemoFallback("UserTeacherHeart findMany failed; using demo hearts", error);
    return new Set(
      demoUserTeacherHearts.filter((h) => h.userId === userId && teacherIds.includes(h.teacherId)).map((h) => h.teacherId)
    );
  }
}

export async function isTeacherHeartedByUser(userId: string, teacherId: string): Promise<boolean> {
  const set = await listTeacherIdsHeartedByUser(userId, [teacherId]);
  return set.has(teacherId);
}

export async function heartTeacherForUser(userId: string, teacherId: string) {
  const allowed = await mayUserRecordHeartOnTeacher(userId, teacherId);
  if (!allowed) {
    return;
  }

  if (!hasTeacherHeartClientSupport()) {
    if (isTeacherHeartProductionRuntime()) {
      throwTeacherHeartPersistenceUnavailable("Cannot save heart.");
    }
    warnTeacherHeartDemoFallback("Prisma client has no userTeacherHeart delegate");
    if (!demoUserTeacherHearts.some((h) => h.userId === userId && h.teacherId === teacherId)) {
      demoUserTeacherHearts.push({
        id: `heart-teacher-${userId}-${teacherId}`,
        userId,
        teacherId,
        createdAt: new Date().toISOString()
      });
    }
    return;
  }

  try {
    await db.userTeacherHeart.upsert({
      where: {
        userId_teacherId: {
          userId,
          teacherId
        }
      },
      update: {},
      create: {
        id: `heart-teacher-${userId}-${teacherId}`,
        userId,
        teacherId
      }
    });
  } catch (error) {
    if (!isMissingTeacherHeartInfrastructure(error)) {
      throw error;
    }
    if (isTeacherHeartProductionRuntime()) {
      console.error("[UserTeacherHeart] upsert failed in production (table or client mismatch).", error);
      throw new Error(
        `Cannot save heart: ${error instanceof Error ? error.message : String(error)}. Ensure the UserTeacherHeart migration is applied and the deployed app ran prisma generate.`
      );
    }
    warnTeacherHeartDemoFallback("UserTeacherHeart upsert failed; using demo store", error);
    if (!demoUserTeacherHearts.some((h) => h.userId === userId && h.teacherId === teacherId)) {
      demoUserTeacherHearts.push({
        id: `heart-teacher-${userId}-${teacherId}`,
        userId,
        teacherId,
        createdAt: new Date().toISOString()
      });
    }
  }
}

export async function unheartTeacherForUser(userId: string, teacherId: string) {
  if (!hasTeacherHeartClientSupport()) {
    if (isTeacherHeartProductionRuntime()) {
      throwTeacherHeartPersistenceUnavailable("Cannot remove heart.");
    }
    const fallbackIndex = demoUserTeacherHearts.findIndex((h) => h.userId === userId && h.teacherId === teacherId);
    if (fallbackIndex >= 0) {
      demoUserTeacherHearts.splice(fallbackIndex, 1);
    }
    return;
  }

  try {
    await db.userTeacherHeart.deleteMany({
      where: {
        userId,
        teacherId
      }
    });
  } catch (error) {
    if (!isMissingTeacherHeartInfrastructure(error)) {
      throw error;
    }
    if (isTeacherHeartProductionRuntime()) {
      console.error("[UserTeacherHeart] deleteMany failed in production.", error);
      throw new Error(
        `Cannot remove heart: ${error instanceof Error ? error.message : String(error)}. Ensure the UserTeacherHeart migration is applied and the deployed app ran prisma generate.`
      );
    }
    warnTeacherHeartDemoFallback("UserTeacherHeart deleteMany failed; using demo store", error);
  }

  const fallbackIndex = demoUserTeacherHearts.findIndex((h) => h.userId === userId && h.teacherId === teacherId);
  if (fallbackIndex >= 0) {
    demoUserTeacherHearts.splice(fallbackIndex, 1);
  }
}

export async function followEventHostForUser(userId: string, hostId: string) {
  if (!hasEventFollowClientSupport()) {
    if (!demoUserEventHostFollows.some((follow) => follow.userId === userId && follow.hostId === hostId)) {
      demoUserEventHostFollows.push({
        id: `follow-host-${userId}-${hostId}`,
        userId,
        hostId,
        createdAt: new Date().toISOString()
      });
    }

    return;
  }

  try {
    await db.userEventHostFollow.upsert({
      where: {
        userId_hostId: {
          userId,
          hostId
        }
      },
      update: {},
      create: {
        id: `follow-host-${userId}-${hostId}`,
        userId,
        hostId
      }
    });
  } catch (error) {
    if (!isMissingEventFollowInfrastructure(error)) {
      throw error;
    }

    if (!demoUserEventHostFollows.some((follow) => follow.userId === userId && follow.hostId === hostId)) {
      demoUserEventHostFollows.push({
        id: `follow-host-${userId}-${hostId}`,
        userId,
        hostId,
        createdAt: new Date().toISOString()
      });
    }
  }
}

export async function unfollowEventHostForUser(userId: string, hostId: string) {
  if (!hasEventFollowClientSupport()) {
    const fallbackIndex = demoUserEventHostFollows.findIndex((follow) => follow.userId === userId && follow.hostId === hostId);
    if (fallbackIndex >= 0) {
      demoUserEventHostFollows.splice(fallbackIndex, 1);
    }

    return;
  }

  try {
    await db.userEventHostFollow.deleteMany({
      where: {
        userId,
        hostId
      }
    });
  } catch (error) {
    if (!isMissingEventFollowInfrastructure(error)) {
      throw error;
    }
  }

  const fallbackIndex = demoUserEventHostFollows.findIndex((follow) => follow.userId === userId && follow.hostId === hostId);
  if (fallbackIndex >= 0) {
    demoUserEventHostFollows.splice(fallbackIndex, 1);
  }
}

export async function listHomepageFeaturedEvents(userId?: string) {
  await syncEventHostsFromUpcomingEvents();
  const contentFilters = await getAdminContentFilters();

  const followedTeacherIds = userId ? await listFollowedTeacherIds(userId) : [];
  const followedHostIds = userId ? await listFollowedEventHostIds(userId) : [];
  const hasNoFollows = Boolean(userId) && followedTeacherIds.length === 0 && followedHostIds.length === 0;

  if (userId && (followedTeacherIds.length > 0 || followedHostIds.length > 0)) {
    const personalizedEvents = await listPersistedHomepageEvents({
      followedTeacherIds,
      followedHostIds,
      personalized: true,
      limit: HOMEPAGE_EVENT_QUERY_LIMIT
    });

    if (personalizedEvents.length > 0) {
      const genericEvents = await listPersistedHomepageEvents({
        personalized: false,
        limit: HOMEPAGE_EVENT_QUERY_LIMIT
      });

      return filterHomepageEventsByKeywords(
        sortHomepageFeaturedEventsByListingTime(
          dedupeHomepageEvents([...personalizedEvents, ...genericEvents]).filter(isHomepageFeaturedEventCard)
        ),
        contentFilters.hiddenEventKeywords
      ).slice(0, HOMEPAGE_EVENT_LIMIT);
    }
  }

  const genericEvents = await listPersistedHomepageEvents({
    personalized: false,
    limit: HOMEPAGE_EVENT_QUERY_LIMIT
  });

  const fallbackEvents = filterHomepageEventsByKeywords(
    dedupeHomepageEvents(genericEvents).filter(isHomepageFeaturedEventCard),
    contentFilters.hiddenEventKeywords
  );

  if (hasNoFollows) {
    return sortHomepageFeaturedEventsByListingTime(fallbackEvents).slice(0, NO_FOLLOW_EVENT_LIMIT);
  }

  return sortHomepageFeaturedEventsByListingTime(fallbackEvents).slice(0, HOMEPAGE_EVENT_LIMIT);
}

export async function listHomepageLocalGigs() {
  const contentFilters = await getAdminContentFilters();
  const hidden = contentFilters.hiddenJobKeywords;

  const useMockJobs = process.env.USE_MOCK_JOBS === "true";
  const hasAdzunaCreds = Boolean(process.env.ADZUNA_APP_ID?.trim() && process.env.ADZUNA_APP_KEY?.trim());

  let jobs: HomepageJobCard[] = [];

  if (hasAdzunaCreds) {
    try {
      jobs = await getCachedHomepageExternalJobs();
    } catch (err) {
      console.error("[listHomepageLocalGigs] external job search failed", err);
      jobs = [];
    }
  } else if (useMockJobs) {
    jobs = HOMEPAGE_LOCAL_GIGS;
  }

  return filterHomepageJobsByKeywords(jobs, hidden);
}

export async function incrementTeachingHoursInDb(teacherId: string, category: ServiceCategory, minutesAdded: number) {
  if (minutesAdded <= 0) {
    return;
  }

  const deltaHours = minutesAdded / 60;
  const stableId = `hours-${teacherId}-${category}`;

  await db.teachingHourCounter.upsert({
    where: { teacherId_category: { teacherId, category } },
    update: { totalHours: { increment: deltaHours } },
    create: { id: stableId, teacherId, category, totalHours: deltaHours }
  });
}

export async function getUserById(userId: string) {
  const user = await withUserEmailVerificationFallback([
    () =>
      db.user.findUnique({
        where: { id: userId },
        select: userSelect
      }),
    () =>
      db.user.findUnique({
        where: { id: userId },
        select: legacyUserSelect
      })
  ]);

  return user ? mapUser(user) : null;
}

export async function getUserByEmail(email: string) {
  const user = await withUserEmailVerificationFallback([
    () =>
      db.user.findUnique({
        where: { email: email.toLowerCase() },
        select: userSelect
      }),
    () =>
      db.user.findUnique({
        where: { email: email.toLowerCase() },
        select: legacyUserSelect
      })
  ]);

  return user ? mapUser(user) : null;
}

export async function createUser(input: Pick<AppUser, "email" | "password" | "name" | "role"> & { emailVerifiedAt?: string }) {
  const createData = {
    id: `user-${Date.now()}`,
    email: input.email.toLowerCase(),
    password: input.password,
    role: mapRoleToDb(input.role),
    name: input.name,
    ...(input.emailVerifiedAt ? { emailVerifiedAt: new Date(input.emailVerifiedAt) } : {})
  };

  const user = await withUserEmailVerificationFallback([
    () =>
      db.user.create({
        data: createData,
        select: userSelect
      }),
    () =>
      db.user.create({
        data: {
          id: createData.id,
          email: createData.email,
          password: createData.password,
          role: createData.role,
          name: createData.name
        },
        select: legacyUserSelect
      })
  ]);

  return mapUser(user);
}

export async function listUsersForAdmin() {
  try {
    return (await listAdminUserRecords()).map(mapAdminManagedUser);
  } catch {
    return listUsersForAdminInStore();
  }
}

export async function getAdminContentFilters(): Promise<AdminContentFilters> {
  if (!hasAdminContentSettingsClientSupport()) {
    return getAdminContentFiltersFromStore();
  }

  try {
    const settings = await db.adminContentSettings.findUnique({
      where: { id: ADMIN_CONTENT_SETTINGS_ID },
      select: {
        hiddenEventKeywords: true,
        hiddenJobKeywords: true
      }
    });

    return settings
      ? {
          hiddenEventKeywords: normalizeKeywordList(settings.hiddenEventKeywords),
          hiddenJobKeywords: normalizeKeywordList(settings.hiddenJobKeywords)
        }
      : DEFAULT_ADMIN_CONTENT_FILTERS;
  } catch (error) {
    if (!isMissingAdminContentSettingsInfrastructure(error)) {
      throw error;
    }

    return getAdminContentFiltersFromStore();
  }
}

export async function updateAdminContentFilters(input: AdminContentFilters) {
  const normalizedInput = {
    hiddenEventKeywords: normalizeKeywordList(input.hiddenEventKeywords),
    hiddenJobKeywords: normalizeKeywordList(input.hiddenJobKeywords)
  };

  if (!hasAdminContentSettingsClientSupport()) {
    return updateAdminContentFiltersInStore(normalizedInput);
  }

  try {
    const settings = await db.adminContentSettings.upsert({
      where: { id: ADMIN_CONTENT_SETTINGS_ID },
      update: normalizedInput,
      create: {
        id: ADMIN_CONTENT_SETTINGS_ID,
        ...normalizedInput
      },
      select: {
        hiddenEventKeywords: true,
        hiddenJobKeywords: true
      }
    });

    return {
      hiddenEventKeywords: normalizeKeywordList(settings.hiddenEventKeywords),
      hiddenJobKeywords: normalizeKeywordList(settings.hiddenJobKeywords)
    };
  } catch (error) {
    if (!isMissingAdminContentSettingsInfrastructure(error)) {
      throw error;
    }

    return updateAdminContentFiltersInStore(normalizedInput);
  }
}

export async function updateUserForAdmin(
  userId: string,
  input: Pick<AppUser, "name" | "email" | "role">
) : Promise<AdminUserUpdateResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const trimmedName = input.name.trim();

  const existingUser = await getAdminUserRecordById(userId);

  if (!existingUser) {
    throw new Error("User not found.");
  }

  const emailChanged = existingUser.email.toLowerCase() !== normalizedEmail;

  const duplicate = await db.user.findFirst({
    where: {
      email: normalizedEmail,
      NOT: { id: userId }
    },
    select: { id: true }
  });

  if (duplicate) {
    throw new Error("That email is already in use.");
  }

  if (emailChanged) {
    const conflictingPendingChange = await db.pendingUserEmailChange.findFirst({
      where: {
        normalizedNextEmail: normalizedEmail,
        consumedAt: null,
        cancelledAt: null,
        expiresAt: { gt: new Date() },
        NOT: { userId }
      },
      select: { id: true }
    });

    if (conflictingPendingChange) {
      throw new Error("That email is already waiting for confirmation.");
    }
  }

  const updatedUser = await (async () => {
    try {
      return await db.user.update({
        where: { id: userId },
        data: {
          name: trimmedName,
          role: mapRoleToDb(input.role)
        },
        select: adminUserSelect
      });
    } catch (error) {
      if (!isMissingUserEmailVerificationInfrastructure(error) && !isMissingPendingUserEmailChangeInfrastructure(error)) {
        throw error;
      }

      return await db.user.update({
        where: { id: userId },
        data: {
          name: trimmedName,
          role: mapRoleToDb(input.role)
        },
        select: legacyAdminUserSelect
      });
    }
  })();

  if (input.role === "teacher") {
    await ensureTeacherProfile(userId, trimmedName);
  } else if (existingUser.teacher?.id) {
    try {
      await db.teacher.update({
        where: { id: existingUser.teacher.id },
        data: {
          userId: null,
          claimEmail: buildClaimableEmail(existingUser.email)
        },
        select: { id: true }
      });
    } catch (error) {
      if (!isMissingTeacherImportInfrastructure(error)) {
        throw error;
      }

      await db.teacher.update({
        where: { id: existingUser.teacher.id },
        data: { userId: null },
        select: { id: true }
      });
    }
  }

  if (!emailChanged) {
    return {
      user: mapAdminManagedUser(updatedUser),
      emailChangeRequested: false
    };
  }

  const pendingEmailChangeId = `pending-email-change-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await db.$transaction(async (tx) => {
    await tx.pendingUserEmailChange.updateMany({
      where: {
        userId,
        consumedAt: null,
        cancelledAt: null
      },
      data: {
        cancelledAt: new Date()
      }
    });

    await tx.pendingUserEmailChange.create({
      data: {
        id: pendingEmailChangeId,
        userId,
        previousEmail: existingUser.email,
        nextEmail: normalizedEmail,
        normalizedNextEmail: normalizedEmail,
        tokenHash,
        expiresAt
      }
    });
  });

  const verificationUrl = `${getAppBaseUrl()}/auth/confirm-email-change/complete?token=${rawToken}`;

  try {
    await sendEmailChangeVerificationEmail({
      email: normalizedEmail,
      name: trimmedName,
      verificationUrl
    });
  } catch (error) {
    await db.pendingUserEmailChange.updateMany({
      where: {
        userId,
        consumedAt: null,
        cancelledAt: null,
        normalizedNextEmail: normalizedEmail
      },
      data: {
        cancelledAt: new Date()
      }
    });

    throw error;
  }

  return {
    user: {
      ...mapAdminManagedUser(updatedUser),
      pendingEmailChangeTo: normalizedEmail,
      pendingEmailChangeRequestedAt: new Date().toISOString()
    },
    emailChangeRequested: true
  };
}

export async function deleteUserForAdmin(userId: string) {
  try {
    const existingUser = await getAdminUserRecordById(userId);

    if (!existingUser) {
      throw new Error("User not found.");
    }

    await db.$transaction(async (tx) => {
      if (existingUser.teacher?.id) {
        try {
          await tx.teacher.update({
            where: { id: existingUser.teacher.id },
            data: {
              userId: null,
              claimEmail: buildClaimableEmail(existingUser.email)
            },
            select: { id: true }
          });
        } catch (error) {
          if (!isMissingTeacherImportInfrastructure(error)) {
            throw error;
          }

          await tx.teacher.update({
            where: { id: existingUser.teacher.id },
            data: { userId: null },
            select: { id: true }
          });
        }
      }

      await tx.pendingSignup.deleteMany({
        where: {
          normalizedEmail: existingUser.email.toLowerCase()
        }
      });

      await tx.user.delete({
        where: { id: userId }
      });
    });

    return mapAdminManagedUser(existingUser);
  } catch (error) {
    if (error instanceof Error && error.message === "User not found.") {
      throw error;
    }

    return deleteUserForAdminInStore(userId);
  }
}

type ConsumePendingUserEmailChangeResult =
  | { status: "invalid"; message: string }
  | { status: "expired"; message: string }
  | { status: "consumed"; message: string }
  | { status: "blocked"; message: string }
  | { status: "success"; email: string };

export async function consumePendingUserEmailChange(token: string): Promise<ConsumePendingUserEmailChangeResult> {
  const tokenHash = hashVerificationToken(token);
  const pendingChange = await db.pendingUserEmailChange.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      previousEmail: true,
      nextEmail: true,
      normalizedNextEmail: true,
      expiresAt: true,
      consumedAt: true,
      cancelledAt: true,
      user: {
        select: {
          id: true,
          email: true
        }
      }
    }
  });

  if (!pendingChange) {
    return {
      status: "invalid",
      message: "This email change link is invalid."
    };
  }

  if (pendingChange.consumedAt) {
    return {
      status: "consumed",
      message: "This email change link has already been used."
    };
  }

  if (pendingChange.cancelledAt) {
    return {
      status: "invalid",
      message: "This email change request is no longer active."
    };
  }

  if (pendingChange.expiresAt <= new Date()) {
    await db.pendingUserEmailChange.update({
      where: { id: pendingChange.id },
      data: {
        cancelledAt: new Date()
      }
    });

    return {
      status: "expired",
      message: "This email change link has expired. Ask an admin to send a new confirmation email."
    };
  }

  const duplicateUser = await db.user.findFirst({
    where: {
      email: pendingChange.normalizedNextEmail,
      NOT: { id: pendingChange.userId }
    },
    select: { id: true }
  });

  if (duplicateUser) {
    return {
      status: "blocked",
      message: "That email is already attached to another account."
    };
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: pendingChange.userId },
      data: {
        email: pendingChange.normalizedNextEmail,
        emailVerifiedAt: new Date()
      }
    });

    try {
      await tx.teacher.updateMany({
        where: {
          userId: pendingChange.userId
        },
        data: {
          claimEmail: pendingChange.normalizedNextEmail
        }
      });
    } catch (error) {
      if (!isMissingTeacherImportInfrastructure(error)) {
        throw error;
      }
    }

    await tx.pendingUserEmailChange.update({
      where: { id: pendingChange.id },
      data: {
        consumedAt: new Date()
      }
    });

    await tx.pendingUserEmailChange.updateMany({
      where: {
        userId: pendingChange.userId,
        consumedAt: null,
        cancelledAt: null,
        NOT: { id: pendingChange.id }
      },
      data: {
        cancelledAt: new Date()
      }
    });
  });

  return {
    status: "success",
    email: pendingChange.normalizedNextEmail
  };
}

export async function ensureTeacherProfile(userId: string, fullName: string) {
  const existingTeacher = await withTeacherCompatibilityFallback([
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelect
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectWithoutUpcomingLocation
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectWithoutCalendar
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectWithoutCalendarAndUpcomingLocation
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelect
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectWithoutUpcomingLocation
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectWithoutCalendar
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectWithoutCalendarAndUpcomingLocation
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectWithoutUpcomingLocationStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectWithoutCalendarStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectWithoutUpcomingLocationStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectWithoutCalendarStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient
      })
  ]);

  if (existingTeacher) {
    return hydratePersistedTeacher(existingTeacher);
  }

  try {
    await db.teacher.create({
      data: {
        id: `teacher-${Date.now()}`,
        userId,
        slug: await getUniqueTeacherSlug(fullName),
        fullName,
        city: "",
        serviceRadiusMiles: 0,
        training: "",
        experienceYears: 0,
        bio: "",
        gender: "other",
        certificationStatus: "not_certified",
        profileImportStatus: "not_started",
        published: false
      },
      select: { id: true }
    });
  } catch (error) {
    if (!isMissingTeacherImportInfrastructure(error)) {
      throw error;
    }

    await insertLegacyTeacherProfile(userId, fullName);
  }

  const teacher = await getTeacherByUserId(userId);
  if (!teacher) {
    throw new Error("Teacher profile could not be created.");
  }

  return teacher;
}

export async function getTeacherByUserId(userId: string) {
  const teacher = await withTeacherCompatibilityFallback([
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelect
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectWithoutUpcomingLocation
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectWithoutCalendar
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectWithoutCalendarAndUpcomingLocation
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelect
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectWithoutUpcomingLocation
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectWithoutCalendar
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectWithoutCalendarAndUpcomingLocation
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectWithoutUpcomingLocationStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectWithoutCalendarStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: teacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectWithoutUpcomingLocationStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectWithoutCalendarStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        select: legacyTeacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient
      })
  ]);

  return teacher ? hydratePersistedTeacher(teacher) : null;
}

export async function getTeacherBySlug(slug: string) {
  const teacher = await withTeacherCompatibilityFallback([
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: teacherSelect
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: teacherSelectWithoutUpcomingLocation
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: teacherSelectWithoutCalendar
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: teacherSelectWithoutCalendarAndUpcomingLocation
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: legacyTeacherSelect
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: legacyTeacherSelectWithoutUpcomingLocation
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: legacyTeacherSelectWithoutCalendar
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: legacyTeacherSelectWithoutCalendarAndUpcomingLocation
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: teacherSelectStalePrismaClient
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: teacherSelectWithoutUpcomingLocationStalePrismaClient
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: teacherSelectWithoutCalendarStalePrismaClient
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: teacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: legacyTeacherSelectStalePrismaClient
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: legacyTeacherSelectWithoutUpcomingLocationStalePrismaClient
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: legacyTeacherSelectWithoutCalendarStalePrismaClient
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        select: legacyTeacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient
      })
  ]);

  if (teacher) {
    return hydratePersistedTeacher(teacher);
  }

  const fallbackTeacher = demoTeachers.find((entry) => entry.slug === slug && entry.published);
  return fallbackTeacher ? hydrateFallbackTeacher(fallbackTeacher) : null;
}

export async function listTeachers() {
  const teachers = await withTeacherCompatibilityFallback([
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: teacherSelect,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: teacherSelectWithoutUpcomingLocation,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: teacherSelectWithoutCalendar,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: teacherSelectWithoutCalendarAndUpcomingLocation,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: legacyTeacherSelect,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: legacyTeacherSelectWithoutUpcomingLocation,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: legacyTeacherSelectWithoutCalendar,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: legacyTeacherSelectWithoutCalendarAndUpcomingLocation,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: teacherSelectStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: teacherSelectWithoutUpcomingLocationStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: teacherSelectWithoutCalendarStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: teacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: legacyTeacherSelectStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: legacyTeacherSelectWithoutUpcomingLocationStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: legacyTeacherSelectWithoutCalendarStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        select: legacyTeacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient,
        orderBy: { fullName: "asc" }
      })
  ]);

  const persistedTeachers = teachers.map(hydratePersistedTeacher);
  return [...persistedTeachers, ...listFallbackTeachers(persistedTeachers.map((teacher) => teacher.id))]
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function updateTeacherProfile(
  teacherId: string,
  input: Pick<
    Teacher,
    | "fullName"
    | "studioName"
    | "city"
    | "serviceRadiusMiles"
    | "training"
    | "experienceYears"
    | "bio"
    | "gender"
    | "certificationStatus"
    | "studioWebsiteUrl"
    | "studioScheduleUrl"
    | "websiteUrl"
    | "linkedinUrl"
    | "instagramUrl"
    | "facebookUrl"
  > & {
    avatarUrl?: string;
  }
) {
  const currentTeacher = await db.teacher.findUnique({
    where: { id: teacherId },
    select: { userId: true }
  });

  if (!currentTeacher) {
    throw new Error("Teacher not found.");
  }

  if (currentTeacher.userId) {
    await db.user.update({
      where: { id: currentTeacher.userId },
      data: { name: input.fullName }
    });
  }

  try {
    await db.teacher.update({
      where: { id: teacherId },
      data: {
        fullName: input.fullName,
        studioName: input.studioName?.trim() || null,
        city: input.city,
        serviceRadiusMiles: input.serviceRadiusMiles,
        training: input.training,
        experienceYears: input.experienceYears,
        bio: input.bio,
        gender: input.gender,
        certificationStatus: input.certificationStatus,
        studioWebsiteUrl: input.studioWebsiteUrl?.trim() || null,
        studioScheduleUrl: input.studioScheduleUrl?.trim() || null,
        websiteUrl: input.websiteUrl?.trim() || null,
        linkedinUrl: input.linkedinUrl?.trim() || null,
        instagramUrl: input.instagramUrl?.trim() || null,
        facebookUrl: input.facebookUrl?.trim() || null,
        ...(input.avatarUrl ? { avatarUrl: input.avatarUrl } : {}),
        published: true
      },
      select: { id: true }
    });
  } catch (error) {
    if (!isMissingTeacherImportInfrastructure(error)) {
      throw error;
    }

    await db.teacher.update({
      where: { id: teacherId },
      data: {
        fullName: input.fullName,
        studioName: input.studioName?.trim() || null,
        city: input.city,
        serviceRadiusMiles: input.serviceRadiusMiles,
        training: input.training,
        experienceYears: input.experienceYears,
        bio: input.bio,
        gender: input.gender,
        certificationStatus: input.certificationStatus,
        studioWebsiteUrl: input.studioWebsiteUrl?.trim() || null,
        studioScheduleUrl: input.studioScheduleUrl?.trim() || null,
        ...(input.avatarUrl ? { avatarUrl: input.avatarUrl } : {}),
        published: true
      },
      select: { id: true }
    });
  }

  if (!currentTeacher.userId) {
    throw new Error("Teacher is not linked to a user yet.");
  }

  const teacher = await getTeacherByUserId(currentTeacher.userId);
  if (!teacher) {
    throw new Error("Teacher not found after update.");
  }

  return teacher;
}

export async function updateTeacherPublicCalendarVisibility(teacherId: string, showPublicCalendar: boolean) {
  const currentTeacher = await db.teacher.findUnique({
    where: { id: teacherId },
    select: { userId: true }
  });

  if (!currentTeacher) {
    throw new Error("Teacher not found.");
  }

  try {
    await db.teacher.update({
      where: { id: teacherId },
      data: { showPublicCalendar },
      select: { id: true }
    });
  } catch (error) {
    if (!isMissingTeacherImportInfrastructure(error)) {
      throw error;
    }

    setTeacherPublicCalendarVisibility(teacherId, showPublicCalendar);
  }

  if (!currentTeacher.userId) {
    throw new Error("Teacher is not linked to a user yet.");
  }

  const teacher = await getTeacherByUserId(currentTeacher.userId);
  if (!teacher) {
    throw new Error("Teacher not found after calendar visibility update.");
  }

  return teacher;
}

export async function submitTeacherImportOnboarding(teacherId: string, input: TeacherImportSourceInput) {
  const teacher = await withTeacherCompatibilityFallback([
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: teacherSelect
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: teacherSelectWithoutUpcomingLocation
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: teacherSelectWithoutCalendar
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: teacherSelectWithoutCalendarAndUpcomingLocation
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: legacyTeacherSelect
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: legacyTeacherSelectWithoutUpcomingLocation
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: legacyTeacherSelectWithoutCalendar
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: legacyTeacherSelectWithoutCalendarAndUpcomingLocation
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: teacherSelectStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: teacherSelectWithoutUpcomingLocationStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: teacherSelectWithoutCalendarStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: teacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: legacyTeacherSelectStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: legacyTeacherSelectWithoutUpcomingLocationStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: legacyTeacherSelectWithoutCalendarStalePrismaClient
      }),
    () =>
      db.teacher.findUnique({
        where: { id: teacherId },
        select: legacyTeacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient
      })
  ]);

  if (!teacher) {
    throw new Error("Teacher not found.");
  }

  const hydratedTeacher = hydratePersistedTeacher(teacher);
  const draft = await buildTeacherImportDraft(hydratedTeacher, input);
  const requestedAt = new Date();
  const completedAt = draft.status === "completed" || draft.status === "failed" ? new Date() : null;

  try {
    await db.teacher.update({
      where: { id: teacherId },
      data: {
        ...draft.fields,
        profileImportConsent: input.profileImportConsent,
        profileImportRequestedAt: requestedAt,
        profileImportCompletedAt: completedAt,
        profileImportStatus: draft.status,
        profileImportNotes: draft.notes
      },
      select: { id: true }
    });
  } catch (error) {
    if (!isMissingTeacherImportInfrastructure(error)) {
      throw error;
    }

    await db.teacher.update({
      where: { id: teacherId },
      data: {
        ...(draft.fields.avatarUrl ? { avatarUrl: draft.fields.avatarUrl } : {}),
        ...(draft.fields.bio ? { bio: draft.fields.bio } : {}),
        ...(draft.fields.city ? { city: draft.fields.city } : {}),
        ...(draft.fields.experienceYears ? { experienceYears: draft.fields.experienceYears } : {}),
        ...(draft.fields.studioName ? { studioName: draft.fields.studioName } : {}),
        ...(draft.fields.studioWebsiteUrl ? { studioWebsiteUrl: draft.fields.studioWebsiteUrl } : {}),
        ...(draft.fields.studioScheduleUrl ? { studioScheduleUrl: draft.fields.studioScheduleUrl } : {}),
        ...(draft.fields.training ? { training: draft.fields.training } : {})
      },
      select: { id: true }
    });
  }

  return teacher.userId ? await getTeacherByUserId(teacher.userId) : null;
}

export async function skipTeacherImportOnboarding(teacherId: string) {
  const teacher = await db.teacher.findUnique({
    where: { id: teacherId },
    select: { userId: true }
  });

  if (!teacher) {
    throw new Error("Teacher not found.");
  }

  try {
    await db.teacher.update({
      where: { id: teacherId },
      data: {
        profileImportStatus: "skipped",
        profileImportNotes: "Teacher skipped profile import onboarding.",
        profileImportCompletedAt: new Date()
      },
      select: { id: true }
    });
  } catch (error) {
    if (!isMissingTeacherImportInfrastructure(error)) {
      throw error;
    }
  }

  return teacher.userId ? await getTeacherByUserId(teacher.userId) : null;
}

export async function addTeacherUpcomingEvent(
  teacherId: string,
  event: Pick<TeacherUpcomingEvent, "title" | "hostName" | "eventDate" | "address" | "eventTime" | "eventType"> & {
    eventUrl?: string;
    /** Legacy string URL/path (e.g. old disk uploads). Prefer `eventImage`. */
    imageUrl?: string;
    /** When set, image bytes are stored on `TeacherUpcomingEvent` and served from `/api/teacher-upcoming-events/[id]/image`. */
    eventImage?: { bytes: Buffer; mimeType: string };
  }
) {
  const teacher = await db.teacher.findUnique({
    where: { id: teacherId },
    select: {
      id: true,
      studioName: true,
      studioWebsiteUrl: true
    }
  });

  if (!teacher) {
    throw new Error("Teacher profile not found; upcoming events must be tied to a valid instructor profile.");
  }

  const hostName = event.hostName?.trim() || null;
  const eventUrlTrimmed = event.eventUrl?.trim() ?? "";
  const host =
    hostName
      ? await upsertEventHost(
          hostName,
          teacher?.studioName?.toLowerCase() === hostName.toLowerCase()
            ? teacher.studioWebsiteUrl
            : /^https?:\/\//.test(eventUrlTrimmed)
              ? eventUrlTrimmed
              : null
        )
      : null;

  const address = event.address?.trim() || null;
  const eventTime = event.eventTime?.trim() || null;
  const title = event.title.trim();
  const eventUrlValue = eventUrlTrimmed ? eventUrlTrimmed : null;
  const eventDateValue = event.eventDate ? new Date(event.eventDate) : null;
  const hostId = host?.id ?? null;
  const imageUrlForDb = event.imageUrl?.trim() || null;
  const fileImage = event.eventImage?.bytes?.length ? event.eventImage : null;
  const normalizedEventType = normalizeTeacherUpcomingEventType(event.eventType);

  const eventId = `event-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  type Variant = { host: boolean; location: boolean; dbImage: boolean; legacyImageUrl: boolean };
  const variants: Variant[] = [];

  const imageModes: Array<{ db: boolean; url: boolean }> = [];
  if (fileImage) {
    imageModes.push({ db: true, url: false }, { db: false, url: false });
  } else if (imageUrlForDb) {
    imageModes.push({ db: false, url: true }, { db: false, url: false });
  } else {
    imageModes.push({ db: false, url: false });
  }

  for (const hostFlag of [true, false]) {
    for (const locationFlag of [true, false]) {
      for (const mode of imageModes) {
        variants.push({
          host: hostFlag,
          location: locationFlag,
          dbImage: mode.db,
          legacyImageUrl: mode.url
        });
      }
    }
  }

  variants.sort((a, b) => {
    const score = (v: Variant) =>
      Number(v.host) + Number(v.location) + Number(v.dbImage) + Number(v.legacyImageUrl);
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    if (a.host !== b.host) return Number(b.host) - Number(a.host);
    if (a.location !== b.location) return Number(b.location) - Number(a.location);
    if (a.dbImage !== b.dbImage) return Number(b.dbImage) - Number(a.dbImage);
    return Number(a.legacyImageUrl) - Number(b.legacyImageUrl);
  });

  let lastError: unknown;
  for (const variant of variants) {
    for (const withEventTypeField of [true, false]) {
      try {
        return await db.teacherUpcomingEvent.create({
          data: {
            id: eventId,
            teacherId: teacher.id,
            ...(variant.host ? { hostId } : {}),
            title,
            hostName,
            ...(variant.location ? { address, eventTime } : {}),
            ...(variant.dbImage && fileImage
              ? { eventImage: fileImage.bytes, eventImageMimeType: fileImage.mimeType }
              : {}),
            ...(variant.legacyImageUrl && imageUrlForDb ? { imageUrl: imageUrlForDb } : {}),
            eventUrl: eventUrlValue,
            eventDate: eventDateValue,
            ...(withEventTypeField ? { eventType: normalizedEventType } : {})
          }
        });
      } catch (error) {
        lastError = error;
        const missingColumn =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022";
        if (error instanceof Prisma.PrismaClientValidationError || missingColumn) {
          continue;
        }
        throw error;
      }
    }
  }

  throw lastError;
}

export async function addTeacherCalendarSession(
  teacherId: string,
  session: Pick<TeacherCalendarSession, "offeringId" | "title" | "description" | "location" | "startsAt" | "endsAt" | "timezone" | "sourceUrl">
) {
  try {
    const created = await db.teacherCalendarSession.create({
      data: {
        id: `calendar-${Date.now()}`,
        teacherId,
        offeringId: session.offeringId,
        title: session.title,
        description: session.description,
        location: session.location,
        startsAt: new Date(session.startsAt),
        endsAt: new Date(session.endsAt),
        timezone: session.timezone,
        sourceUrl: session.sourceUrl?.trim() || null
      }
    });

    return mapCalendarSession(created);
  } catch (error) {
    if (!isMissingCalendarSessionTable(error)) {
      throw error;
    }

    const fallback: TeacherCalendarSession = {
      id: `calendar-${Date.now()}`,
      teacherId,
      offeringId: session.offeringId,
      title: session.title,
      description: session.description,
      location: session.location,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      timezone: session.timezone,
      sourceUrl: session.sourceUrl?.trim() || undefined,
      isBooked: false
    };
    demoCalendarSessions.push(fallback);
    return fallback;
  }
}

export async function updateTeacherCalendarSession(
  teacherId: string,
  sessionId: string,
  session: Pick<TeacherCalendarSession, "offeringId" | "title" | "description" | "location" | "startsAt" | "endsAt" | "timezone" | "sourceUrl">
) {
  try {
    const existing = await db.teacherCalendarSession.findFirst({
      where: { id: sessionId, teacherId }
    });

    if (!existing) {
      throw new Error("Calendar session not found.");
    }

    if (existing.isBooked) {
      throw new Error("Booked sessions cannot be edited.");
    }

    const updated = await db.teacherCalendarSession.update({
      where: { id: sessionId },
      data: {
        offeringId: session.offeringId,
        title: session.title,
        description: session.description,
        location: session.location,
        startsAt: new Date(session.startsAt),
        endsAt: new Date(session.endsAt),
        timezone: session.timezone,
        sourceUrl: session.sourceUrl?.trim() || null
      }
    });

    return mapCalendarSession(updated);
  } catch (error) {
    if (!isMissingCalendarSessionTable(error)) {
      throw error;
    }

    const fallback = demoCalendarSessions.find((entry) => entry.id === sessionId && entry.teacherId === teacherId);
    if (!fallback) {
      throw new Error("Calendar session not found.");
    }
    if (fallback.isBooked) {
      throw new Error("Booked sessions cannot be edited.");
    }

    fallback.offeringId = session.offeringId;
    fallback.title = session.title;
    fallback.description = session.description;
    fallback.location = session.location;
    fallback.startsAt = session.startsAt;
    fallback.endsAt = session.endsAt;
    fallback.timezone = session.timezone;
    fallback.sourceUrl = session.sourceUrl?.trim() || undefined;

    return fallback;
  }
}

export async function deleteTeacherCalendarSession(teacherId: string, sessionId: string) {
  try {
    const existing = await db.teacherCalendarSession.findFirst({
      where: { id: sessionId, teacherId }
    });

    if (!existing) {
      throw new Error("Calendar session not found.");
    }

    if (existing.isBooked) {
      throw new Error("Booked sessions cannot be deleted.");
    }

    await db.teacherCalendarSession.delete({
      where: { id: sessionId }
    });
  } catch (error) {
    if (!isMissingCalendarSessionTable(error)) {
      throw error;
    }

    const fallbackIndex = demoCalendarSessions.findIndex((entry) => entry.id === sessionId && entry.teacherId === teacherId);
    if (fallbackIndex === -1) {
      throw new Error("Calendar session not found.");
    }
    if (demoCalendarSessions[fallbackIndex]?.isBooked) {
      throw new Error("Booked sessions cannot be deleted.");
    }
    demoCalendarSessions.splice(fallbackIndex, 1);
  }
}

export async function getTeacherCalendarSession(teacherId: string, sessionId: string) {
  try {
    const session = await db.teacherCalendarSession.findFirst({
      where: { id: sessionId, teacherId }
    });

    if (session) {
      return mapCalendarSession(session);
    }
  } catch (error) {
    if (!isMissingCalendarSessionTable(error)) {
      throw error;
    }
  }

  return demoCalendarSessions.find((entry) => entry.id === sessionId && entry.teacherId === teacherId) ?? null;
}

export async function markTeacherCalendarSessionBooked(teacherId: string, sessionId: string) {
  try {
    const updated = await db.teacherCalendarSession.updateMany({
      where: { id: sessionId, teacherId, isBooked: false },
      data: { isBooked: true }
    });

    if (updated.count > 0) {
      return;
    }
  } catch (error) {
    if (!isMissingCalendarSessionTable(error)) {
      throw error;
    }
  }

  const fallback = demoCalendarSessions.find((entry) => entry.id === sessionId && entry.teacherId === teacherId);
  if (fallback && !fallback.isBooked) {
    fallback.isBooked = true;
    return;
  }

  throw new Error("That calendar session is no longer available.");
}

export async function addTeacherCertificationSubmission(
  teacherId: string,
  submission: Pick<TeacherCertificationSubmission, "credentialName" | "notes" | "fileName" | "mimeType"> & {
    fileData: Buffer;
  }
) {
  const id = `cert-${Date.now()}-${randomBytes(8).toString("hex")}`;
  const fileUrl = `/api/teacher-certification-submissions/${id}/file`;

  const created = await db.teacherCertificationSubmission.create({
    data: {
      id,
      teacherId,
      credentialName: submission.credentialName,
      notes: submission.notes || null,
      fileUrl,
      fileName: submission.fileName,
      mimeType: submission.mimeType,
      fileData: submission.fileData,
      status: "PENDING"
    }
  });

  return mapCertificationSubmission(created);
}

export async function reviewTeacherCertificationSubmission(
  submissionId: string,
  decision: "approved" | "rejected",
  reviewNote?: string
) {
  const updated = await db.teacherCertificationSubmission.update({
    where: { id: submissionId },
    data: {
      status: decision === "approved" ? "APPROVED" : "REJECTED",
      reviewNote: reviewNote?.trim() ? reviewNote.trim() : null,
      reviewedAt: new Date()
    },
    include: {
      teacher: {
        select: {
          id: true
        }
      }
    }
  });

  if (decision === "approved") {
    await db.teacher.update({
      where: { id: updated.teacher.id },
      data: {
        certificationStatus: "certified"
      },
      select: { id: true }
    });
  }

  return mapCertificationSubmission(updated);
}

export async function listTeachersForAdmin() {
  const teachers = await withTeacherCompatibilityFallback([
    () =>
      db.teacher.findMany({
        select: teacherSelect,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: teacherSelectWithoutUpcomingLocation,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: teacherSelectWithoutCalendar,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: teacherSelectWithoutCalendarAndUpcomingLocation,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: legacyTeacherSelect,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: legacyTeacherSelectWithoutUpcomingLocation,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: legacyTeacherSelectWithoutCalendar,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: legacyTeacherSelectWithoutCalendarAndUpcomingLocation,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: teacherSelectStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: teacherSelectWithoutUpcomingLocationStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: teacherSelectWithoutCalendarStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: teacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: legacyTeacherSelectStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: legacyTeacherSelectWithoutUpcomingLocationStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: legacyTeacherSelectWithoutCalendarStalePrismaClient,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        select: legacyTeacherSelectWithoutCalendarAndUpcomingLocationStalePrismaClient,
        orderBy: { fullName: "asc" }
      })
  ]);

  return teachers.map(hydratePersistedTeacher);
}

export async function addTeacherStory(teacherId: string, story: Pick<TeacherStory, "title" | "caption" | "mediaUrl" | "mediaType">) {
  const storyCount = await db.teacherStory.count({
    where: { teacherId }
  });

  const created = await db.teacherStory.create({
    data: {
      id: `story-${Date.now()}`,
      teacherId,
      title: story.title,
      caption: story.caption,
      mediaUrl: story.mediaUrl,
      mediaType: mapStoryMediaTypeToDb(story.mediaType),
      sortOrder: storyCount + 1,
      published: true
    }
  });

  return mapTeacherStory(created);
}

export async function updateTeacherStory(
  teacherId: string,
  storyId: string,
  story: Pick<TeacherStory, "title" | "caption" | "mediaUrl" | "mediaType">
) {
  const existing = await db.teacherStory.findFirst({
    where: {
      id: storyId,
      teacherId
    }
  });

  if (!existing) {
    throw new Error("Story not found.");
  }

  const updated = await db.teacherStory.update({
    where: { id: storyId },
    data: {
      title: story.title,
      caption: story.caption,
      mediaUrl: story.mediaUrl,
      mediaType: mapStoryMediaTypeToDb(story.mediaType)
    }
  });

  return mapTeacherStory(updated);
}

export async function listCommunityDiscussions() {
  const discussions = await db.communityDiscussion.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return discussions.map((discussion) => ({
    id: discussion.id,
    authorName: discussion.authorName,
    authorRole: mapDiscussionRoleToApp(discussion.authorRole),
    title: discussion.title,
    body: discussion.body,
    tags: discussion.tags,
    createdAt: discussion.createdAt.toISOString(),
    replyCount: discussion.replyCount
  }));
}

export async function addCommunityDiscussion(input: Pick<CommunityDiscussion, "authorName" | "authorRole" | "title" | "body" | "tags">) {
  const discussion = await db.communityDiscussion.create({
    data: {
      id: `discussion-${Date.now()}`,
      authorName: input.authorName,
      authorRole: mapDiscussionRoleToDb(input.authorRole),
      title: input.title,
      body: input.body,
      tags: input.tags,
      replyCount: 0
    }
  });

  return {
    id: discussion.id,
    authorName: discussion.authorName,
    authorRole: mapDiscussionRoleToApp(discussion.authorRole),
    title: discussion.title,
    body: discussion.body,
    tags: discussion.tags,
    createdAt: discussion.createdAt.toISOString(),
    replyCount: discussion.replyCount
  };
}

export async function createContactInquiry(input: {
  teacherId: string;
  name: string;
  email: string;
  message: string;
}) {
  return await db.contactInquiry.create({
    data: {
      teacherId: input.teacherId,
      name: input.name,
      email: input.email.toLowerCase(),
      message: input.message
    }
  });
}
