import { useState, useEffect, useCallback } from "react";

type Job = {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string;
  location: string;
  type: string;
  postedAgo: string;
  applyUrl: string | null;
  description: string;
  skills: string[];
};

const typeColors: Record<string, string> = {
  "Full-time": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  "Part-time": "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
  "Contract": "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  "Internship": "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
};

function LinkedInLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-label="LinkedIn">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
    </svg>
  );
}

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.125-7.5 11.25-7.5 11.25S4.5 17.625 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconExternalLink({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-xl bg-slate-100" />
        <div className="h-6 w-20 rounded-full bg-slate-100" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-100" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-2/3 rounded bg-slate-100" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
      </div>
      <div className="mt-3 space-y-1">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-4/5 rounded bg-slate-100" />
      </div>
      <div className="mt-3 flex gap-1.5">
        <div className="h-5 w-16 rounded-full bg-slate-100" />
        <div className="h-5 w-16 rounded-full bg-slate-100" />
        <div className="h-5 w-12 rounded-full bg-slate-100" />
      </div>
      <div className="mt-4 h-10 w-full rounded-xl bg-slate-100" />
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const applyUrl = job.applyUrl ?? `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}`;

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#0A66C2]/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0A66C2]/10">
          {job.companyLogoUrl ? (
            <img src={job.companyLogoUrl} alt={job.company} className="h-full w-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <LinkedInLogo className="h-5 w-5 text-[#0A66C2]" />
          )}
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${typeColors[job.type] ?? "bg-stone-100 text-stone-700"}`}>
          {job.type}
        </span>
      </div>

      <div className="mt-3 flex-1">
        <h3 className="text-[0.97rem] font-semibold leading-snug text-slate-900 line-clamp-2">{job.title}</h3>
        <p className="mt-0.5 text-sm font-medium text-[#0A66C2]">{job.company}</p>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <IconMapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <IconClock className="h-3.5 w-3.5 shrink-0" />
          <span>{job.postedAgo}</span>
        </div>
      </div>

      {job.description && (
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">{job.description}</p>
      )}

      {job.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
      )}

      <a
        href={applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#0A66C2] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0958a8] active:scale-[0.98]"
      >
        <LinkedInLogo className="h-4 w-4" />
        Apply on LinkedIn
        <IconExternalLink className="h-3.5 w-3.5 opacity-80" />
      </a>
    </article>
  );
}

export function LinkedInJobSearch() {
  const [keywords, setKeywords] = useState("yoga teacher");
  const [location, setLocation] = useState("San Francisco Bay Area");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchJobs = useCallback(async (query: string, loc: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ query, location: loc });
      const res = await fetch(`/api/jobs/search?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const data = await res.json() as { jobs: Job[] };
      setJobs(data.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs("yoga teacher", "San Francisco Bay Area");
  }, [fetchJobs]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearched(true);
    fetchJobs(keywords, location);
  }

  return (
    <section id="linkedin-jobs" className="scroll-mt-24 space-y-6" aria-labelledby="linkedin-jobs-heading">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0A66C2]/10 text-[#0A66C2]">
          <LinkedInLogo className="h-5 w-5" />
        </span>
        <div>
          <h2 id="linkedin-jobs-heading" className="text-2xl font-semibold tracking-tight text-slate-900">
            Yoga Teacher Jobs on LinkedIn
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">Live job listings — search and apply directly</p>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-[#EBF3FB] to-[#F5F9FF] p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="li-keywords" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Role / Keywords
          </label>
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="li-keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="yoga teacher, pilates instructor…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20"
            />
          </div>
        </div>
        <div className="flex-1">
          <label htmlFor="li-location" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Location
          </label>
          <div className="relative">
            <IconMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="li-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="San Francisco, Bay Area…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A66C2] px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0958a8] active:scale-[0.98] disabled:opacity-60 sm:w-auto"
        >
          <IconSearch className="h-4 w-4" />
          {loading && searched ? "Searching…" : "Search Jobs"}
        </button>
      </form>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : jobs.map((job) => <JobCard key={job.id} job={job} />)
        }
      </div>

      {!loading && jobs.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No jobs found. Try different keywords or a broader location.
        </div>
      )}
    </section>
  );
}
