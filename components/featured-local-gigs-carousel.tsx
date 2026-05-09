"use client";

import Link from "next/link";
import { useRef } from "react";

type Gig = {
  id: string;
  title: string;
  urgent?: boolean;
  pay: string;
  company: string;
  location: string;
  schedule: string;
};

const GIGS: Gig[] = [
  {
    id: "1",
    title: "Morning Yoga Instructor",
    urgent: true,
    pay: "$75/hr",
    company: "Serenity Wellness Studio",
    location: "Downtown LA",
    schedule: "Mon, Wed, Fri • 6–8 AM",
  },
  {
    id: "2",
    title: "Vinyasa Flow Substitute",
    pay: "$200/session",
    company: "Flow State Collective",
    location: "Silver Lake",
    schedule: "Sat & Sun • 9–11 AM",
  },
  {
    id: "3",
    title: "Corporate Wellness Lead",
    pay: "$90/hr",
    company: "Mindful Works Inc.",
    location: "Culver City",
    schedule: "Tue & Thu • 12–1 PM",
  },
  {
    id: "4",
    title: "Restorative + Nidra Guide",
    urgent: true,
    pay: "$65/hr",
    company: "Lotus House Yoga",
    location: "Pasadena",
    schedule: "Evenings • flexible",
  },
  {
    id: "5",
    title: "Hot Yoga Floor Support",
    pay: "$22/hr + perks",
    company: "Radiant Heat Studio",
    location: "West Hollywood",
    schedule: "Weekday evenings",
  },
];

function IconBuilding({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 21h19.5M3.75 3h16.5v18M9 9.75h.008v.008H9V9.75zm0 3h.008v.008H9v-.008zm0 3h.008v.008H9v-.008zm3.75-6h.008v.008H12.75V9.75zm0 3h.008v.008H12.75v-.008zm0 3h.008v.008H12.75v-.008zm3.75-6h.008v.008h-.008V9.75zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
      />
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

function IconChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg className="h-5 w-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      )}
    </svg>
  );
}

export function FeaturedLocalGigsCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByDirection(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(280, Math.floor(el.clientWidth * 0.72));
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <section className="space-y-4" aria-labelledby="featured-gigs-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="featured-gigs-heading" className="text-2xl font-semibold text-stone-900">
            Featured Local Gigs
          </h2>
          <p className="text-sm text-stone-500">Opportunities near you</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:pt-0.5">
          <Link className="text-sm font-semibold text-emerald-700 hover:text-emerald-800" href="/teachers">
            See all &gt;
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition hover:bg-stone-50"
              aria-label="Scroll gigs left"
              onClick={() => scrollByDirection("left")}
            >
              <IconChevron direction="left" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition hover:bg-stone-50"
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
        className="-mx-1 flex gap-4 overflow-x-auto scroll-smooth px-1 pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {GIGS.map((gig) => (
          <article
            key={gig.id}
            className="flex w-[min(100%,18rem)] shrink-0 snap-start flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:w-[17.5rem]"
          >
            <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="font-semibold leading-tight text-stone-900">{gig.title}</h3>
                {gig.urgent ? (
                  <span className="inline-flex shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">Urgent</span>
                ) : null}
              </div>
              <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 sm:text-sm">{gig.pay}</span>
            </div>

            <ul className="mt-3 flex flex-1 flex-col gap-2.5 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <IconBuilding className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <span>{gig.company}</span>
              </li>
              <li className="flex items-start gap-2">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <span>{gig.location}</span>
              </li>
              <li className="flex items-start gap-2">
                <IconClock className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <span>{gig.schedule}</span>
              </li>
            </ul>

            <Link
              href="/teachers"
              className="mt-4 block w-full rounded-xl bg-emerald-700 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Apply Now
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
