import { NextResponse } from "next/server";

const JSEARCH_HOST = "jsearch.p.rapidapi.com";
const JSEARCH_BASE = `https://${JSEARCH_HOST}/search`;

const JOB_TYPE_MAP: Record<string, string> = {
  FULLTIME: "Full-time",
  PARTTIME: "Part-time",
  CONTRACTOR: "Contract",
  INTERN: "Internship",
};

function formatPostedAgo(dateStr: string | null): string {
  if (!dateStr) return "Recently";
  const posted = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export async function GET(request: Request) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RAPIDAPI_KEY not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "yoga teacher";
  const location = searchParams.get("location") ?? "San Francisco Bay Area";
  const page = searchParams.get("page") ?? "1";

  const params = new URLSearchParams({
    query: `${query} ${location}`,
    page,
    num_pages: "1",
    date_posted: "month",
  });

  const response = await fetch(`${JSEARCH_BASE}?${params.toString()}`, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": JSEARCH_HOST,
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json({ error: `JSearch error: ${text}` }, { status: response.status });
  }

  const raw = (await response.json()) as {
    data?: Array<{
      job_id: string;
      job_title: string;
      employer_name: string;
      employer_logo?: string | null;
      job_city?: string;
      job_state?: string;
      job_country?: string;
      job_employment_type?: string;
      job_posted_at_datetime_utc?: string;
      job_apply_link?: string;
      job_description?: string;
      job_required_skills?: string[] | null;
      job_highlights?: { Qualifications?: string[] };
    }>;
  };

  const jobs = (raw.data ?? []).map((j) => ({
    id: j.job_id,
    title: j.job_title,
    company: j.employer_name,
    companyLogoUrl: j.employer_logo ?? undefined,
    location: [j.job_city, j.job_state].filter(Boolean).join(", ") || j.job_country || "Remote",
    type: JOB_TYPE_MAP[j.job_employment_type ?? ""] ?? (j.job_employment_type ?? "Other"),
    postedAgo: formatPostedAgo(j.job_posted_at_datetime_utc ?? null),
    applyUrl: j.job_apply_link ?? null,
    description: (j.job_description ?? "").slice(0, 200).trim(),
    skills: (j.job_required_skills ?? j.job_highlights?.Qualifications ?? []).slice(0, 5),
  }));

  return NextResponse.json({ jobs });
}
