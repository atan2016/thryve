"use client";

import Link from "next/link";
import { useRef } from "react";

type EventItem = {
  id: string;
  title: string;
  dateRange: string;
  host: string;
  location: string;
  detail: string;
  href: string;
  external?: boolean;
};

const EVENTS: EventItem[] = [
  {
    id: "1",
    title: "4-day Nature, Yoga and Meditation Retreat near Palisade Tahoe",
    dateRange: "May 20 – May 24",
    host: "Evergreen Escape",
    location: "Truckee, CA · Near Palisade Tahoe",
    detail: "4 days · hosted mountain stay",
    href: "https://www.vacasa.com/unit/1016469",
    external: true,
  },
  {
    id: "2",
    title: "Full Moon Restorative & Sound Journey",
    dateRange: "May 16",
    host: "Lotus House Yoga",
    location: "Pasadena, CA",
    detail: "7:00 PM · 2 hr workshop",
    href: "/community",
  },
  {
    id: "3",
    title: "Outdoor Vinyasa at Echo Park Lake",
    dateRange: "Saturdays · May–Aug",
    host: "Flow State Collective",
    location: "Los Angeles, CA",
    detail: "8:30 AM · donation-based",
    href: "/community",
  },
  {
    id: "4",
    title: "Breathwork Intensive Weekend",
    dateRange: "Jun 7 – Jun 8",
    host: "Mindful Works Inc.",
    location: "Culver City, CA",
    detail: "Sat–Sun · 12 spots",
    href: "/community",
  },
  {
    id: "5",
    title: "Community Satsang & Tea",
    dateRange: "May 11",
    host: "Serenity Wellness Studio",
    location: "Downtown LA",
    detail: "6:30 PM · free · RSVP",
    href: "/community",
  },
];

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.125-7.5 11.25-7.5 11.25S4.5 17.625 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

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

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
      />
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

const ctaClassName =
  "mt-4 block w-full rounded-xl bg-emerald-700 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-800";

export function FeaturedEventsCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByDirection(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(280, Math.floor(el.clientWidth * 0.72));
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <section className="space-y-4" aria-labelledby="featured-events-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="featured-events-heading" className="text-2xl font-semibold text-stone-900">
            Events
          </h2>
          <p className="text-sm text-stone-500">Local or Relevant Events</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:pt-0.5">
          <Link className="text-sm font-semibold text-emerald-700 hover:text-emerald-800" href="/community">
            See all &gt;
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition hover:bg-stone-50"
              aria-label="Scroll events left"
              onClick={() => scrollByDirection("left")}
            >
              <IconChevron direction="left" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition hover:bg-stone-50"
              aria-label="Scroll events right"
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
        {EVENTS.map((event) => (
          <article
            key={event.id}
            className="flex w-[min(100%,18rem)] shrink-0 snap-start flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:w-[17.5rem]"
          >
            <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
              <h3 className="min-w-0 flex-1 font-semibold leading-tight text-stone-900">{event.title}</h3>
              <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-right text-xs font-semibold leading-snug text-emerald-800 sm:text-sm">
                {event.dateRange}
              </span>
            </div>

            <ul className="mt-3 flex flex-1 flex-col gap-2.5 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <IconBuilding className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <span>{event.host}</span>
              </li>
              <li className="flex items-start gap-2">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <span>{event.location}</span>
              </li>
              <li className="flex items-start gap-2">
                <IconCalendar className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <span>{event.detail}</span>
              </li>
            </ul>

            {event.external ? (
              <a
                href={event.href}
                target="_blank"
                rel="noopener noreferrer"
                className={ctaClassName}
              >
                View details
              </a>
            ) : (
              <Link href={event.href} className={ctaClassName}>
                View details
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
