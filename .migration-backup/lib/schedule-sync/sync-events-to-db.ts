import { db } from "@/lib/db";
import { expandRecurring, slugifyForEventId, TZ } from "@/lib/schedule-sync/parse-utils";
import { DAYS_AHEAD } from "@/lib/schedule-sync/types";
import { scrapeTeacherSchedule } from "@/lib/schedule-sync/scrape-teacher-schedule";
import type { ExpandedScheduleSession, SyncUpcomingEventsResult, TeacherScheduleContext } from "@/lib/schedule-sync/types";

function buildEventId(session: ExpandedScheduleSession) {
  return `event-sync-${session.teacherSlug}-${slugifyForEventId(session.title)}`;
}

function groupNextSessionsPerSeries(sessions: ExpandedScheduleSession[]) {
  const eventByKey = new Map<string, ExpandedScheduleSession>();
  for (const s of sessions) {
    const key = `${s.teacherId}:${s.title}:${s.location}`;
    const existing = eventByKey.get(key);
    if (!existing || s.startsAt < existing.startsAt) {
      eventByKey.set(key, s);
    }
  }
  return [...eventByKey.values()];
}

export async function syncTeacherUpcomingEventsFromWeb(teacherId: string): Promise<SyncUpcomingEventsResult> {
  const teacher = await db.teacher.findUnique({
    where: { id: teacherId },
    select: {
      id: true,
      slug: true,
      fullName: true,
      claimEmail: true,
      city: true,
      websiteUrl: true,
      studioScheduleUrl: true,
      studioWebsiteUrl: true,
      linkedinUrl: true,
      instagramUrl: true,
      facebookUrl: true,
      user: { select: { email: true } }
    }
  });

  if (!teacher) {
    throw new Error("Teacher profile not found.");
  }

  const context: TeacherScheduleContext = {
    teacherId: teacher.id,
    teacherSlug: teacher.slug,
    fullName: teacher.fullName,
    claimEmail: teacher.claimEmail,
    userEmail: teacher.user?.email,
    city: teacher.city,
    websiteUrl: teacher.websiteUrl,
    studioScheduleUrl: teacher.studioScheduleUrl,
    studioWebsiteUrl: teacher.studioWebsiteUrl,
    linkedinUrl: teacher.linkedinUrl,
    instagramUrl: teacher.instagramUrl,
    facebookUrl: teacher.facebookUrl
  };

  const scrape = await scrapeTeacherSchedule(context);
  const now = new Date();
  const sessions = scrape.recurring.flatMap((rule) => expandRecurring(rule, now, DAYS_AHEAD));
  const nextPerSeries = groupNextSessionsPerSeries(sessions);

  if (!nextPerSeries.length) {
    const hint =
      scrape.sources.length === 0
        ? "Add a schedule or website URL on your profile, then try again."
        : "No upcoming class times could be parsed from your public schedule pages.";
    throw new Error(hint);
  }

  const upsertedIds: string[] = [];

  for (const s of nextPerSeries) {
    const eventId = buildEventId(s);
    upsertedIds.push(eventId);

    await db.teacherUpcomingEvent.upsert({
      where: { id: eventId },
      create: {
        id: eventId,
        teacherId: s.teacherId,
        hostId: s.hostId ?? null,
        title: s.title,
        eventType: s.eventType ?? "Workshop",
        hostName: s.location.split("·")[0]?.trim() ?? null,
        address: s.location,
        eventTime: s.startsAt.toLocaleTimeString("en-US", {
          timeZone: s.timezone ?? TZ,
          hour: "numeric",
          minute: "2-digit"
        }),
        eventUrl: s.sourceUrl,
        eventDate: s.startsAt
      },
      update: {
        hostId: s.hostId ?? null,
        title: s.title,
        eventType: s.eventType ?? "Workshop",
        hostName: s.location.split("·")[0]?.trim() ?? null,
        address: s.location,
        eventTime: s.startsAt.toLocaleTimeString("en-US", {
          timeZone: s.timezone ?? TZ,
          hour: "numeric",
          minute: "2-digit"
        }),
        eventUrl: s.sourceUrl,
        eventDate: s.startsAt
      }
    });
  }

  if (upsertedIds.length) {
    await db.teacherUpcomingEvent.deleteMany({
      where: {
        teacherId,
        id: { startsWith: "event-sync-", notIn: upsertedIds }
      }
    });
  }

  return {
    eventCount: upsertedIds.length,
    sources: scrape.sources,
    warnings: scrape.warnings
  };
}
