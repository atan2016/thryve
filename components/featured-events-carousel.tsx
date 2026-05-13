"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useFormStatus } from "react-dom";

import type { HomepageEventCard } from "@/lib/types";

const categoryClassNames: Record<string, string> = {
  Retreat: "bg-teal-50 text-teal-700 ring-1 ring-teal-100",
  "Somatic Healing": "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  Meditation: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
  Breathwork: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
  Community: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  Workshop: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
};

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.125-7.5 11.25-7.5 11.25S4.5 17.625 4.5 10.5a7.5 7.5 0 1115 0z" />
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
    <svg className="h-5 w-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden>
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      )}
    </svg>
  );
}

function IconSparkles({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18 6V3.75m0 0V1.5m0 2.25h2.25M18 3.75h-2.25" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198a11.953 11.953 0 0 1-5.999 1.531A11.953 11.953 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.94-3.197M6 18.719a5.971 5.971 0 0 1 .94-3.197m0 0a5.997 5.997 0 0 1 10.12 0M6.94 15.522a5.997 5.997 0 0 0 10.12 0M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );
}

const ctaClassName =
  "mt-4 block w-full rounded-full bg-gradient-to-r from-[#57BBB3] to-[#45AAA5] py-2.5 text-center text-sm font-semibold text-white shadow-[0_8px_20px_-12px_rgba(67,164,159,0.9)] transition hover:from-[#4db3ad] hover:to-[#3f9d98]";

function FollowHostButton({ isFollowing }: { isFollowing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
        isFollowing
          ? "border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
          : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
      }`}
      disabled={pending}
    >
      {pending ? "Saving..." : isFollowing ? "Following" : "Follow host"}
    </button>
  );
}

type FeaturedEventsCarouselProps = {
  events: HomepageEventCard[];
  isSignedIn?: boolean;
  toggleEventHostFollowAction?: (formData: FormData) => void | Promise<void>;
};

export function FeaturedEventsCarousel({
  events,
  isSignedIn = false,
  toggleEventHostFollowAction,
}: FeaturedEventsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByDirection(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(280, Math.floor(el.clientWidth * 0.72));
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <section className="space-y-5" aria-labelledby="featured-events-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFEAE1] text-[#E37E62]">
            <IconSparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 id="featured-events-heading" className="text-2xl font-semibold tracking-tight text-slate-900">
              Newly Added Events
            </h2>
            <p className="mt-1 text-sm text-stone-500">Posted by teachers during this calendar month, newest listings first.</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:pt-0.5">
          <Link className="text-sm font-semibold text-[#57AAA5] hover:text-[#459792]" href="/community">
            View all events
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-teal-100 bg-white shadow-sm shadow-teal-100/80 transition hover:bg-teal-50"
              aria-label="Scroll events left"
              onClick={() => scrollByDirection("left")}
            >
              <IconChevron direction="left" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-teal-100 bg-white shadow-sm shadow-teal-100/80 transition hover:bg-teal-50"
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
        className="-mx-1 flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {events.map((event) => (
          <article
            key={event.id}
            className="relative flex w-[min(100%,18rem)] shrink-0 snap-start flex-col overflow-hidden rounded-[1.65rem] border border-stone-200/80 bg-[#FFFDFC] shadow-[0_18px_36px_-28px_rgba(15,23,42,0.22)] sm:w-[17.5rem]"
          >
            <div className="relative aspect-[5/3] w-full shrink-0 bg-stone-100">
              <Image
                src={event.imageSrc}
                alt={event.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 90vw, 280px"
              />
              {event.featuredLabel ? (
                <span className="absolute left-3 top-3 inline-flex rounded-full bg-[#4DB3AA] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                  {event.featuredLabel}
                </span>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-3">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryClassNames[event.category] ?? "bg-stone-100 text-stone-700"}`}>
                  {event.category}
                </span>
                {typeof event.attendees === "number" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400">
                    <IconUsers className="h-3.5 w-3.5" />
                    {event.attendees}
                  </span>
                ) : null}
              </div>

              <h3 className="mt-3 min-w-0 text-[1.02rem] font-semibold leading-snug text-slate-900">{event.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-sm text-stone-500">by {event.host}</p>
                {isSignedIn && toggleEventHostFollowAction && event.hostId ? (
                  <form action={toggleEventHostFollowAction}>
                    <input name="hostId" type="hidden" value={event.hostId} />
                    <input name="intent" type="hidden" value={event.isFollowedHost ? "unfollow" : "follow"} />
                    <FollowHostButton isFollowing={Boolean(event.isFollowedHost)} />
                  </form>
                ) : null}
              </div>

              <ul className="mt-4 flex flex-1 flex-col gap-2.5 text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <IconCalendar className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                  <div>
                    <p>{event.dateRange}</p>
                    <p className="text-stone-500">{event.detail}</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                  <span>{event.location}</span>
                </li>
              </ul>

              {!isSignedIn ? (
                <Link href={`/sign-in?next=${encodeURIComponent(event.href)}`} className={ctaClassName}>
                  View Details
                </Link>
              ) : event.external ? (
                <a
                  href={event.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ctaClassName}
                >
                  View Details
                </a>
              ) : (
                <Link href={event.href} className={ctaClassName}>
                  View Details
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
