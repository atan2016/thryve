import { SCHEDULE_FETCH_HEADERS } from "@/lib/schedule-sync/types";

const FETCH_TIMEOUT_MS = 10_000;

export async function fetchHtml(url: string): Promise<{ ok: true; html: string } | { ok: false; status?: number; error: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: SCHEDULE_FETCH_HEADERS,
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { ok: false, status: response.status, error: `HTTP ${response.status}` };
    }

    return { ok: true, html: await response.text() };
  } catch (err) {
    clearTimeout(timeout);
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

export function stripHtmlTags(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getAbsoluteUrl(value: string, baseUrl: string) {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

export function getLinkUrls(html: string, baseUrl: string) {
  const matches = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)];
  return matches
    .map((match) => getAbsoluteUrl(match[1], baseUrl))
    .filter((value): value is string => Boolean(value));
}

export function getPageTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? stripHtmlTags(match[1]) : undefined;
}
