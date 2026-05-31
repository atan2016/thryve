import { StoryMediaType } from "@prisma/client";

import { db } from "@/lib/db";
import { normalizeTeacherUpcomingEventType } from "@/lib/teacher-upcoming-event-types";

type InstagramSyncAccount = {
  teacherId?: string;
  teacherSlug?: string;
  username?: string;
  instagramUserId?: string;
  accessToken?: string;
};

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  timestamp?: string;
};

export type InstagramSyncResult = {
  teacherId: string;
  teacherSlug: string;
  importedStories: number;
  importedEvents: number;
  skipped: number;
  warnings: string[];
};

const EVENT_KEYWORDS = [
  "event",
  "workshop",
  "retreat",
  "rsvp",
  "ticket",
  "register",
  "registration",
  "join us",
  "pop-up",
  "popup",
  "sound bath",
  "ceremony",
  "masterclass",
  "intensive"
];

const MONTH_NAMES =
  "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";

function normalizeGraphBaseUrl() {
  return (process.env.INSTAGRAM_GRAPH_API_BASE_URL ?? "https://graph.instagram.com").replace(/\/+$/, "");
}

function parseConfiguredAccounts(): InstagramSyncAccount[] {
  const raw = process.env.INSTAGRAM_SYNC_ACCOUNTS?.trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is InstagramSyncAccount => entry != null && typeof entry === "object") : [];
  } catch {
    throw new Error("INSTAGRAM_SYNC_ACCOUNTS must be a JSON array.");
  }
}

function fallbackAccount(): InstagramSyncAccount | null {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    return null;
  }

  return {
    accessToken,
    instagramUserId: process.env.INSTAGRAM_USER_ID?.trim() || undefined,
    username: process.env.INSTAGRAM_USERNAME?.trim() || undefined
  };
}

function savedTeacherAccount(teacher: {
  id: string;
  slug: string;
  instagramUrl: string | null;
  instagramUserId?: string | null;
  instagramAccessToken?: string | null;
}): InstagramSyncAccount | null {
  if (!teacher.instagramAccessToken?.trim()) {
    return null;
  }

  return {
    teacherId: teacher.id,
    teacherSlug: teacher.slug,
    username: getInstagramHandle(teacher.instagramUrl),
    instagramUserId: teacher.instagramUserId?.trim() || undefined,
    accessToken: teacher.instagramAccessToken.trim()
  };
}

async function getSavedTeacherInstagramAccount(teacher: { id: string; slug: string; instagramUrl: string | null }) {
  try {
    const rows = await db.$queryRaw<Array<{ instagramUserId: string | null; instagramAccessToken: string | null }>>`
      SELECT "instagramUserId", "instagramAccessToken"
      FROM "Teacher"
      WHERE "id" = ${teacher.id}
      LIMIT 1
    `;

    return savedTeacherAccount({
      ...teacher,
      instagramUserId: rows[0]?.instagramUserId ?? null,
      instagramAccessToken: rows[0]?.instagramAccessToken ?? null
    });
  } catch {
    return null;
  }
}

async function listSavedInstagramAccounts() {
  try {
    const rows = await db.$queryRaw<
      Array<{
        id: string;
        slug: string;
        instagramUrl: string | null;
        instagramUserId: string | null;
        instagramAccessToken: string | null;
      }>
    >`
      SELECT "id", "slug", "instagramUrl", "instagramUserId", "instagramAccessToken"
      FROM "Teacher"
      WHERE "instagramAccessToken" IS NOT NULL
    `;

    return rows.map(savedTeacherAccount).filter((account): account is InstagramSyncAccount => account != null);
  } catch {
    return [];
  }
}

