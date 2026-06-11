"use client";

import Link from "next/link";
import { useRef } from "react";

import { TeacherAvatar } from "@/components/teacher-avatar";
import { TeacherHeartControl, TeacherHeartCountLabel } from "@/components/teacher-heart-control";

export type FeaturedTeacherCard = {
  id: string;
  slug: string;
  fullName: string;
  avatarUrl?: string;
  city: string;
  styles: string[];
  platformHoursBooked?: number;
  heartCount: number;
  viewerHasHearted: boolean;
  /** toggle: signed-in and not own profile; signin: anonymous; none: own profile */
  heartInteraction: "toggle" | "signin" | "none";
};

type FeaturedTeachersCarouselProps = {
  teachers: FeaturedTeacherCard[];
  viewerUserId: string | null;
};

function getTeacherSpecialty(teacher: FeaturedTeacherCard) {
  return teacher.styles.slice(0, 2).join(" · ") || "Yoga · Meditation";
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

export function FeaturedTeachersCarousel({ teachers, viewerUserId }: FeaturedTeachersCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (teachers.length === 0) {
    return null;
  }

  function scrollByDirection(direction: "left" | "right") {
    const element = scrollerRef.current;
    if (!element) return;

    const amount = Math.max(240, Math.floor(element.clientWidth * 0.72));
    element.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
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
        {teachers.map((teacher) => (
          <article
            key={teacher.id}
            className="flex w-[min(100%,11.75rem)] shrink-0 snap-start flex-col rounded-[1.35rem] border border-[#E7EEF5] bg-white px-4 py-4 shadow-[0_18px_36px_-30px_rgba(29,59,92,0.28)] sm:w-[11.5rem]"
          >
            <div className="flex flex-col items-center text-center">
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

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EEF3F7] pt-3 text-[12px] font-medium text-[#5E758B]">
              <TeacherHeartCountLabel
                className="tabular-nums"
                serverHeartCount={teacher.heartCount}
                teacherId={teacher.id}
                viewerUserId={viewerUserId}
              />
              {teacher.heartInteraction === "toggle" ? (
                <TeacherHeartControl
                  heartInteraction="toggle"
                  serverHeartCount={teacher.heartCount}
                  serverViewerHasHearted={teacher.viewerHasHearted}
                  teacherFullName={teacher.fullName}
                  teacherId={teacher.id}
                  teacherSlug={teacher.slug}
                  variant="compact"
                  viewerUserId={viewerUserId}
                />
              ) : teacher.heartInteraction === "signin" ? (
                <TeacherHeartControl
                  heartInteraction="signin"
                  serverHeartCount={teacher.heartCount}
                  serverViewerHasHearted={false}
                  teacherId={teacher.id}
                  teacherSlug={teacher.slug}
                  variant="compact"
                  viewerUserId={null}
                />
              ) : (
                <TeacherHeartControl
                  heartInteraction="none"
                  serverHeartCount={teacher.heartCount}
                  serverViewerHasHearted={teacher.viewerHasHearted}
                  teacherId={teacher.id}
                  teacherSlug={teacher.slug}
                  variant="compact"
                  viewerUserId={viewerUserId}
                />
              )}
            </div>

            <Link
              className="mt-3 inline-flex items-center justify-center rounded-full border border-[#7ED4D0] bg-white px-4 py-2.5 text-sm font-semibold text-[#4AA6AB] transition hover:bg-[#F3FBFB]"
              href={`/teachers/${teacher.slug}`}
            >
              View Profile
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
