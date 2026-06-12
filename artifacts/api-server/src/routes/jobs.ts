import { Router, type IRouter } from "express";

const router: IRouter = Router();

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
  const diffMs = now.getTime() - posted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

router.get("/jobs/search", async (req, res) => {
  const apiKey = process.env["RAPIDAPI_KEY"];
  if (!apiKey) {
    res.status(503).json({ error: "RAPIDAPI_KEY not configured" });
    return;
  }

  const query = String(req.query["query"] || "yoga teacher");
  const location = String(req.query["location"] || "San Francisco Bay Area");
  const page = String(req.query["page"] || "1");

  const params = new URLSearchParams({
    query: `${query} ${location}`,
    page,
    num_pages: "1",
    date_posted: "month",
  });

  try {
    const response = await fetch(`${JSEARCH_BASE}?${params.toString()}`, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": JSEARCH_HOST,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: `JSearch error: ${text}` });
      return;
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
        job_highlights?: {
          Qualifications?: string[];
          Responsibilities?: string[];
        };
      }>;
    };

    const jobs = (raw.data ?? []).map((j) => {
      const locationParts = [j.job_city, j.job_state].filter(Boolean);
      return {
        id: j.job_id,
        title: j.job_title,
        company: j.employer_name,
        companyLogoUrl: j.employer_logo ?? undefined,
        location: locationParts.length > 0 ? locationParts.join(", ") : (j.job_country ?? "Remote"),
        type: JOB_TYPE_MAP[j.job_employment_type ?? ""] ?? (j.job_employment_type ?? "Other"),
        level: "Not specified",
        postedAgo: formatPostedAgo(j.job_posted_at_datetime_utc ?? null),
        linkedinJobId: j.job_id,
        applyUrl: j.job_apply_link ?? null,
        description: (j.job_description ?? "").slice(0, 200).trim(),
        skills: j.job_required_skills ?? j.job_highlights?.Qualifications?.slice(0, 5) ?? [],
      };
    });

    res.json({ jobs });
  } catch (err) {
    console.error("JSearch fetch error:", err);
    res.status(500).json({ error: "Failed to fetch jobs from JSearch" });
  }
});

export default router;