function getInstagramHandle(instagramUrl?: string | null) {
  if (!instagramUrl) {
    return undefined;
  }

  try {
    const url = new URL(/^https?:\/\//i.test(instagramUrl) ? instagramUrl : `https://${instagramUrl}`);
    const [, handle] = url.pathname.split("/");
    return handle?.replace(/^@/, "").toLowerCase() || undefined;
  } catch {
    return instagramUrl.replace(/^@/, "").split(/[/?#]/)[0]?.toLowerCase() || undefined;
  }
}

function accountMatchesTeacher(account: InstagramSyncAccount, teacher: { id: string; slug: string; instagramUrl: string | null }) {
  if (account.teacherId && account.teacherId === teacher.id) {
    return true;
  }

  if (account.teacherSlug && account.teacherSlug === teacher.slug) {
    return true;
  }

  const teacherHandle = getInstagramHandle(teacher.instagramUrl);
  return Boolean(account.username && teacherHandle && account.username.replace(/^@/, "").toLowerCase() === teacherHandle);
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function titleFromCaption(caption: string | undefined, fallback: string) {
  const firstLine = caption?.split(/\r?\n/).map((line) => cleanText(line)).find(Boolean);
  if (!firstLine) {
    return fallback;
  }

  return firstLine.length > 90 ? `${firstLine.slice(0, 87).trim()}...` : firstLine;
}

function extractEventDate(caption: string | undefined) {
  if (!caption) {
    return null;
  }

  const numeric = caption.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (numeric) {
    const year = numeric[3] ? Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3]) : new Date().getFullYear();
    const month = Number(numeric[1]) - 1;
    const day = Number(numeric[2]);
    const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
    return Number.isNaN(date.valueOf()) ? null : date;
  }

  const named = caption.match(new RegExp(`\\b(${MONTH_NAMES})\\s+(\\d{1,2})(?:,?\\s+(\\d{4}))?\\b`, "i"));
  if (named) {
    const date = new Date(`${named[1]} ${named[2]}, ${named[3] ?? new Date().getFullYear()} 12:00:00 UTC`);
    return Number.isNaN(date.valueOf()) ? null : date;
  }

  return null;
}

function extractEventTime(caption: string | undefined) {
  return caption?.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i)?.[1]?.toUpperCase() ?? null;
}

function isEventMedia(media: InstagramMedia) {
  const caption = media.caption ?? "";
  const lowered = caption.toLowerCase();
  return EVENT_KEYWORDS.some((keyword) => lowered.includes(keyword)) || extractEventDate(caption) != null;
}

function mediaDisplayUrl(media: InstagramMedia) {
  return media.media_type === "VIDEO" ? media.thumbnail_url || media.media_url : media.media_url;
}

async function fetchInstagramMedia(account: InstagramSyncAccount) {
  const accessToken = account.accessToken?.trim();
  if (!accessToken) {
    throw new Error("Instagram sync needs an access token.");
  }

  const actor = account.instagramUserId?.trim() || "me";
  const url = new URL(`${normalizeGraphBaseUrl()}/${actor}/media`);
  url.searchParams.set("fields", "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp");
  url.searchParams.set("limit", process.env.INSTAGRAM_SYNC_LIMIT?.trim() || "25");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, { cache: "no-store" });
  const payload = (await response.json().catch(() => null)) as { data?: InstagramMedia[]; error?: { message?: string } } | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? `Instagram API request failed with ${response.status}.`);
  }

  return payload?.data ?? [];
}

async function upsertInstagramStory(teacherId: string, media: InstagramMedia) {
  const storyCount = await db.teacherStory.count({ where: { teacherId } });
  const caption = cleanText(media.caption ?? "");
  const title = titleFromCaption(media.caption, "Instagram story");
  const mediaUrl = media.media_url || media.thumbnail_url;

  if (!mediaUrl) {
    return false;
  }

  await db.teacherStory.upsert({
    where: { id: `instagram-story-${teacherId}-${media.id}` },
    update: {
      title,
      caption,
      mediaUrl,
      mediaType: media.media_type === "VIDEO" ? StoryMediaType.VIDEO : StoryMediaType.IMAGE,
      published: true
    },
    create: {
      id: `instagram-story-${teacherId}-${media.id}`,
      teacherId,
      title,
      caption,
      mediaUrl,
      mediaType: media.media_type === "VIDEO" ? StoryMediaType.VIDEO : StoryMediaType.IMAGE,
      sortOrder: storyCount + 1,
      published: true
    }
  });

  return true;
}

