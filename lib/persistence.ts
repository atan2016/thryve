import { CertificationSubmissionStatus, DiscussionAuthorRole, Role, StoryMediaType } from "@prisma/client";

import { db } from "@/lib/db";
import { getTeacherSupplement } from "@/lib/store";
import type {
  AppUser,
  CommunityDiscussion,
  Role as AppRole,
  ServiceCategory,
  TeacherCertificationSubmission,
  Teacher,
  TeacherStory,
  TeacherUpcomingEvent
} from "@/lib/types";

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

function slugifyTeacherName(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "teacher";
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
  title: string;
  hostName: string | null;
  eventUrl: string;
  eventDate: Date | null;
}): TeacherUpcomingEvent {
  return {
    id: event.id,
    teacherId: event.teacherId,
    title: event.title,
    hostName: event.hostName ?? undefined,
    eventUrl: event.eventUrl,
    eventDate: event.eventDate?.toISOString()
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

  return {
    id: teacher.id,
    userId: teacher.userId,
    slug: teacher.slug,
    fullName: teacher.fullName,
    avatarUrl: teacher.avatarUrl ?? undefined,
    studioName: teacher.studioName ?? undefined,
    studioWebsiteUrl: teacher.studioWebsiteUrl ?? undefined,
    studioScheduleUrl: teacher.studioScheduleUrl ?? undefined,
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
    stories: teacher.stories.map(mapTeacherStory)
  };
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
  const existingTeacher = await db.teacher.findUnique({
    where: { userId },
    include: {
      teachingHours: {
        orderBy: { category: "asc" }
      },
      certificationSubmissions: {
        orderBy: { createdAt: "desc" }
      },
      stories: {
        where: { published: true },
        orderBy: { sortOrder: "asc" }
      },
      upcomingEvents: {
        orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  if (existingTeacher) {
    return hydratePersistedTeacher(existingTeacher);
  }

  const teacher = await db.teacher.create({
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
    },
    include: {
      teachingHours: {
        orderBy: { category: "asc" }
      },
      certificationSubmissions: {
        orderBy: { createdAt: "desc" }
      },
      stories: {
        where: { published: true },
        orderBy: { sortOrder: "asc" }
      },
      upcomingEvents: {
        orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  return hydratePersistedTeacher(teacher);
}

export async function getTeacherByUserId(userId: string) {
  const teacher = await db.teacher.findUnique({
    where: { userId },
    include: {
      teachingHours: {
        orderBy: { category: "asc" }
      },
      certificationSubmissions: {
        orderBy: { createdAt: "desc" }
      },
      stories: {
        where: { published: true },
        orderBy: { sortOrder: "asc" }
      },
      upcomingEvents: {
        orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  return teacher ? hydratePersistedTeacher(teacher) : null;
}

export async function getTeacherBySlug(slug: string) {
  const teacher = await db.teacher.findFirst({
    where: { slug, published: true },
    include: {
      teachingHours: {
        orderBy: { category: "asc" }
      },
      certificationSubmissions: {
        orderBy: { createdAt: "desc" }
      },
      stories: {
        where: { published: true },
        orderBy: { sortOrder: "asc" }
      },
      upcomingEvents: {
        orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  return teacher ? hydratePersistedTeacher(teacher) : null;
}

export async function listTeachers() {
  const teachers = await db.teacher.findMany({
    where: { published: true },
    include: {
      teachingHours: {
        orderBy: { category: "asc" }
      },
      certificationSubmissions: {
        orderBy: { createdAt: "desc" }
      },
      stories: {
        where: { published: true },
        orderBy: { sortOrder: "asc" }
      },
      upcomingEvents: {
        orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }]
      }
    },
    orderBy: { fullName: "asc" }
  });

  return teachers.map(hydratePersistedTeacher);
}

export async function updateTeacherProfile(
  teacherId: string,
  input: Pick<Teacher, "fullName" | "city" | "serviceRadiusMiles" | "training" | "experienceYears" | "bio" | "gender" | "certificationStatus"> & {
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

  const teacher = await db.teacher.update({
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
      ...(input.avatarUrl ? { avatarUrl: input.avatarUrl } : {}),
      published: true
    },
    include: {
      teachingHours: {
        orderBy: { category: "asc" }
      },
      certificationSubmissions: {
        orderBy: { createdAt: "desc" }
      },
      stories: {
        where: { published: true },
        orderBy: { sortOrder: "asc" }
      },
      upcomingEvents: {
        orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  return hydratePersistedTeacher(teacher);
}

export async function addTeacherUpcomingEvent(
  teacherId: string,
  event: Pick<TeacherUpcomingEvent, "title" | "hostName" | "eventUrl" | "eventDate">
) {
  return await db.teacherUpcomingEvent.create({
    data: {
      id: `event-${Date.now()}`,
      teacherId,
      title: event.title,
      hostName: event.hostName || null,
      eventUrl: event.eventUrl,
      eventDate: event.eventDate ? new Date(event.eventDate) : null
    }
  });
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
  const teachers = await db.teacher.findMany({
    include: {
      teachingHours: {
        orderBy: { category: "asc" }
      },
      certificationSubmissions: {
        orderBy: [{ status: "asc" }, { createdAt: "desc" }]
      },
      stories: {
        where: { published: true },
        orderBy: { sortOrder: "asc" }
      },
      upcomingEvents: {
        orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }]
      }
    },
    orderBy: { fullName: "asc" }
  });

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
