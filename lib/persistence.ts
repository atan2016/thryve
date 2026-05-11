import { format, startOfDay } from "date-fns";
import { Prisma, CertificationSubmissionStatus, DiscussionAuthorRole, Role, StoryMediaType } from "@prisma/client";

import { db } from "@/lib/db";
import { demoCalendarSessions, demoEventHosts, demoTeachers, demoUserEventHostFollows, demoUserTeacherFollows } from "@/lib/mock-data";
import { getTeacherSupplement } from "@/lib/store";
import type {
  AppUser,
  CommunityDiscussion,
  EventHost,
  HomepageEventCard,
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
const HOMEPAGE_EVENT_LIMIT = 5;
const NO_FOLLOW_EVENT_LIMIT = 10;
const TODAY_START = startOfDay(new Date());
const CURATED_FALLBACK_EVENTS: HomepageEventCard[] = [
  {
    id: "curated-evergreen-escape",
    sortDate: "2026-05-20T00:00:00.000Z",
    title: "4-day Nature, Yoga and Meditation Retreat near Palisade Tahoe",
    dateRange: "May 20 - May 24",
    host: "Evergreen Escape",
    location: "Truckee, CA · Near Palisade Tahoe",
    detail: "4 days · hosted mountain stay",
    href: "https://www.vacasa.com/unit/1016469",
    external: true,
    imageSrc: "https://vacasa-units.imgix.net/pal/1016469/69a95d9a881be70011ad2fa3.jpg?w=1280&fit=max&q=80&auto=format",
    imageAlt: "Evergreen Escape vacation home exterior and mountain setting in Truckee",
    category: "Retreat",
    attendees: 24
  },
  {
    id: "curated-full-moon-restorative",
    sortDate: "2026-05-16T00:00:00.000Z",
    title: "Full Moon Restorative & Sound Journey",
    dateRange: "May 16",
    host: "Lotus House Yoga",
    location: "Pasadena, CA",
    detail: "7:00 PM · 2 hr workshop",
    href: "/community",
    imageSrc: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80&auto=format&fit=crop",
    imageAlt: "People in a gentle yoga pose indoors",
    category: "Somatic Healing",
    attendees: 18
  },
  {
    id: "curated-outdoor-vinyasa",
    sortDate: "2026-05-16T08:30:00.000Z",
    title: "Outdoor Vinyasa at Echo Park Lake",
    dateRange: "Saturdays · May-Aug",
    host: "Flow State Collective",
    location: "Los Angeles, CA",
    detail: "8:30 AM · donation-based",
    href: "/community",
    imageSrc: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Outdoor yoga class on mats in a park",
    category: "Meditation",
    attendees: 36
  },
  {
    id: "curated-breathwork-intensive",
    sortDate: "2026-06-07T00:00:00.000Z",
    title: "Breathwork Intensive Weekend",
    dateRange: "Jun 7 - Jun 8",
    host: "Mindful Works Inc.",
    location: "Culver City, CA",
    detail: "Sat-Sun · 12 spots",
    href: "/community",
    imageSrc: "https://images.unsplash.com/photo-1528319725582-ddc096101511?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Person in a seated meditation and breathing practice",
    category: "Breathwork",
    attendees: 22
  },
  {
    id: "curated-community-satsang",
    sortDate: "2026-05-11T18:30:00.000Z",
    title: "Community Satsang & Tea",
    dateRange: "May 11",
    host: "Serenity Wellness Studio",
    location: "Downtown LA",
    detail: "6:30 PM · free · RSVP",
    href: "/community",
    imageSrc: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80&auto=format&fit=crop",
    imageAlt: "People gathered for tea and conversation",
    category: "Community",
    attendees: 12
  }
];
const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  Retreat: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80&auto=format&fit=crop",
  "Somatic Healing": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80&auto=format&fit=crop",
  Meditation: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80&auto=format&fit=crop",
  Breathwork: "https://images.unsplash.com/photo-1528319725582-ddc096101511?w=1200&q=80&auto=format&fit=crop",
  Community: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&q=80&auto=format&fit=crop",
  Workshop: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80&auto=format&fit=crop"
};

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

