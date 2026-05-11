"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { TeacherAvatar } from "@/components/teacher-avatar";

type FeaturedTeacher = {
  id: string;
  slug: string;
  fullName: string;
  avatarUrl?: string;
  city: string;
  styles: string[];
  platformHoursBooked?: number;
};

type FeaturedTeachersCarouselProps = {
  teachers: FeaturedTeacher[];
};

const teacherStatsBySlug: Record<string, { rating: number; reviews: number; students: number }> = {
  "ashley-tan": { rating: 4.9, reviews: 206, students: 310 },
  "kai-raman": { rating: 4.8, reviews: 156, students: 278 },
  "kj-landis": { rating: 4.9, reviews: 214, students: 342 },
  "robin-jaffe": { rating: 4.9, reviews: 188, students: 296 },
};

function getTeacherStats(teacher: FeaturedTeacher, index: number) {
  const preset = teacherStatsBySlug[teacher.slug];
  if (preset) {
    return preset;
  }

  return {
    rating: 4.7 + ((index % 3) * 0.1),
    reviews: 92 + index * 17,
    students: Math.max(teacher.platformHoursBooked ?? 120, 120),
  };
}

function getTeacherSpecialty(teacher: FeaturedTeacher) {
  return teacher.styles.slice(0, 2).join(" · ") || "Yoga · Meditation";
}

function formatCompactNumber(value: number) {
  return value.toLocaleString();
}

function IconStar() {
  return (
    <svg aria-hidden className="h-3.5 w-3.5 text-[#F5A623]" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.08 3.32a1 1 0 00.95.69h3.49c.969 0 1.371 1.24.588 1.81l-2.824 2.052a1 1 0 00-.364 1.118l1.079 3.32c.3.922-.755 1.688-1.538 1.118l-2.823-2.05a1 1 0 00-1.176 0l-2.823 2.05c-.784.57-1.838-.196-1.539-1.118l1.08-3.32a1 1 0 00-.364-1.118L2.98 8.747c-.783-.57-.38-1.81.588-1.81h3.49a1 1 0 00.951-.69l1.04-3.32Z" />
    </svg>
  );
}

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden
      className={`h-4.5 w-4.5 ${filled ? "fill-[#EF6B7B] text-[#EF6B7B]" : "fill-none text-[#9CB1C4]"}`}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.435 6.582a5.373 5.373 0 00-7.6 0L12 8.418l-1.836-1.836a5.374 5.374 0 10-7.6 7.6l1.836 1.835L12 21.616l7.6-7.6 1.835-1.834a5.373 5.373 0 000-7.6Z"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg aria-hidden className="h-3.5 w-3.5 text-[#7F97AC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198a11.953 11.953 0 01-5.999 1.531A11.953 11.953 0 016 18.719m12 0a5.971 5.971 0 00-.94-3.197M6 18.719a5.971 5.971 0 01.94-3.197m0 0a5.997 5.997 0 0110.12 0M15 6.75a3 3 0 11-6 0 3 3 0 016 0Z"
      />
    </svg>
  );
}

function IconChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg className="h-4.5 w-4.5 text-[#7F97AC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      )}
    </svg>
  );
}

export function FeaturedTeachersCarousel({ teachers }: FeaturedTeachersCarouselProps) {
  const featuredTeachers = useMemo(() => teachers.slice(0, 6), [teachers]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [ratedTeachers, setRatedTeachers] = useState<Set<string>>(new Set());

  if (featuredTeachers.length === 0) {
    return null;
  }

  function scrollByDirection(direction: "left" | "right") {
    const element = scrollerRef.current;
    if (!element) return;

    const amount = Math.max(240, Math.floor(element.clientWidth * 0.72));
    element.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  function toggleRated(slug: string) {
    setRatedTeachers((previous) => {
      const next = new Set(previous);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  return (
    <section className="space-y-4" aria-labelledby="featured-teachers-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F8FB] text-[#6F869B]">
            <IconUsers />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h2 id="featured-teachers-heading" className="text-2xl font-semibold tracking-tight text-[#1D3B5C]">
                Explore Trusted Practitioners
              </h2>
              <p className="text-sm font-medium text-[#7E93A7]">Discover instructors and healers near you.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link className="text-sm font-semibold text-[#4AA6AB] hover:text-[#3b9094]" href="/teachers">
            View all instructors
          </Link>
          <div className="flex gap-2">
            <button
              aria-label="Scroll featured teachers left"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCE7F0] bg-white transition hover:bg-[#F6FAFC]"
              onClick={() => scrollByDirection("left")}
              type="button"
            >
              <IconChevron direction="left" />
            </button>
            <button
              aria-label="Scroll featured teachers right"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCE7F0] bg-white transition hover:bg-[#F6FAFC]"
              onClick={() => scrollByDirection("right")}
              type="button"
            >
              <IconChevron direction="right" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {featuredTeachers.map((teacher, index) => {
          const stats = getTeacherStats(teacher, index);
          const isRated = ratedTeachers.has(teacher.slug);
          const displayRating = Math.min(5, stats.rating + (isRated ? 0.1 : 0));
          const displayReviews = stats.reviews + (isRated ? 1 : 0);

          return (
            <article
              key={teacher.id}
              className="flex w-[min(100%,11.75rem)] shrink-0 snap-start flex-col rounded-[1.35rem] border border-[#E7EEF5] bg-white px-4 py-4 shadow-[0_18px_36px_-30px_rgba(29,59,92,0.28)] sm:w-[11.5rem]"
            >
              <div className="flex justify-end">
                <button
                  aria-label={`Rate ${teacher.fullName}`}
                  className="rounded-full p-1 transition hover:bg-[#F6FAFC]"
                  onClick={() => toggleRated(teacher.slug)}
                  type="button"
                >
                  <IconHeart filled={isRated} />
                </button>
              </div>

              <div className="-mt-2 flex flex-col items-center text-center">
                <TeacherAvatar
                  className="h-[74px] w-[74px] rounded-full ring-2 ring-[#F6F7F8]"
                  height={74}
                  name={teacher.fullName}
                  sizes="74px"
                  src={teacher.avatarUrl}
                  width={74}
                />
                <h3 className="mt-3 text-[0.98rem] font-semibold leading-tight text-[#21415F]">{teacher.fullName}</h3>
                <p className="mt-1 text-xs font-medium text-[#6C849A]">{getTeacherSpecialty(teacher)}</p>
                <p className="mt-1 text-xs text-[#7E93A7]">{teacher.city}, CA</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#EEF3F7] pt-3 text-[12px] font-medium text-[#5E758B]">
                <span className="inline-flex items-center gap-1">
                  <IconStar />
                  {displayRating.toFixed(1)} ({formatCompactNumber(displayReviews)})
                </span>
                <span className="inline-flex items-center gap-1">
                  <IconUsers />
                  {formatCompactNumber(stats.students)}
                </span>
              </div>

              <Link
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[#7ED4D0] bg-white px-4 py-2.5 text-sm font-semibold text-[#4AA6AB] transition hover:bg-[#F3FBFB]"
                href={`/teachers/${teacher.slug}`}
              >
                View Profile
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
