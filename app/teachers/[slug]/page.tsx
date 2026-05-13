import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";

import { HoursBookedLabel } from "@/components/hours-booked-label";
import { MetricCard } from "@/components/metric-card";
import { TeacherContactForm } from "@/components/teacher-contact-form";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { TeacherProfileWellnessBackdrop } from "@/components/teacher-profile-wellness-backdrop";
import { contactTeacherAction, toggleTeacherFollowAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { formatCredits, formatDateTime } from "@/lib/format";
import { getTeacherBySlug, getTeacherByUserId, isTeacherFollowedByUser } from "@/lib/persistence";
import { getRecaptchaSiteKey } from "@/lib/recaptcha";
import type { TeacherUpcomingEvent } from "@/lib/types";

type TeacherProfileProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ contact?: string }>;
};

function IconGlobe() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2.25c4.832 0 8.75 3.918 8.75 8.75S16.832 19.75 12 19.75 3.25 15.832 3.25 11 7.168 2.25 12 2.25zm0 0c2.183 2.154 3.5 5.185 3.5 8.75s-1.317 6.596-3.5 8.75m0-17.5C9.817 4.404 8.5 7.435 8.5 11s1.317 6.596 3.5 8.75M3.9 8h16.2M3.9 14h16.2"
      />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.25" cy="6.75" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.125h2.415l.36-2.79H13.5v-1.78c0-.81.225-1.36 1.39-1.36h1.485V5.45A19.7 19.7 0 0014.21 5.3c-2.145 0-3.615 1.31-3.615 3.72v2.065H8.16v2.79h2.435V21h2.905z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.94 8.5a1.69 1.69 0 110-3.38 1.69 1.69 0 010 3.38zM5.5 9.75h2.88V18H5.5V9.75zm4.7 0h2.76v1.12h.04c.38-.73 1.32-1.5 2.72-1.5 2.9 0 3.44 1.9 3.44 4.37V18h-2.88v-3.76c0-.9-.02-2.06-1.25-2.06-1.26 0-1.45.98-1.45 1.99V18H10.2V9.75z" />
    </svg>
  );
}

