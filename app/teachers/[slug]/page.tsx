import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { differenceInMinutes, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";

import { HoursBookedLabel } from "@/components/hours-booked-label";
import { MetricCard } from "@/components/metric-card";
import { TeacherContactForm } from "@/components/teacher-contact-form";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { contactTeacherAction, toggleTeacherFollowAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { formatCredits, formatDateTime } from "@/lib/format";
import { getTeacherBySlug, getTeacherByUserId, isTeacherFollowedByUser } from "@/lib/persistence";
import { getRecaptchaSiteKey } from "@/lib/recaptcha";

type TeacherProfileProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ contact?: string }>;
};

function IconGlobe() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c4.832 0 8.75 3.918 8.75 8.75S16.832 19.75 12 19.75 3.25 15.832 3.25 11 7.168 2.25 12 2.25zm0 0c2.183 2.154 3.5 5.185 3.5 8.75s-1.317 6.596-3.5 8.75m0-17.5C9.817 4.404 8.5 7.435 8.5 11s1.317 6.596 3.5 8.75M3.9 8h16.2M3.9 14h16.2" />
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

function formatTimeRange(startsAt: string, endsAt: string) {
  return `${format(new Date(startsAt), "h:mm a")} - ${format(new Date(endsAt), "h:mm a")}`;
}

