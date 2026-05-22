import { discoverScheduleSources, pageMentionsInstructor } from "@/lib/schedule-sync/discover-sources";
import { fetchHtml, getPageTitle, stripHtmlTags } from "@/lib/schedule-sync/fetch-html";
import { parseDayTimeRules } from "@/lib/schedule-sync/parse-utils";
import type { RecurringClass, ScheduleScrapeResult, TeacherScheduleContext } from "@/lib/schedule-sync/types";

export async function scrapeGenericSchedule(teacher: TeacherScheduleContext): Promise<ScheduleScrapeResult> {
  const discovered = await discoverScheduleSources(teacher);
  const warnings = [...discovered.warnings];
  const sources: string[] = [];
  const recurring: RecurringClass[] = [];

  if (!discovered.scheduleUrls.length) {
    warnings.push("No schedule URLs found on your profile. Add a website or schedule URL and try again.");
    return { recurring, sources, warnings };
  }

  for (const url of discovered.scheduleUrls) {
    const result = await fetchHtml(url);
    sources.push(url);
    if (!result.ok) {
      warnings.push(`${new URL(url).hostname}: ${result.error}`);
      continue;
    }

    const bodyText = stripHtmlTags(result.html).slice(0, 20_000);
    if (!pageMentionsInstructor(bodyText, discovered.nameTokens)) {
      warnings.push(`${new URL(url).hostname}: page did not mention your name; skipped`);
      continue;
    }

    const times = parseDayTimeRules(bodyText);
    if (!times.length) {
      warnings.push(`${new URL(url).hostname}: no recurring day/time patterns found`);
      continue;
    }

    const pageTitle = getPageTitle(result.html) ?? "Class";
    const title =
      pageTitle.length > 80 ? pageTitle.slice(0, 80) : pageTitle.length >= 4 ? pageTitle : "Weekly class";
    const location = teacher.city ? `${teacher.city}, CA` : "See schedule link";
    const hostLabel = new URL(url).hostname.replace(/^www\./, "");

    for (const { dayOfWeek, hour, minute } of times) {
      recurring.push({
        teacherId: teacher.teacherId,
        teacherSlug: teacher.teacherSlug,
        sourceUrl: url,
        sourceLabel: hostLabel,
        title,
        description: `Recurring class from ${hostLabel}.`,
        location,
        dayOfWeek,
        hour,
        minute,
        durationMinutes: 60,
        eventType: "Workshop"
      });
    }
  }

  return { recurring, sources, warnings };
}