async function upsertInstagramEvent(teacherId: string, media: InstagramMedia) {
  const caption = cleanText(media.caption ?? "");
  const imageUrl = mediaDisplayUrl(media);

  await db.teacherUpcomingEvent.upsert({
    where: { id: `instagram-event-${teacherId}-${media.id}` },
    update: {
      title: titleFromCaption(media.caption, "Instagram event"),
      eventType: normalizeTeacherUpcomingEventType(caption),
      imageUrl,
      eventUrl: media.permalink ?? null,
      eventDate: extractEventDate(media.caption),
      eventTime: extractEventTime(media.caption)
    },
    create: {
      id: `instagram-event-${teacherId}-${media.id}`,
      teacherId,
      title: titleFromCaption(media.caption, "Instagram event"),
      eventType: normalizeTeacherUpcomingEventType(caption),
      imageUrl,
      eventUrl: media.permalink ?? null,
      eventDate: extractEventDate(media.caption),
      eventTime: extractEventTime(media.caption)
    }
  });

  return true;
}

export async function syncInstagramPostsForTeacher(teacherId: string): Promise<InstagramSyncResult> {
  const teacher = await db.teacher.findUnique({
    where: { id: teacherId },
    select: {
      id: true,
      slug: true,
      instagramUrl: true
    }
  });

  if (!teacher) {
    throw new Error("Teacher profile not found.");
  }

  const configured = parseConfiguredAccounts();
  const account = (await getSavedTeacherInstagramAccount(teacher)) ?? configured.find((entry) => accountMatchesTeacher(entry, teacher)) ?? fallbackAccount();

  if (!account?.accessToken) {
    throw new Error("Instagram sync is not configured. Save this instructor's Instagram user ID and access token first.");
  }

  if (account.username && !accountMatchesTeacher(account, teacher)) {
    throw new Error("Configured Instagram username does not match this teacher profile.");
  }

  const media = await fetchInstagramMedia(account);
  let importedStories = 0;
  let importedEvents = 0;
  let skipped = 0;

  for (const item of media) {
    if (isEventMedia(item)) {
      importedEvents += (await upsertInstagramEvent(teacher.id, item)) ? 1 : 0;
    } else {
      importedStories += (await upsertInstagramStory(teacher.id, item)) ? 1 : 0;
    }

    if (!item.media_url && !item.thumbnail_url) {
      skipped += 1;
    }
  }

  return { teacherId: teacher.id, teacherSlug: teacher.slug, importedStories, importedEvents, skipped, warnings: [] };
}

export async function syncConfiguredInstagramAccounts() {
  const configured = parseConfiguredAccounts();
  const fallback = fallbackAccount();
  const savedAccounts = await listSavedInstagramAccounts();
  const accounts = [...savedAccounts, ...configured, ...(fallback?.username ? [fallback] : [])];

  if (!accounts.length) {
    return {
      results: [] as InstagramSyncResult[],
      warnings: ["No instructors have Instagram sync credentials saved."]
    };
  }

  const results: InstagramSyncResult[] = [];
  const warnings: string[] = [];

  for (const account of accounts) {
    const teachers = await db.teacher.findMany({
      where: {
        ...(account.teacherId ? { id: account.teacherId } : {}),
        ...(account.teacherSlug ? { slug: account.teacherSlug } : {})
      },
      select: { id: true, slug: true, instagramUrl: true }
    });
    const teacher = teachers.find((entry) => accountMatchesTeacher(account, entry));

    if (!teacher) {
      warnings.push(`No teacher profile matched Instagram account ${account.username ?? account.teacherSlug ?? account.teacherId ?? "unknown"}.`);
      continue;
    }

    try {
      results.push(await syncInstagramPostsForTeacher(teacher.id));
    } catch (error) {
      warnings.push(
        `Instagram sync failed for ${teacher.slug}: ${error instanceof Error ? error.message : "Unknown error."}`
      );
    }
  }

  return { results, warnings };
}
