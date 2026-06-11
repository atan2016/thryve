import { scrapeBluHighSchedule } from "@/lib/schedule-sync/adapters/blu-high";
import { scrapeGenericSchedule } from "@/lib/schedule-sync/adapters/generic";
import { scrapeRobinJaffeSchedule } from "@/lib/schedule-sync/adapters/robin-jaffe";
import type { ScheduleScrapeResult, TeacherScheduleContext } from "@/lib/schedule-sync/types";

const SLUG_ADAPTERS: Record<string, (teacher: TeacherScheduleContext) => Promise<ScheduleScrapeResult>> = {
  "robin-jaffe": scrapeRobinJaffeSchedule,
  "blu-high": scrapeBluHighSchedule
};

export async function scrapeTeacherSchedule(teacher: TeacherScheduleContext): Promise<ScheduleScrapeResult> {
  const adapter = SLUG_ADAPTERS[teacher.teacherSlug];
  if (adapter) {
    return adapter(teacher);
  }
  return scrapeGenericSchedule(teacher);
}
