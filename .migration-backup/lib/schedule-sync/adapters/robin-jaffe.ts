import { fetchHtml } from "@/lib/schedule-sync/fetch-html";
import { matchAllText, parseDayTimeRules } from "@/lib/schedule-sync/parse-utils";
import type { RecurringClass, ScheduleScrapeResult, TeacherScheduleContext } from "@/lib/schedule-sync/types";
import { SCHEDULE_FETCH_HEADERS } from "@/lib/schedule-sync/types";

const PUBLIC_CLASSES_URL = "https://www.robinjaffe.love/public-classes";
const PDF_URL = "https://www.robinjaffe.love/_files/ugd/79180e_5c5798a1722d4638b9e44c0e1094d254.pdf";

export async function scrapeRobinJaffeSchedule(teacher: TeacherScheduleContext): Promise<ScheduleScrapeResult> {
  const sources = [PUBLIC_CLASSES_URL];
  const warnings: string[] = [];
  const recurring: RecurringClass[] = [];

  const base = {
    teacherId: teacher.teacherId,
    teacherSlug: teacher.teacherSlug
  };

  const page = await fetchHtml(PUBLIC_CLASSES_URL);
  if (!page.ok) {
    throw new Error(`Robin schedule fetch failed: ${page.error} ${PUBLIC_CLASSES_URL}`);
  }

  const titles = matchAllText(
    page.html,
    /<span[^>]*class="[^"]*wixui-rich-text__text[^"]*"[^>]*>([^<]+)<\/span>/g
  );
  const joined = titles.join("\n");

  if (joined.includes("Pilates Foundations") && joined.includes("SunPorch")) {
    const timeText = titles.find((t) => /Mondays?\s+\d{1,2}:\d{2}\s*(am|pm)/i.test(t)) ?? "";
    const times = parseDayTimeRules(timeText);
    for (const { dayOfWeek, hour, minute } of times.length ? times : [{ dayOfWeek: 1, hour: 12, minute: 0 }]) {
      recurring.push({
        ...base,
        sourceUrl: "https://fitlocalfit.com/Services/Sunporch-Yoga",
        sourceLabel: "SunPorch Yoga (robinjaffe.love)",
        title: "Pilates Foundations",
        description:
          "Grounding long-held floor-based postures using props for deeper range of motion and resilient connective tissues. Candlelight, gentle, and meditative.",
        location: "SunPorch Yoga · San Francisco, CA",
        dayOfWeek,
        hour,
        minute,
        durationMinutes: 60,
        offeringId: "offering-11",
        hostId: "host-sunporch-yoga",
        eventType: "Somatic Healing"
      });
    }
  } else {
    warnings.push("Could not confirm SunPorch / Pilates Foundations block on robinjaffe.love");
  }

  if (joined.includes("Gentle Yoga") && joined.includes("Vennu")) {
    const timeText = titles.find((t) => /Tuesdays?\s+and\s+Thursdays?\s+\d{1,2}:\d{2}\s*(am|pm)/i.test(t)) ?? "";
    const times = parseDayTimeRules(timeText);
    const fallback = [
      { dayOfWeek: 2, hour: 11, minute: 15 },
      { dayOfWeek: 4, hour: 11, minute: 15 }
    ];
    for (const { dayOfWeek, hour, minute } of times.length ? times : fallback) {
      recurring.push({
        ...base,
        sourceUrl: "https://vennu-studio.com/book-a-class",
        sourceLabel: "Vennu Yoga (robinjaffe.love)",
        title: "Gentle Yoga, Strength Building and Meditation",
        description:
          "Beginner-friendly yoga and Pilates-based core awareness, kettlebell strength building, ending with guided meditation.",
        location: "Vennu Yoga · Millbrae, CA",
        dayOfWeek,
        hour,
        minute,
        durationMinutes: 60,
        offeringId: "offering-12",
        hostId: "host-vennu-yoga",
        eventType: "Workshop"
      });
    }
  } else {
    warnings.push("Could not confirm Vennu / Gentle Yoga block on robinjaffe.love");
  }

  sources.push(PDF_URL);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const pdfRes = await fetch(PDF_URL, { headers: SCHEDULE_FETCH_HEADERS, signal: controller.signal });
    clearTimeout(timeout);
    if (pdfRes.ok) {
      const buf = Buffer.from(await pdfRes.arrayBuffer());
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buf });
      const parsed = await parser.getText();
      const text = parsed.text ?? "";
      const monThu = parseDayTimeRules(text);
      const times =
        monThu.length > 0
          ? monThu
          : [
              { dayOfWeek: 1, hour: 12, minute: 0 },
              { dayOfWeek: 4, hour: 12, minute: 0 }
            ];
      if (!/good living|redwood/i.test(text)) {
        warnings.push("Good Living PDF fetched but schedule text not recognized; using Mon/Thu 12:00pm Redwood City");
      }
      for (const { dayOfWeek, hour, minute } of times) {
        recurring.push({
          ...base,
          sourceUrl: PDF_URL,
          sourceLabel: "Good Living Health PDF",
          title: "Embodied Yoga, Pilates and Meditation",
          description:
            "Beginner-friendly somatic yoga and gentle Pilates with optional breathwork and meditation.",
          location: "Good Living Health · Redwood City, CA",
          dayOfWeek,
          hour,
          minute,
          durationMinutes: 45,
          offeringId: "offering-10",
          hostId: "host-good-living-health",
          eventType: "Workshop"
        });
      }
    }
  } catch (err) {
    warnings.push(`Good Living PDF parse skipped: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { recurring, sources, warnings };
}
