import { useState } from "react";
import type { LinkedInJob } from "@/lib/types";

const typeColors: Record<string, string> = {
  "Full-time": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  "Part-time": "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
  "Contract": "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  "Internship": "bg-violet-50 text-violet-700 ring-1 ring-violet-100"
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

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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

function buildLinkedInUrl(keywords: string, location: string) {
  const params = new URLSearchParams();
  params.set("keywords", keywords || "yoga teacher");
  params.set("location", location || "San Francisco Bay Area");
  params.set("f_TPR", "r604800");
  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}

function JobCard({ job }: { job: LinkedInJob }) {
  const applyUrl = `https://www.linkedin.com/jobs/view/${job.linkedinJobId}/`;

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#0A66C2]/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A66C2]/10 text-[#0A66C2]">
          <LinkedInLogo className="h-5 w-5" />
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
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <IconClock className="h-3.5 w-3.5 shrink-0" />
            {job.postedAgo}
          </span>
          {job.applicants && (
            <span className="flex items-center gap-1.5">
              <IconUsers className="h-3.5 w-3.5 shrink-0" />
              {job.applicants}
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">{job.description}</p>

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

export function LinkedInJobSearch({ jobs }: { jobs: LinkedInJob[] }) {
  const [keywords, setKeywords] = useState("yoga teacher");
  const [location, setLocation] = useState("San Francisco Bay Area");
  const [visibleCount, setVisibleCount] = useState(4);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    window.open(buildLinkedInUrl(keywords, location), "_blank", "noopener,noreferrer");
  }

  const visibleJobs = jobs.slice(0, visibleCount);

  return (
    <section id="linkedin-jobs" className="scroll-mt-24 space-y-6" aria-labelledby="linkedin-jobs-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0A66C2]/10 text-[#0A66C2]">
            <LinkedInLogo className="h-5 w-5" />
          </span>
          <div>
            <h2 id="linkedin-jobs-heading" className="text-2xl font-semibold tracking-tight text-slate-900">
              Yoga Teacher Jobs on LinkedIn
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">Search and apply to yoga teaching positions near you</p>
          </div>
        </div>
        <a
          href={buildLinkedInUrl(keywords, location)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-2 rounded-xl border border-[#0A66C2]/30 bg-white px-4 py-2 text-sm font-semibold text-[#0A66C2] shadow-sm transition hover:bg-[#0A66C2]/5"
        >
          <LinkedInLogo className="h-4 w-4" />
          View all on LinkedIn
          <IconExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-[#EBF3FB] to-[#F5F9FF] p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="li-keywords" className="mb-1 block text-xs font-semibold text-slate-600 uppercase tracking-wide">
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
          <label htmlFor="li-location" className="mb-1 block text-xs font-semibold text-slate-600 uppercase tracking-wide">
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
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0A66C2] px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0958a8] active:scale-[0.98] sm:w-auto w-full"
        >
          <IconSearch className="h-4 w-4" />
          Search LinkedIn
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {visibleCount < jobs.length && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + 4)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#0A66C2]/40 hover:text-[#0A66C2]"
          >
            Show more jobs
          </button>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        Job listings are representative examples. Click any card to view the live posting on LinkedIn.
      </p>
    </section>
  );
}