function IconVerified() {
  return (
    <svg className="h-7 w-7 shrink-0 text-[#0f766e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  );
}

function IconLeafSection() {
  return (
    <svg className="h-7 w-7 shrink-0 text-[#0f766e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c-4.5 3-7.5 7.5-7.5 12a7.5 7.5 0 0015 0c0-4.5-3-9-7.5-12z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg className="h-10 w-10 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5v14l11-7-11-7z" />
    </svg>
  );
}

function excerptBio(bio: string, maxLen = 260) {
  const t = bio.trim();
  if (t.length <= maxLen) return t;
  const slice = t.slice(0, maxLen);
  const last = Math.max(slice.lastIndexOf("."), slice.lastIndexOf("!"), slice.lastIndexOf("?"));
  if (last > 120) return slice.slice(0, last + 1);
  const soft = slice.lastIndexOf(" ");
  return `${slice.slice(0, soft > 100 ? soft : maxLen).trimEnd()}…`;
}

function formatEventDateLabel(event: TeacherUpcomingEvent) {
  if (!event.eventDate) return null;
  try {
    return format(new Date(event.eventDate), "MMM d").toUpperCase();
  } catch {
    return null;
  }
}

function formatTimeRange(startsAt: string, endsAt: string) {
  return `${format(new Date(startsAt), "h:mm a")} - ${format(new Date(endsAt), "h:mm a")}`;
}

function getSignInHref(nextPath: string) {
  return `/sign-in?next=${encodeURIComponent(nextPath)}`;
}

const wellnessCard =
  "relative overflow-hidden rounded-[2rem] border border-teal-900/10 bg-white/90 shadow-[0_24px_70px_-48px_rgba(15,80,75,0.42)] backdrop-blur-sm";

const tealSolidBtn =
  "inline-flex items-center justify-center rounded-full bg-[#0f766e] px-7 py-3.5 text-center text-sm font-semibold text-white shadow-[0_16px_40px_-22px_rgba(15,118,110,0.85)] transition hover:bg-[#0d9488] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f766e]";

const tealOutlineBtn =
  "inline-flex items-center justify-center rounded-full border-2 border-[#0f766e] bg-white/80 px-7 py-3.5 text-center text-sm font-semibold text-[#0c4f4a] transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f766e]";

export default async function TeacherProfilePage({ params, searchParams }: TeacherProfileProps) {
  const { slug } = await params;
  const query = await searchParams;
  const user = await getCurrentUser();
  let teacher = await getTeacherBySlug(slug);

  if (!teacher && user?.role === "teacher") {
    const ownedTeacher = await getTeacherByUserId(user.id);
    if (ownedTeacher?.slug === slug) {
      teacher = ownedTeacher;
    }
  }

  const recaptchaSiteKey = getRecaptchaSiteKey();

  if (!teacher) {
    notFound();
  }

  const isOwnerPreview = user?.id === teacher.userId && !teacher.published;
  const canFollowTeacher = Boolean(user && user.id !== teacher.userId);
  const isFollowedByViewer = user && user.id !== teacher.userId ? await isTeacherFollowedByUser(user.id, teacher.id) : false;
  const teacherBookHref = user ? `/teachers/${teacher.slug}/book` : getSignInHref(`/teachers/${teacher.slug}/book`);

  const totalHoursBooked: number =
    teacher.teachingHours.reduce((total, counter) => total + counter.totalHours, 0) || (teacher.platformHoursBooked ?? 0);
  const showPublicCalendar = teacher.showPublicCalendar !== false;
  const openCalendarSessions = showPublicCalendar ? (teacher.calendarSessions ?? []).filter((session) => !session.isBooked) : [];
  const openAvailabilitySlots = teacher.availability.filter((slot) => !slot.isBooked);
  const availabilitySlotsToShow = showPublicCalendar
    ? (teacher.studioScheduleUrl ? openAvailabilitySlots.slice(0, 3) : openAvailabilitySlots)
    : [];
  const calendarBaseDate = openCalendarSessions[0] ? new Date(openCalendarSessions[0].startsAt) : new Date();
  const teacherLinks: Array<{ href: string; label: string; icon: ReturnType<typeof IconGlobe> }> = [];

  if (teacher.websiteUrl) {
    teacherLinks.push({ href: teacher.websiteUrl, label: "Website", icon: <IconGlobe /> });
  } else if (teacher.studioWebsiteUrl) {
    teacherLinks.push({ href: teacher.studioWebsiteUrl, label: "Website", icon: <IconGlobe /> });
  }

  if (teacher.studioWebsiteUrl && teacher.websiteUrl && teacher.studioWebsiteUrl !== teacher.websiteUrl) {
    teacherLinks.push({ href: teacher.studioWebsiteUrl, label: "Studio", icon: <IconGlobe /> });
  }

  if (teacher.linkedinUrl) {
    teacherLinks.push({ href: teacher.linkedinUrl, label: "LinkedIn", icon: <IconLinkedIn /> });
  }

  if (teacher.instagramUrl) {
    teacherLinks.push({ href: teacher.instagramUrl, label: "Instagram", icon: <IconInstagram /> });
  }

  if (teacher.facebookUrl) {
    teacherLinks.push({ href: teacher.facebookUrl, label: "Facebook", icon: <IconFacebook /> });
  }

  const monthStart = startOfMonth(calendarBaseDate);
  const monthEnd = endOfMonth(calendarBaseDate);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 1 })
  });
  const calendarWeeks = Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, index) =>
    calendarDays.slice(index * 7, index * 7 + 7)
  );

  const bioLead = excerptBio(teacher.bio);
  const isCertified = teacher.certificationStatus === "certified";
  const specialtyLine = teacher.styles.slice(0, 4).join(" · ") || "Yoga & movement";
  const upcomingEvents = teacher.upcomingEvents ?? [];

  return (
    <div className="relative -mx-6 min-h-screen bg-gradient-to-b from-[#ebe8df] via-[#f4f1ea] to-[#e5efec] px-4 pb-20 pt-2 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#fdba8c]/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-[28rem] w-[28rem] translate-x-1/4 rounded-full bg-teal-300/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl space-y-10">
        {isOwnerPreview ? (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm backdrop-blur-sm">
            This profile is not published yet. Only you can view this preview until you save and publish it from the teacher dashboard.
          </div>
        ) : null}

        {/* Hero */}
        <section className={`${wellnessCard} p-6 sm:p-10 lg:p-12`}>
          <TeacherProfileWellnessBackdrop />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            <TeacherAvatar
              className="h-36 w-36 shrink-0 rounded-3xl shadow-[0_20px_50px_-28px_rgba(0,0,0,0.35)] ring-4 ring-white/90 sm:h-40 sm:w-40"
              height={160}
              name={teacher.fullName}
              src={teacher.avatarUrl}
              width={160}
            />
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight text-[#0c3d3a] sm:text-[2.75rem] sm:leading-tight">{teacher.fullName}</h1>
                {isCertified ? (
                  <span className="inline-flex items-center gap-1.5" title="Verified on Thryve">
                    <IconVerified />
                    <span className="sr-only">Verified instructor</span>
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-200 bg-amber-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
                    Not certified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {teacher.badges.map((badge) => (
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-[#0d6b66]/18 bg-[#ecfdf5]/90 px-3.5 py-1.5 text-sm font-medium text-[#0c4f4a]"
                    key={badge.name}
                  >
                    {badge.imageUrl ? (
                      <Image alt="" className="h-5 w-5 object-contain" height={20} src={badge.imageUrl} width={20} />
                    ) : null}
                    {badge.name}
                    {badge.verified && !badge.imageUrl ? " · verified" : null}
                  </span>
                ))}
                {teacher.styles.map((style) => (
                  <span
                    className="rounded-full bg-white/80 px-3.5 py-1.5 text-sm font-medium text-[#115e59] ring-1 ring-teal-800/15"
                    key={style}
                  >
                    {style}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#134e4a]">
                <span className="inline-flex items-center gap-2 font-medium">
                  <span className="text-lg" aria-hidden>
                    ◎
                  </span>
                  {teacher.city} · {teacher.serviceRadiusMiles} mi radius
                </span>
                <span className="inline-flex items-center gap-2 font-medium">
                  <span className="text-lg" aria-hidden>
                    ✦
                  </span>
                  {teacher.experienceYears}+ years teaching
                </span>
                {totalHoursBooked ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-teal-700/20 bg-teal-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0f766e]">
                    <span aria-hidden>🌿</span>
                    <HoursBookedLabel hours={totalHoursBooked} teacherName={teacher.fullName} />
                  </span>
                ) : null}
              </div>

              <p className="max-w-3xl text-lg leading-relaxed text-stone-700">{bioLead}</p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link className={tealSolidBtn} href={teacherBookHref} style={{ color: "#ffffff" }}>
                  Book a session
                </Link>
                <a className={tealOutlineBtn} href="#contact-instructor">
                  Contact me for job opportunities
                </a>
                {canFollowTeacher ? (
                  <form action={toggleTeacherFollowAction}>
                    <input name="teacherId" type="hidden" value={teacher.id} />
                    <input name="teacherSlug" type="hidden" value={teacher.slug} />
                    <input name="intent" type="hidden" value={isFollowedByViewer ? "unfollow" : "follow"} />
                    <button
                      className={`${tealOutlineBtn} inline-flex items-center gap-2`}
                      type="submit"
                    >
                      <span aria-hidden>♡</span>
                      {isFollowedByViewer ? "Following" : `Follow ${teacher.fullName.split(" ")[0] ?? "teacher"}`}
                    </button>
                  </form>
                ) : null}
                <Link className="rounded-full px-5 py-3 text-sm font-medium text-[#0c4f4a]/80 underline-offset-4 hover:underline" href="/teachers">
                  Back to discovery
                </Link>
              </div>

              {teacherLinks.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {teacherLinks.map((link) => (
                    <a
                      aria-label={link.label}
                      className="inline-flex items-center gap-2 rounded-full border border-teal-800/15 bg-white/70 px-3 py-2 text-sm text-[#134e4a] transition hover:bg-teal-50/80"
                      href={link.href}
                      key={`${link.label}-${link.href}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {link.icon}
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          {/* Main column */}
          <div className="space-y-10">
            <section className={`${wellnessCard} p-6 sm:p-10`}>
              <TeacherProfileWellnessBackdrop />
              <div className="relative">
                <div className="mb-6 flex items-center gap-3">
                  <IconLeafSection />
                  <h2 className="text-2xl font-bold text-[#0c3d3a] sm:text-3xl">Meet your instructor</h2>
                </div>
                <p className="whitespace-pre-line text-base leading-relaxed text-stone-700 sm:text-lg">{teacher.bio}</p>
                <div className="mt-8 hidden justify-end sm:flex" aria-hidden>
                  <div className="flex gap-1 text-4xl text-teal-800/20">
                    <span>◆</span>
                    <span>◇</span>
                  </div>
                </div>
              </div>
            </section>

            <section className={`${wellnessCard} p-6 sm:p-8`}>
              <TeacherProfileWellnessBackdrop />
              <div className="relative space-y-6">
                <h2 className="text-2xl font-bold text-[#0c3d3a]">Practice in motion</h2>
                <p className="text-stone-600">Stories and media from {teacher.fullName.split(" ")[0] ?? "this teacher"}&apos;s teaching.</p>
                <div className="grid gap-6 sm:grid-cols-2">
                  {teacher.stories.map((story) => (
                    <article
                      className="group overflow-hidden rounded-3xl border border-teal-900/10 bg-white/80 shadow-sm transition hover:shadow-md"
                      key={story.id}
                    >
                      <div className="relative aspect-[4/5] w-full bg-stone-200">
                        <Image alt={story.title} fill className="object-cover transition duration-500 group-hover:scale-[1.02]" src={story.mediaUrl} />
                        <div
                          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/45 to-transparent ${
                            story.mediaType === "video" ? "opacity-95" : "opacity-40"
                          }`}
                        >
                          {story.mediaType === "video" ? <IconPlay /> : null}
                        </div>
                        <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white capitalize">
                          {story.mediaType}
                        </span>
                      </div>
                      <div className="space-y-2 p-5">
                        <h3 className="text-lg font-semibold text-[#0c3d3a]">{story.title}</h3>
                        <p className="text-sm leading-relaxed text-stone-600">{story.caption}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {upcomingEvents.length > 0 ? (
              <section className={`${wellnessCard} p-6 sm:p-8`}>
                <TeacherProfileWellnessBackdrop />
                <div className="relative space-y-6">
                  <h2 className="text-2xl font-bold text-[#0c3d3a]">Upcoming gigs &amp; community events</h2>
                  <ul className="space-y-4">
                    {upcomingEvents.map((event) => {
                      const dateLabel = formatEventDateLabel(event);
                      return (
                        <li
                          className="flex flex-col gap-4 rounded-2xl border border-teal-900/10 bg-white/75 p-4 sm:flex-row sm:items-center sm:justify-between"
                          key={event.id}
                        >
                          <div className="flex gap-4">
                            {dateLabel ? (
                              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#0f766e] text-center text-[10px] font-bold leading-tight text-white">
                                {dateLabel.split(" ").map((part) => (
                                  <span key={part}>{part}</span>
                                ))}
                              </div>
                            ) : null}
                            <div>
                              <p className="font-semibold text-[#0c3d3a]">{event.title}</p>
                              {event.hostName ? <p className="text-sm text-stone-600">{event.hostName}</p> : null}
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <a
                              className={`${tealOutlineBtn} px-5 py-2.5 text-xs`}
                              href={event.eventUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              View details
                            </a>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            ) : null}

            <section className={`${wellnessCard} p-6 sm:p-8`}>
              <div className="relative space-y-4">
                <h2 className="text-2xl font-bold text-[#0c3d3a]">Teaching on Thryve</h2>
                <p className="text-stone-600">Hours booked through this platform, by category.</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {teacher.teachingHours.map((counter) => (
                    <MetricCard
                      hint="Booked through Thryve"
                      key={counter.category}
                      label={counter.category}
                      value={`${counter.totalHours} hrs`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {showPublicCalendar ? (
              <section className={`${wellnessCard} p-6 sm:p-8`}>
                <div className="relative space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0c3d3a]">Teaching calendar</h2>
                      <p className="text-stone-600">Upcoming sessions you can book.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="rounded-full border border-teal-800/15 bg-teal-50/90 px-4 py-2 text-sm font-semibold text-[#0f766e]">
                        {format(monthStart, "MMMM yyyy")}
                      </p>
                      {teacher.studioScheduleUrl ? (
                        <a
                          className="rounded-full border-2 border-[#0f766e] bg-white px-4 py-2 text-sm font-semibold text-[#0c4f4a] hover:bg-teal-50"
                          href={teacher.studioScheduleUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open full schedule
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-teal-900/10 bg-white/80">
                    {openCalendarSessions.length === 0 ? (
                      <div className="p-8">
                        <div className="rounded-2xl border border-dashed border-teal-800/25 bg-teal-50/40 p-6 text-center text-stone-600">
                          No listed classes this month.
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <div className="min-w-[980px]">
                          <div className="grid grid-cols-7 border-b border-teal-900/10 bg-teal-50/50 px-4 py-3 text-sm font-semibold text-[#0c4f4a]">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                              <div key={label}>{label}</div>
                            ))}
                          </div>
                          <div>
                            {calendarWeeks.map((week) => (
                              <div className="grid grid-cols-7 border-b border-teal-900/5 last:border-b-0" key={week[0]?.toISOString()}>
                                {week.map((day, dayIndex) => {
                                  const daySessions = openCalendarSessions.filter((session) =>
                                    isSameDay(new Date(session.startsAt), day)
                                  );
                                  const isInCurrentMonth = isSameMonth(day, monthStart);

                                  return (
                                    <div
                                      className={`min-h-56 p-3 ${dayIndex < 6 ? "border-r border-teal-900/5" : ""} ${
                                        isInCurrentMonth ? "bg-white/90" : "bg-stone-50/80"
                                      }`}
                                      key={day.toISOString()}
                                    >
                                      <div className="mb-2 flex items-start justify-between gap-1">
                                        <div>
                                          <p
                                            className={`text-[10px] font-bold uppercase tracking-wide ${isInCurrentMonth ? "text-teal-800/70" : "text-stone-400"}`}
                                          >
                                            {format(day, "EEE")}
                                          </p>
                                          <p
                                            className={`text-base font-bold ${isInCurrentMonth ? "text-[#0c3d3a]" : "text-stone-400"}`}
                                          >
                                            {format(day, "d")}
                                          </p>
                                        </div>
                                        {daySessions.length > 0 ? (
                                          <span className="rounded-full bg-[#0f766e]/15 px-2 py-0.5 text-[10px] font-bold text-[#0f766e]">
                                            {daySessions.length}
                                          </span>
                                        ) : null}
                                      </div>
                                      <div className="space-y-2">
                                        {daySessions.map((session) => {
                                          const offering = teacher.offerings.find((entry) => entry.id === session.offeringId);

                                          return (
                                            <article
                                              className="rounded-xl border border-teal-800/15 bg-teal-50/70 p-2.5 shadow-sm"
                                              key={session.id}
                                            >
                                              <p className="text-[10px] font-bold text-[#0f766e]">{formatTimeRange(session.startsAt, session.endsAt)}</p>
                                              <h3 className="mt-0.5 text-xs font-semibold leading-snug text-[#0c3d3a]">{session.title}</h3>
                                              <p className="mt-1 text-[10px] text-stone-600">{session.location}</p>
                                              <div className="mt-2 flex flex-wrap gap-1">
                                                <Link
                                                  className="rounded-full bg-[#0f766e] px-2.5 py-1 text-[10px] font-semibold text-white"
                                                  href={
                                                    user
                                                      ? `/teachers/${teacher.slug}/book?sessionId=${encodeURIComponent(session.id)}`
                                                      : getSignInHref(`/teachers/${teacher.slug}/book?sessionId=${encodeURIComponent(session.id)}`)
                                                  }
                                                  style={{ color: "#ffffff" }}
                                                >
                                                  Book
                                                </Link>
                                                {session.sourceUrl ? (
                                                  <a
                                                    className="rounded-full border border-teal-800/25 bg-white px-2.5 py-1 text-[10px] font-medium text-[#0c4f4a]"
                                                    href={session.sourceUrl}
                                                    rel="noreferrer"
                                                    target="_blank"
                                                  >
                                                    Source
                                                  </a>
                                                ) : null}
                                              </div>
                                            </article>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ) : null}

            <TeacherContactForm
              action={contactTeacherAction}
              className={`${wellnessCard} p-6 sm:p-8`}
              id="contact-instructor"
              siteKey={recaptchaSiteKey}
              status={query.contact}
              teacherId={teacher.id}
              teacherName={teacher.fullName}
              teacherSlug={teacher.slug}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className={`${wellnessCard} p-6`}>
              <TeacherProfileWellnessBackdrop />
              <div className="relative flex flex-col items-center text-center">
                <TeacherAvatar className="h-20 w-20 rounded-2xl ring-2 ring-white/90" height={80} name={teacher.fullName} src={teacher.avatarUrl} width={80} />
                <p className="mt-4 text-lg font-bold text-[#0c3d3a]">{teacher.fullName}</p>
                <p className="mt-1 text-sm text-teal-900/80">{specialtyLine}</p>
              </div>
            </div>

            <div className={`${wellnessCard} p-6`}>
              <TeacherProfileWellnessBackdrop />
              <div className="relative">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#0f766e]">Training &amp; credentials</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-700">{teacher.training}</p>
              </div>
            </div>

            <div className={`${wellnessCard} p-6`}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#0f766e]">Quick snapshot</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl border border-teal-900/10 bg-teal-50/50 p-3">
                  <p className="text-2xl font-bold text-[#0c3d3a]">{teacher.experienceYears}+</p>
                  <p className="text-xs font-medium text-teal-900/75">Years teaching</p>
                </div>
                <div className="rounded-2xl border border-teal-900/10 bg-teal-50/50 p-3">
                  <p className="text-2xl font-bold text-[#0c3d3a]">{Math.round(totalHoursBooked) || "—"}</p>
                  <p className="text-xs font-medium text-teal-900/75">Hours on Thryve</p>
                </div>
                <div className="rounded-2xl border border-teal-900/10 bg-white/70 p-3">
                  <p className="text-2xl font-bold text-[#0c3d3a]">{teacher.offerings.length}</p>
                  <p className="text-xs font-medium text-teal-900/75">Session types</p>
                </div>
                <div className="rounded-2xl border border-teal-900/10 bg-white/70 p-3">
                  <p className="text-2xl font-bold text-[#0c3d3a]">{teacher.serviceRadiusMiles}</p>
                  <p className="text-xs font-medium text-teal-900/75">Mile radius</p>
                </div>
              </div>
            </div>

            <div className={`${wellnessCard} p-6`}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#0f766e]">Specialties</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {teacher.styles.map((style) => (
                  <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-medium text-[#0c4f4a] ring-1 ring-teal-800/15" key={style}>
                    {style}
                  </span>
                ))}
              </div>
              <div className="mt-6 border-t border-teal-900/10 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#0f766e]">Session offerings</h3>
                <ul className="mt-3 space-y-3">
                  {teacher.offerings.map((offering) => (
                    <li className="flex items-start justify-between gap-2 text-sm" key={offering.id}>
                      <div>
                        <p className="font-semibold text-[#0c3d3a]">{offering.title}</p>
                        <p className="text-xs text-stone-500">
                          {offering.deliveryMode === "online" ? "Online" : "In person"} · {offering.sessionLengthMin} min
                        </p>
                      </div>
                      <span className="shrink-0 font-bold text-[#0f766e]">{formatCredits(offering.creditPrice)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={`${wellnessCard} p-6`}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#0f766e]">Availability</h3>
                {teacher.studioScheduleUrl ? (
                  <a
                    className="text-xs font-semibold text-[#0f766e] underline-offset-2 hover:underline"
                    href={teacher.studioScheduleUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Full calendar
                  </a>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-stone-600">
                {showPublicCalendar
                  ? teacher.studioScheduleUrl
                    ? "First open times from their calendar."
                    : "Open slots also appear on booking."
                  : "Public calendar is hidden."}
              </p>
              <div className="mt-4 space-y-2">
                {availabilitySlotsToShow.map((slot) => (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-teal-900/10 bg-teal-50/40 px-3 py-2" key={slot.id}>
                    <div>
                      <p className="text-xs font-semibold text-[#0c3d3a]">{formatDateTime(slot.startsAt)}</p>
                      <p className="text-[10px] text-stone-500">{slot.timezone}</p>
                    </div>
                    <Link
                      className="shrink-0 rounded-full bg-[#0f766e] px-3 py-1 text-[10px] font-bold text-white"
                      href={teacherBookHref}
                      style={{ color: "#ffffff" }}
                    >
                      Book
                    </Link>
                  </div>
                ))}
                {availabilitySlotsToShow.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-teal-800/20 bg-white/60 px-3 py-4 text-center text-xs text-stone-600">
                    {showPublicCalendar ? "No open times listed yet." : "Live times hidden."}
                  </p>
                ) : null}
              </div>
            </div>

            {totalHoursBooked ? (
              <div className={`${wellnessCard} border-[#0f766e]/25 bg-gradient-to-br from-teal-50/95 to-white/90 p-6 text-center`}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0f766e]">Thryve</p>
                <p className="mt-2 text-lg font-bold text-[#0c3d3a]">
                  {Math.round(totalHoursBooked)}+ hours taught here
                </p>
                <p className="mt-1 text-xs text-teal-900/70">Thank you for supporting teachers on the platform.</p>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
