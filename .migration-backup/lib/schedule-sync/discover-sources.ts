import { fetchHtml, getLinkUrls } from "@/lib/schedule-sync/fetch-html";
import type { TeacherScheduleContext } from "@/lib/schedule-sync/types";

const SCHEDULE_KEYWORDS = /(book|schedule|calendar|class|session|appointment|reserve|availability|calendly)/i;
const FREEMAIL_DOMAINS = new Set(["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com", "proton.me", "protonmail.com"]);
const MAX_SOURCE_FETCHES = 6;
const MAX_DISCOVERED_URLS = 8;

function cleanUrl(value?: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function isLocalOrDemoEmailDomain(domain: string) {
  return domain.endsWith(".local") || domain === "yoga.local" || domain === "localhost";
}

function emailDomainSeed(email?: string | null) {
  if (!email?.includes("@")) return undefined;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || isLocalOrDemoEmailDomain(domain) || FREEMAIL_DOMAINS.has(domain)) {
    return undefined;
  }
  return `https://${domain}`;
}

function nameTokens(fullName: string) {
  return fullName
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

export type DiscoveredScheduleSources = {
  scheduleUrls: string[];
  nameTokens: string[];
  warnings: string[];
};

export async function discoverScheduleSources(teacher: TeacherScheduleContext): Promise<DiscoveredScheduleSources> {
  const warnings: string[] = [];
  const seen = new Set<string>();
  const scheduleUrls: string[] = [];

  const addUrl = (url?: string | null) => {
    const cleaned = cleanUrl(url);
    if (!cleaned || seen.has(cleaned)) return;
    seen.add(cleaned);
    scheduleUrls.push(cleaned);
  };

  addUrl(teacher.studioScheduleUrl);
  addUrl(teacher.websiteUrl);
  addUrl(teacher.studioWebsiteUrl);
  addUrl(emailDomainSeed(teacher.claimEmail));
  addUrl(emailDomainSeed(teacher.userEmail));

  const socialSeeds = [
    teacher.linkedinUrl ? { label: "LinkedIn", url: teacher.linkedinUrl } : null,
    teacher.instagramUrl ? { label: "Instagram", url: teacher.instagramUrl } : null,
    teacher.facebookUrl ? { label: "Facebook", url: teacher.facebookUrl } : null
  ].filter((entry): entry is { label: string; url: string } => Boolean(entry));

  let fetchCount = 0;
  const pagesToCrawl = [...scheduleUrls, ...socialSeeds.map((s) => cleanUrl(s.url)!).filter(Boolean)];

  for (const pageUrl of pagesToCrawl) {
    if (fetchCount >= MAX_SOURCE_FETCHES) break;
    if (!pageUrl || seen.has(`fetched:${pageUrl}`)) continue;
    seen.add(`fetched:${pageUrl}`);
    fetchCount += 1;

    const result = await fetchHtml(pageUrl);
    if (!result.ok) {
      warnings.push(`Could not fetch ${new URL(pageUrl).hostname}: ${result.error}`);
      continue;
    }

    const links = getLinkUrls(result.html, pageUrl);
    for (const link of links) {
      if (!SCHEDULE_KEYWORDS.test(link)) continue;
      if (seen.has(link)) continue;
      if (scheduleUrls.length >= MAX_DISCOVERED_URLS) break;
      seen.add(link);
      scheduleUrls.push(link);
    }
  }

  return {
    scheduleUrls: scheduleUrls.slice(0, MAX_DISCOVERED_URLS),
    nameTokens: nameTokens(teacher.fullName),
    warnings
  };
}

export function pageMentionsInstructor(text: string, tokens: string[]) {
  if (!tokens.length) return true;
  const lower = text.toLowerCase();
  return tokens.some((token) => lower.includes(token));
}