function mapUser(user: {
  id: string;
  email: string;
  password: string;
  role: Role;
  name: string;
}): AppUser {
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    role: mapRoleToApp(user.role),
    name: user.name
  };
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
  hostName: string | null;
  eventUrl: string;
  eventDate: Date | null;
}): TeacherUpcomingEvent {
  return {
    id: event.id,
    teacherId: event.teacherId,
    hostId: event.hostId ?? undefined,
    title: event.title,
    hostName: event.hostName ?? undefined,
    eventUrl: event.eventUrl,
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
  userId: string;
  slug: string;
  fullName: string;
  avatarUrl: string | null;
  studioName: string | null;
  studioWebsiteUrl: string | null;
  studioScheduleUrl: string | null;
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
    hostName: string | null;
    eventUrl: string;
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
    userId: teacher.userId,
    slug: teacher.slug,
    fullName: teacher.fullName,
    avatarUrl: teacher.avatarUrl ?? undefined,
    studioName: teacher.studioName ?? undefined,
    studioWebsiteUrl: teacher.studioWebsiteUrl ?? undefined,
    studioScheduleUrl,
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
    teachingHours,
    certificationSubmissions: teacher.certificationSubmissions.map(mapCertificationSubmission),
    upcomingEvents: teacher.upcomingEvents.map(mapUpcomingEvent),
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
    upcomingEvents: teacher.upcomingEvents ?? [],
    calendarSessions: demoCalendarSessions
      .filter((session) => session.teacherId === teacher.id)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  };
}

const teacherInclude = {
  teachingHours: {
    orderBy: { category: "asc" as const }
  },
  certificationSubmissions: {
    orderBy: { createdAt: "desc" as const }
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
      hostName: true,
      eventUrl: true,
      eventDate: true
    },
    orderBy: [{ eventDate: "asc" as const }, { createdAt: "asc" as const }]
  },
  calendarSessions: {
    orderBy: { startsAt: "asc" as const }
  }
};

const teacherIncludeWithoutCalendar = {
  teachingHours: teacherInclude.teachingHours,
  certificationSubmissions: teacherInclude.certificationSubmissions,
  stories: teacherInclude.stories,
  upcomingEvents: teacherInclude.upcomingEvents
};

