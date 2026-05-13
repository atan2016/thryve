import { formatDistanceToNowStrict } from "date-fns";
import { unstable_cache } from "next/cache";

import type { HomepageJobCard } from "@/lib/types";

/** Title/company must match at least one of these (word-boundary) to appear on the homepage. */
const WELLNESS_FOCUS_PATTERN =
  /\b(yoga|pilates|wellness|meditation|mindfulness|reiki|barre|holistic|somatic|breathwork|stretch)\b/i;

export function isHomepageWellnessJob(job: Pick<HomepageJobCard, "title" | "company">): boolean {
  return WELLNESS_FOCUS_PATTERN.test(`${job.title} ${job.company}`);
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
  return "See listing for pay";
}

function mapContractType(raw?: string): string {
  const t = String(raw ?? "").toLowerCase();
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
  if (!appId || !appKey) return [];

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: "25",
    what
  });

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

  const queries = ["yoga instructor", "pilates instructor", "wellness coach"];
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

export const getCachedHomepageExternalJobs = unstable_cache(fetchHomepageExternalJobsUncached, ["homepage-adzuna-jobs"], {
  revalidate: 3600
});