function getSignInHref(nextPath: string) {
  return `/sign-in?next=${encodeURIComponent(nextPath)}`;
}

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

  const totalHoursBooked =
    teacher.teachingHours.reduce((total, counter) => total + counter.totalHours, 0) || teacher.platformHoursBooked;
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

  return (
    <div className="space-y-8">
      {isOwnerPreview ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This profile is not published yet. Only you can view this preview until you save and publish it from the teacher dashboard.
        </div>
      ) : null}

      <section className="grid gap-6 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-5">
            <TeacherAvatar className="h-32 w-32 rounded-[1.5rem]" height={128} name={teacher.fullName} src={teacher.avatarUrl} width={128} />
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold">{teacher.fullName}</h1>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                  {teacher.certificationStatus === "certified" ? "Certified" : "Not certified"}
                </span>
              </div>
              <p className="text-stone-500">
                {teacher.city} • {teacher.serviceRadiusMiles} mile service radius
                {totalHoursBooked ? (
                  <>
                    {" • "}
                    <HoursBookedLabel hours={totalHoursBooked} teacherName={teacher.fullName} />
                  </>
                ) : null}
              </p>
              {teacherLinks.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {teacherLinks.map((link) => (
                    <a
                      aria-label={link.label}
                      className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 transition hover:border-stone-300 hover:bg-stone-100"
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
          <p className="max-w-3xl whitespace-pre-line text-lg text-stone-700">{teacher.bio}</p>
          <div className="flex flex-wrap gap-2 text-sm">
            {teacher.styles.map((style) => (
              <span className="rounded-full bg-stone-100 px-3 py-1" key={style}>
                {style}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {teacher.badges.map((badge) => (
              badge.imageUrl ? (
                <Image
                  alt={badge.name}
                  className={
                    badge.name === "Background Checked"
                      ? "h-[139px] w-[139px] object-contain"
                      : badge.name === "200RYT" || badge.name === "Yin Yoga" || badge.name === "Kids Yoga"
                      ? "h-16 w-16 object-contain"
                      : badge.name === "Red Cross"
                        ? "h-[88px] w-[88px] object-contain"
                        : "h-20 w-20 object-contain"
                  }
                  height={badge.name === "Background Checked" ? 139 : badge.name === "200RYT" || badge.name === "Yin Yoga" || badge.name === "Kids Yoga" ? 64 : badge.name === "Red Cross" ? 88 : 80}
                  key={badge.name}
                  src={badge.imageUrl}
                  width={badge.name === "Background Checked" ? 139 : badge.name === "200RYT" || badge.name === "Yin Yoga" || badge.name === "Kids Yoga" ? 64 : badge.name === "Red Cross" ? 88 : 80}
                />
              ) : (
                <span className="rounded-full border border-stone-200 px-3 py-1" key={badge.name}>
                  {badge.name}
                  {badge.verified ? " verified" : ""}
                </span>
              )
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 font-medium text-stone-900 shadow-[0_14px_35px_-18px_rgba(16,185,129,0.9)] transition hover:-translate-y-0.5 hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              href={teacherBookHref}
            >
              Book with credits
            </Link>
            {canFollowTeacher ? (
              <form action={toggleTeacherFollowAction}>
                <input name="teacherId" type="hidden" value={teacher.id} />
                <input name="teacherSlug" type="hidden" value={teacher.slug} />
                <input name="intent" type="hidden" value={isFollowedByViewer ? "unfollow" : "follow"} />
                <button className="rounded-full border border-teal-200 bg-teal-50 px-5 py-3 font-medium text-teal-700" type="submit">
                  {isFollowedByViewer ? "Following" : "Follow teacher"}
                </button>
              </form>
            ) : null}
            <Link className="rounded-full border border-stone-300 px-5 py-3" href="/teachers">
              Back to discovery
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] bg-stone-50 p-6">
          <h2 className="text-lg font-semibold">Training</h2>
          <p className="mt-3 text-stone-600">{teacher.training}</p>
          <div className="mt-6 space-y-3">
            {teacher.offerings.map((offering) => (
              <div className="rounded-2xl bg-white p-4" key={offering.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{offering.title}</p>
                    <p className="text-sm text-stone-500">
                      {offering.deliveryMode === "online" ? "Online" : "In person"} • {offering.sessionLengthMin} min
                    </p>
                  </div>
                  <span className="font-semibold">{formatCredits(offering.creditPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Teaching history booked on Thryve</h2>
          <p className="text-stone-500">These hours reflect sessions booked through this platform, grouped by teaching category.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {teacher.teachingHours.map((counter) => (
            <MetricCard
              hint="Booked through Thryve"
              key={counter.category}
              label={counter.category}
              value={`${counter.totalHours} hrs`}
            />
          ))}
        </div>
      </section>

      {showPublicCalendar ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Teaching calendar</h2>
              <p className="text-stone-500">See upcoming sessions from this instructor and book a specific class time.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
                {format(monthStart, "MMMM yyyy")}
              </p>
              {teacher.studioScheduleUrl ? (
                <a
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800"
                  href={teacher.studioScheduleUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open full availability
                </a>
              ) : null}
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
            {openCalendarSessions.length === 0 ? (
              <div className="p-8">
                <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-stone-500">
                  No listed classes this month.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[980px]">
                  <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50 px-5 py-4 text-sm font-medium text-stone-500">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                      <div key={label}>
                        <span className="block text-stone-900">{label}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    {calendarWeeks.map((week) => (
                      <div className="grid grid-cols-7 border-b border-stone-100 last:border-b-0" key={week[0]?.toISOString()}>
                        {week.map((day, dayIndex) => {
                          const daySessions = openCalendarSessions.filter((session) => isSameDay(new Date(session.startsAt), day));
                          const isInCurrentMonth = isSameMonth(day, monthStart);

                          return (
                            <div
                              className={`min-h-64 p-4 ${dayIndex < 6 ? "border-r border-stone-100" : ""} ${isInCurrentMonth ? "bg-white" : "bg-stone-50/70"}`}
                              key={day.toISOString()}
                            >
                              <div className="mb-3 flex items-start justify-between gap-2">
                                <div>
                                  <p className={`text-xs font-medium uppercase tracking-wide ${isInCurrentMonth ? "text-stone-500" : "text-stone-400"}`}>
                                    {format(day, "EEE")}
                                  </p>
                                  <p className={`mt-1 text-lg font-semibold ${isInCurrentMonth ? "text-stone-900" : "text-stone-400"}`}>
                                    {format(day, "d")}
                                  </p>
                                </div>
                                {daySessions.length > 0 ? (
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                                    {daySessions.length}
                                  </span>
                                ) : null}
                              </div>
                              <div className="space-y-3">
                                {daySessions.map((session) => {
                                  const offering = teacher.offerings.find((entry) => entry.id === session.offeringId);

                                  return (
                                    <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3" key={session.id}>
                                      <p className="text-xs font-semibold text-emerald-900">{formatTimeRange(session.startsAt, session.endsAt)}</p>
                                      <h3 className="mt-1 text-sm font-semibold leading-snug">{session.title}</h3>
                                      <p className="mt-2 text-xs text-stone-600">{session.location}</p>
                                      <p className="mt-1 text-xs text-stone-500">
                                        {offering?.deliveryMode === "online" ? "Online" : "In person"} /{" "}
                                        {differenceInMinutes(new Date(session.endsAt), new Date(session.startsAt))} min
                                      </p>
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        <Link
                                          className="rounded-full bg-stone-900 px-3 py-1.5 text-[11px] font-medium text-white"
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
                                            className="rounded-full border border-stone-300 px-3 py-1.5 text-[11px] font-medium"
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
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Stories and media</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {teacher.stories.map((story) => (
              <article className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm" key={story.id}>
                <div className="relative h-56">
                  <Image alt={story.title} fill className="object-cover" src={story.mediaUrl} />
                </div>
                <div className="space-y-2 p-5">
                  <p className="text-xs uppercase tracking-wide text-stone-500">{story.mediaType}</p>
                  <h3 className="text-xl font-semibold">{story.title}</h3>
                  <p className="text-stone-600">{story.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Availability</h2>
            {teacher.studioScheduleUrl ? (
              <a
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
                href={teacher.studioScheduleUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open calendar
              </a>
            ) : null}
          </div>
          <p className="mt-2 text-stone-500">
            {showPublicCalendar
              ? teacher.studioScheduleUrl
                ? "Showing the first 3 open times from the instructor&apos;s calendar."
                : "Only open time slots appear here and on the booking screen."
              : "This teacher is not currently showing live calendar times on their public profile."}
          </p>
          <div className="mt-5 space-y-3">
            {availabilitySlotsToShow.map((slot) => (
                <div className="rounded-2xl bg-stone-50 p-4" key={slot.id}>
                  <p className="font-medium">{formatDateTime(slot.startsAt)}</p>
                  <p className="text-sm text-stone-500">{slot.timezone}</p>
                </div>
              ))}
            {availabilitySlotsToShow.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-500">
                {showPublicCalendar ? "No open availability yet." : "Live booking times are hidden for now."}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <TeacherContactForm
        action={contactTeacherAction}
        siteKey={recaptchaSiteKey}
        status={query.contact}
        teacherId={teacher.id}
        teacherName={teacher.fullName}
        teacherSlug={teacher.slug}
      />
    </div>
  );
}
