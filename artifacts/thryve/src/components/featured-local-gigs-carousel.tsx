import { Link } from "wouter";
import { useRef } from "react";
import type { HomepageJobCard } from "@/lib/types";

const categoryClassNames: Record<string, string> = {
  "Part-time": "bg-teal-50 text-teal-700 ring-1 ring-teal-100",
  Contract: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  Gig: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  "Full-time": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  Volunteer: "bg-sky-50 text-sky-800 ring-1 ring-sky-100"
};

function IconBuilding({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3h16.5v18M9 9.75h.008v.008H9V9.75zm0 3h.008v.008H9v-.008zm0 3h.008v.008H9v-.008zm3.75-6h.008v.008H12.75V9.75zm0 3h.008v.008H12.75v-.008zm0 3h.008v.008H12.75v-.008zm3.75-6h.008v.008h-.008V9.75zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.125-7.5 11.25-7.5 11.25S4.5 17.625 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconDollar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m3.75-13.5c0-1.243-1.679-2.25-3.75-2.25S8.25 6.257 8.25 7.5 9.929 9.75 12 9.75s3.75 1.007 3.75 2.25-1.679 2.25-3.75 2.25-3.75-1.007-3.75-2.25" />
    </svg>
  );
}

function IconChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden>
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      )}
    </svg>
  );
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.25v4.125c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 0 1 3.75 18.375V14.25m16.5 0V8.625c0-.621-.504-1.125-1.125-1.125H15.75V6.375c0-.621-.504-1.125-1.125-1.125h-5.25A1.125 1.125 0 0 0 8.25 6.375V7.5H4.875A1.125 1.125 0 0 0 3.75 8.625v5.625m16.5 0h-16.5" />
    </svg>
  );
}

export function FeaturedLocalGigsCarousel({ gigs, isSignedIn = false }: { gigs: HomepageJobCard[]; isSignedIn?: boolean }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByDirection(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(280, Math.floor(el.clientWidth * 0.72));
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <section id="local-gigs" className="scroll-mt-24 space-y-5" aria-labelledby="featured-gigs-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFEAE1] text-[#E37E62]">
            <IconBriefcase className="h-5 w-5" />
          </span>
          <div>
            <h2 id="featured-gigs-heading" className="text-2xl font-semibold tracking-tight text-slate-900">
              New Jobs of the Week
            </h2>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:pt-0.5">
          <Link className="text-sm font-semibold text-[#E58768] hover:text-[#d97555]" href="/teachers">
            View all jobs
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-white shadow-sm shadow-emerald-100/80 transition hover:bg-emerald-50"
              aria-label="Scroll gigs left"
              onClick={() => scrollByDirection("left")}
            >
              <IconChevron direction="left" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-white shadow-sm shadow-emerald-100/80 transition hover:bg-emerald-50"
              aria-label="Scroll gigs right"
              onClick={() => scrollByDirection("right")}
            >
              <IconChevron direction="right" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-1 flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {gigs.length === 0 ? (
          <div className="w-full rounded-[1.55rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-500">
            No job listings to show yet.
          </div>
        ) : null}
        {gigs.map((gig) => (
          <article
            key={gig.id}
            className="flex w-[min(100%,18rem)] shrink-0 snap-start flex-col rounded-[1.55rem] border border-[#F3CFC6] bg-[#FFFDFC] p-4 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.18)] sm:w-[17.5rem]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryClassNames[gig.category] ?? "bg-stone-100 text-stone-700"}`}>
                {gig.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                <IconClock className="h-3.5 w-3.5" />
                {gig.posted}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-[1.02rem] font-semibold leading-snug text-slate-900">{gig.title}</h3>
              <p className="mt-1 text-sm text-stone-500">{gig.company}</p>
            </div>

            <ul className="mt-4 flex flex-1 flex-col gap-2.5 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <IconBuilding className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <span>{gig.company}</span>
              </li>
              <li className="flex items-start gap-2">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <span>{gig.location}</span>
              </li>
              <li className="flex items-start gap-2">
                <IconDollar className="mt-0.5 h-4 w-4 shrink-0 text-[#E58768]" />
                <span>{gig.pay}</span>
              </li>
            </ul>

            {gig.applyUrl ? (
              <a
                href={gig.applyUrl}
                target={gig.applyUrl.startsWith("mailto:") ? undefined : "_blank"}
                rel={gig.applyUrl.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="mt-5 block w-full rounded-full bg-gradient-to-r from-[#EE8D72] to-[#E6866A] py-2.5 text-center text-sm font-semibold text-white shadow-[0_8px_20px_-12px_rgba(229,134,106,0.95)] transition hover:from-[#e78063] hover:to-[#dc775a]"
              >
                {gig.applyUrl.startsWith("mailto:") ? "Contact" : "Apply Now"}
              </a>
            ) : (
              <Link
                href={isSignedIn ? "/teachers" : "/sign-in?next=%2Fteachers"}
                className="mt-5 block w-full rounded-full bg-gradient-to-r from-[#EE8D72] to-[#E6866A] py-2.5 text-center text-sm font-semibold text-white shadow-[0_8px_20px_-12px_rgba(229,134,106,0.95)] transition hover:from-[#e78063] hover:to-[#dc775a]"
              >
                Apply Now
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
