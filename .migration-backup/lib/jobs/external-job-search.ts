import { formatDistanceToNowStrict } from "date-fns";
import { unstable_cache } from "next/cache";

import type { HomepageJobCard } from "@/lib/types";

/** Core wellness / mind-body signals (word boundaries). */
const WELLNESS_CORE_PATTERN =
  /\b(yoga|pilates|wellness|meditation|mindfulness|reiki|barre|holistic|somatic|breathwork|stretch)\b/i;

/** “Fitness instructor” only counts when paired with a wellness-adjacent cue (drops generic gym roles). */
const FITNESS_INSTRUCTOR_PATTERN = /\bfitness\s+instructor\b/i;
const FITNESS_WELLNESS_GUARD_PATTERN =
  /\b(yoga|pilates|wellness|mindful|meditation|studio|boutique|mat|barre|stretch|holistic|somatic|reiki)\b/i;

export function isHomepageWellnessJob(job: Pick<HomepageJobCard, "title" | "company">): boolean {
  const blob = `${job.title} ${job.company}`;
  if (WELLNESS_CORE_PATTERN.test(blob)) return true;
  if (FITNESS_INSTRUCTOR_PATTERN.test(blob)) {
    return FITNESS_WELLNESS_GUARD_PATTERN.test(blob);
  }
  return false;
}

type AdzunaJob = {
  id: string | number;
  title?: string;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
  salary_min?: number;
  salary_max?: number;
  created?: string;
  redirect_url?: string;
  contract_type?: string;
};

const parsedRevalidate = Number.parseInt(process.env.ADZUNA_CACHE_REVALIDATE_SECONDS ?? "", 10);
const REVALIDATE_SECONDS = Number.isFinite(parsedRevalidate)
  ? Math.min(86400, Math.max(60, parsedRevalidate))
  : 3600;

const CACHE_KEY = [
  "homepage-adzuna-jobs",
  (process.env.ADZUNA_COUNTRY_CODE ?? "us").trim().toLowerCase(),
  (process.env.ADZUNA_WHERE ?? "").trim()
];

function formatSalaryRange(min?: number, max?: number): string {
  if (min != null && max != null && min > 0 && max > 0 && min !== max) {
    return `$${Math.round(min).toLocaleString("en-US")}–$${Math.round(max).toLocaleString("en-US")}`;
  }
  if (min != null && min > 0) {
    return `from $${Math.round(min).toLocaleString("en-US")}`;
  }
  if (max != null && max > 0) {
    return `up to $${Math.round(max).toLocaleString("en-US")}`;
  }
  return "See listing";
}

function mapContractType(raw?: string): string {
  const t = String(raw ?? "").toLowerCase();
  if (t.includes("freelance") || t.includes("gig") || t.includes("casual") || t.includes("zero hour")) return "Gig";
  if (t.includes("permanent") || t.includes("full")) return "Full-time";
  if (t.includes("contract") || t.includes("temp")) return "Contract";
  if (t.includes("part")) return "Part-time";
  return "Part-time";
}

function mapAdzunaJobToCard(job: AdzunaJob): HomepageJobCard | null {
  const redirect = job.redirect_url?.trim();
  if (!redirect) return null;

  const company = job.company?.display_name?.trim() || "Hiring company";
  const location =
    job.location?.display_name?.trim() ||
    (Array.isArray(job.location?.area) ? job.location!.area!.filter(Boolean).join(", ") : "Location not listed");

  let posted = "Recently posted";
  if (job.created) {
    const d = new Date(job.created);
    if (!Number.isNaN(d.getTime())) {
      posted = formatDistanceToNowStrict(d, { addSuffix: true });
    }
  }

  const card: HomepageJobCard = {
    id: `adzuna-${job.id}`,
    title: (job.title ?? "Job listing").trim() || "Job listing",
    category: mapContractType(job.contract_type),
    pay: formatSalaryRange(job.salary_min, job.salary_max),
    company,
    location,
    posted,
    applyUrl: redirect
  };

  if (!isHomepageWellnessJob(card)) return null;
  return card;
}

async function fetchAdzunaSearchPage(what: string): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID?.trim();
  const appKey = process.env.ADZUNA_APP_KEY?.trim();
  const country = (process.env.ADZUNA_COUNTRY_CODE ?? "us").trim().toLowerCase();
  const where = (process.env.ADZUNA_WHERE ?? "").trim();
  if (!appId || !appKey) return [];

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: "25",
    what
  });
  if (where.length > 0) {
    params.set("where", where);
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Adzuna jobs API HTTP ${res.status}`);
  }
  const data = (await res.json()) as { results?: AdzunaJob[] };
  return data.results ?? [];
}

async function fetchHomepageExternalJobsUncached(): Promise<HomepageJobCard[]> {
  const appId = process.env.ADZUNA_APP_ID?.trim();
  const appKey = process.env.ADZUNA_APP_KEY?.trim();
  if (!appId || !appKey) return [];

  const queries = ["yoga instructor", "pilates instructor", "wellness coach", "meditation teacher"];
  const batches = await Promise.all(queries.map((q) => fetchAdzunaSearchPage(q)));

  const seen = new Set<string>();
  const cards: HomepageJobCard[] = [];

  for (const batch of batches) {
    for (const job of batch) {
      const key = String(job.id);
      if (seen.has(key)) continue;
      const card = mapAdzunaJobToCard(job);
      if (!card) continue;
      seen.add(key);
      cards.push(card);
    }
  }

  return cards.slice(0, 36);
}

export const getCachedHomepageExternalJobs = unstable_cache(fetchHomepageExternalJobsUncached, CACHE_KEY, {
  revalidate: REVALIDATE_SECONDS
});