function isMissingCalendarSessionTable(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021" &&
    error.message.includes("TeacherCalendarSession")
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

function hasEventFollowClientSupport() {
  const runtimeDb = db as unknown as Record<string, unknown>;

  return Boolean(runtimeDb.eventHost && runtimeDb.userTeacherFollow && runtimeDb.userEventHostFollow);
}

async function withCalendarSessionFallback<T>(
  query: () => Promise<T>,
  fallbackQuery: () => Promise<T>
) {
  try {
    return await query();
  } catch (error) {
    if (isMissingCalendarSessionTable(error)) {
      return await fallbackQuery();
    }
    throw error;
  }
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

function buildHomepageEventImage(
  category: string,
  teacher: {
    avatarUrl: string | null;
    stories: Array<{ mediaUrl: string }>;
  },
  host?: { imageUrl: string | null } | null
) {
  return (
    host?.imageUrl ??
    teacher.stories[0]?.mediaUrl ??
    teacher.avatarUrl ??
    CATEGORY_IMAGE_FALLBACKS[category] ??
    CATEGORY_IMAGE_FALLBACKS.Workshop
  );
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
    hostName: string | null;
    eventUrl: string;
    eventDate: Date | null;
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
  const hostName = event.host?.name ?? event.hostName ?? event.teacher.studioName ?? event.teacher.fullName;
  const category = inferHomepageEventCategory(event.title, hostName);

  return {
    id: event.id,
    teacherId: event.teacher.id,
    teacherSlug: event.teacher.slug,
    hostId: event.host?.id ?? event.hostId ?? undefined,
    sortDate: event.eventDate?.toISOString(),
    title: event.title,
    dateRange: event.eventDate ? format(event.eventDate, "MMM d") : "Upcoming",
    host: hostName,
    location: buildHomepageEventLocation(event.teacher),
    detail: `Led by ${event.teacher.fullName}`,
    href: event.eventUrl,
    external: /^https?:\/\//.test(event.eventUrl),
    imageSrc: buildHomepageEventImage(category, event.teacher, event.host),
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

function sortHomepageEventsByDate(events: HomepageEventCard[]) {
  return [...events].sort((first, second) => {
    const firstTimestamp = first.sortDate ? new Date(first.sortDate).getTime() : Number.POSITIVE_INFINITY;
    const secondTimestamp = second.sortDate ? new Date(second.sortDate).getTime() : Number.POSITIVE_INFINITY;

    if (firstTimestamp !== secondTimestamp) {
      return firstTimestamp - secondTimestamp;
    }

    return first.title.localeCompare(second.title);
  });
}

function isUpcomingHomepageEvent(event: HomepageEventCard) {
  if (!event.sortDate) {
    return true;
  }

  return new Date(event.sortDate) >= TODAY_START;
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
          : /^https?:\/\//.test(event.eventUrl)
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

    const events = await db.teacherUpcomingEvent.findMany({
      where: {
        teacher: { is: { published: true } },
        AND: [
          { OR: [{ eventDate: null }, { eventDate: { gte: TODAY_START } }] },
          ...(options.personalized ? [{ OR: filters }] : [])
        ]
      },
      orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
      take: options.limit ?? HOMEPAGE_EVENT_LIMIT,
      select: {
        id: true,
        teacherId: true,
        title: true,
        hostName: true,
        eventUrl: true,
        eventDate: true,
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
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { mediaUrl: true }
            }
          }
        }
      }
    });

    const followedTeacherIds = new Set(options.followedTeacherIds ?? []);

    return events.map((event) =>
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

    const events = await db.teacherUpcomingEvent.findMany({
      where: {
        teacher: { is: { published: true } },
        AND: [
          { OR: [{ eventDate: null }, { eventDate: { gte: TODAY_START } }] },
          ...(options.personalized ? [{ OR: filters }] : [])
        ]
      },
      orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
      take: options.limit ?? HOMEPAGE_EVENT_LIMIT,
      select: {
        id: true,
        teacherId: true,
        hostId: true,
        title: true,
        hostName: true,
        eventUrl: true,
        eventDate: true,
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
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { mediaUrl: true }
            }
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            slug: true,
            websiteUrl: true,
            imageUrl: true
          }
        }
      }
    });

    const followedTeacherIds = new Set(options.followedTeacherIds ?? []);
    const followedHostIds = new Set(options.followedHostIds ?? []);

    return events.map((event) =>
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

  const followedTeacherIds = userId ? await listFollowedTeacherIds(userId) : [];
  const followedHostIds = userId ? await listFollowedEventHostIds(userId) : [];
  const hasNoFollows = Boolean(userId) && followedTeacherIds.length === 0 && followedHostIds.length === 0;

  if (userId && (followedTeacherIds.length > 0 || followedHostIds.length > 0)) {
    const personalizedEvents = await listPersistedHomepageEvents({
      followedTeacherIds,
      followedHostIds,
      personalized: true,
      limit: HOMEPAGE_EVENT_LIMIT
    });

    if (personalizedEvents.length > 0) {
      const genericEvents = await listPersistedHomepageEvents({
        personalized: false,
        limit: HOMEPAGE_EVENT_LIMIT
      });

      return dedupeHomepageEvents([...personalizedEvents, ...genericEvents, ...CURATED_FALLBACK_EVENTS]).slice(0, HOMEPAGE_EVENT_LIMIT);
    }
  }

  const genericEvents = await listPersistedHomepageEvents({
    personalized: false,
    limit: hasNoFollows ? NO_FOLLOW_EVENT_LIMIT : HOMEPAGE_EVENT_LIMIT
  });

  const fallbackEvents = dedupeHomepageEvents([...genericEvents, ...CURATED_FALLBACK_EVENTS]).filter(isUpcomingHomepageEvent);

  if (hasNoFollows) {
    return sortHomepageEventsByDate(fallbackEvents).slice(0, NO_FOLLOW_EVENT_LIMIT);
  }

  return fallbackEvents.slice(0, HOMEPAGE_EVENT_LIMIT);
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
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      name: true
    }
  });

  return user ? mapUser(user) : null;
}

export async function getUserByEmail(email: string) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      name: true
    }
  });

  return user ? mapUser(user) : null;
}

export async function createUser(input: Pick<AppUser, "email" | "password" | "name" | "role">) {
  const user = await db.user.create({
    data: {
      id: `user-${Date.now()}`,
      email: input.email.toLowerCase(),
      password: input.password,
      role: mapRoleToDb(input.role),
      name: input.name
    },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      name: true
    }
  });

  return mapUser(user);
}

export async function ensureTeacherProfile(userId: string, fullName: string) {
  const existingTeacher = await withCalendarSessionFallback(
    () =>
      db.teacher.findUnique({
        where: { userId },
        include: teacherInclude
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        include: teacherIncludeWithoutCalendar
      })
  );

  if (existingTeacher) {
    return hydratePersistedTeacher(existingTeacher);
  }

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
      published: false
    }
  });

  const teacher = await getTeacherByUserId(userId);
  if (!teacher) {
    throw new Error("Teacher profile could not be created.");
  }

  return teacher;
}

export async function getTeacherByUserId(userId: string) {
  const teacher = await withCalendarSessionFallback(
    () =>
      db.teacher.findUnique({
        where: { userId },
        include: teacherInclude
      }),
    () =>
      db.teacher.findUnique({
        where: { userId },
        include: teacherIncludeWithoutCalendar
      })
  );

  return teacher ? hydratePersistedTeacher(teacher) : null;
}

export async function getTeacherBySlug(slug: string) {
  const teacher = await withCalendarSessionFallback(
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        include: teacherInclude
      }),
    () =>
      db.teacher.findFirst({
        where: { slug, published: true },
        include: teacherIncludeWithoutCalendar
      })
  );

  if (teacher) {
    return hydratePersistedTeacher(teacher);
  }

  const fallbackTeacher = demoTeachers.find((entry) => entry.slug === slug && entry.published);
  return fallbackTeacher ? hydrateFallbackTeacher(fallbackTeacher) : null;
}

export async function listTeachers() {
  const teachers = await withCalendarSessionFallback(
    () =>
      db.teacher.findMany({
        where: { published: true },
        include: teacherInclude,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        where: { published: true },
        include: teacherIncludeWithoutCalendar,
        orderBy: { fullName: "asc" }
      })
  );

  const persistedTeachers = teachers.map(hydratePersistedTeacher);
  return [...persistedTeachers, ...listFallbackTeachers(persistedTeachers.map((teacher) => teacher.id))]
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function updateTeacherProfile(
  teacherId: string,
  input: Pick<Teacher, "fullName" | "city" | "serviceRadiusMiles" | "training" | "experienceYears" | "bio" | "gender" | "certificationStatus" | "studioScheduleUrl"> & {
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

  await db.user.update({
    where: { id: currentTeacher.userId },
    data: { name: input.fullName }
  });

  await db.teacher.update({
    where: { id: teacherId },
    data: {
      fullName: input.fullName,
      city: input.city,
      serviceRadiusMiles: input.serviceRadiusMiles,
      training: input.training,
      experienceYears: input.experienceYears,
      bio: input.bio,
      gender: input.gender,
      certificationStatus: input.certificationStatus,
      studioScheduleUrl: input.studioScheduleUrl?.trim() || null,
      ...(input.avatarUrl ? { avatarUrl: input.avatarUrl } : {}),
      published: true
    }
  });

  const teacher = await getTeacherByUserId(currentTeacher.userId);
  if (!teacher) {
    throw new Error("Teacher not found after update.");
  }

  return teacher;
}

export async function addTeacherUpcomingEvent(
  teacherId: string,
  event: Pick<TeacherUpcomingEvent, "title" | "hostName" | "eventUrl" | "eventDate">
) {
  const teacher = await db.teacher.findUnique({
    where: { id: teacherId },
    select: {
      studioName: true,
      studioWebsiteUrl: true
    }
  });
  const hostName = event.hostName?.trim() || null;
  const host =
    hostName
      ? await upsertEventHost(
          hostName,
          teacher?.studioName?.toLowerCase() === hostName.toLowerCase()
            ? teacher.studioWebsiteUrl
            : /^https?:\/\//.test(event.eventUrl)
              ? event.eventUrl
              : null
        )
      : null;

  try {
    return await db.teacherUpcomingEvent.create({
      data: {
        id: `event-${Date.now()}`,
        teacherId,
        hostId: host?.id ?? null,
        title: event.title,
        hostName,
        eventUrl: event.eventUrl,
        eventDate: event.eventDate ? new Date(event.eventDate) : null
      }
    });
  } catch (error) {
    if (!isMissingEventFollowInfrastructure(error)) {
      throw error;
    }

    return await db.teacherUpcomingEvent.create({
      data: {
        id: `event-${Date.now()}`,
        teacherId,
        title: event.title,
        hostName,
        eventUrl: event.eventUrl,
        eventDate: event.eventDate ? new Date(event.eventDate) : null
      }
    });
  }
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
  submission: Pick<TeacherCertificationSubmission, "credentialName" | "notes" | "fileUrl" | "fileName" | "mimeType">
) {
  const created = await db.teacherCertificationSubmission.create({
    data: {
      id: `cert-${Date.now()}`,
      teacherId,
      credentialName: submission.credentialName,
      notes: submission.notes || null,
      fileUrl: submission.fileUrl,
      fileName: submission.fileName,
      mimeType: submission.mimeType,
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
      }
    });
  }

  return mapCertificationSubmission(updated);
}

export async function listTeachersForAdmin() {
  const teachers = await withCalendarSessionFallback(
    () =>
      db.teacher.findMany({
        include: teacherInclude,
        orderBy: { fullName: "asc" }
      }),
    () =>
      db.teacher.findMany({
        include: teacherIncludeWithoutCalendar,
        orderBy: { fullName: "asc" }
      })
  );

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
