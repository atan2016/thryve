import { Link } from "wouter";
import { format, eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek, isSameDay, isSameMonth } from "date-fns";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { HoursBookedLabel } from "@/components/hours-booked-label";
import { TeacherHeartControl } from "@/components/teacher-heart-control";
import { formatCredits, formatEventCalendarDayUtc } from "@/lib/format";
import { BOOKING_ENABLED } from "@/lib/constants";
import { demoTeachers, getTeacherWithDetails } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";

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

function IconVerified() {
  return (
    <svg className="h-7 w-7 shrink-0 text-[#0f766e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
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

const wellnessCard =
  "relative overflow-hidden rounded-[2rem] border border-teal-900/10 bg-white/90 shadow-[0_24px_70px_-48px_rgba(15,80,75,0.42)] backdrop-blur-sm";

const tealSolidBtn =
  "inline-flex items-center justify-center rounded-full bg-[#0f766e] px-7 py-3.5 text-center text-sm font-semibold text-white shadow-[0_16px_40px_-22px_rgba(15,118,110,0.85)] transition hover:bg-[#0d9488]";

const tealOutlineBtn =
  "inline-flex items-center justify-center rounded-full border-2 border-[#0f766e] bg-white/80 px-7 py-3.5 text-center text-sm font-semibold text-[#0c4f4a] transition hover:bg-teal-50";

type TeacherProfilePageProps = {
  slug: string;
};

export function TeacherProfilePage({ slug }: TeacherProfilePageProps) {
  const { user } = useAuth();
  const rawTeacher = demoTeachers.find((t) => t.slug === slug);

  if (!rawTeacher) {
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-900">Teacher not found</h1>
        <p className="mt-2 text-stone-500">We couldn't find that teacher profile.</p>
        <Link className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white" href="/teachers">
          Browse teachers
        </Link>
      </div>
    );
  }

  const teacher = getTeacherWithDetails(rawTeacher);
  const isCertified = teacher.certificationStatus === "certified";
  const bioLead = excerptBio(teacher.bio);
  const specialtyLine = teacher.styles?.slice(0, 4).join(" · ") ?? "Yoga & movement";
  const upcomingEvents = teacher.upcomingEvents ?? [];
  const calendarSessions = teacher.calendarSessions ?? [];

  const viewerUserId = user?.id ?? null;
  const canHeart = user && user.id !== teacher.userId;
  const heartInteraction = canHeart ? "toggle" as const : user ? "none" as const : "signin" as const;

  const teacherLinks: Array<{ href: string; label: string; icon: JSX.Element }> = [];
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

  return (
    <div className="relative -mx-4 min-h-screen bg-gradient-to-b from-[#ebe8df] via-[#f4f1ea] to-[#e5efec] px-4 pb-20 pt-2 sm:-mx-6 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#fdba8c]/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-[28rem] w-[28rem] translate-x-1/4 rounded-full bg-teal-300/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl space-y-10">
        <section className={`${wellnessCard} p-6 sm:p-10 lg:p-12`}>
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
                      <img alt="" className="h-5 w-5 object-contain" src={badge.imageUrl} />
                    ) : null}
                    {badge.name}
                    {badge.verified && !badge.imageUrl ? " · verified" : null}
                  </span>
                ))}
                {teacher.styles?.map((style) => (
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
                  <span className="text-lg" aria-hidden>◎</span>
                  {teacher.city} · {teacher.serviceRadiusMiles} mi radius
                </span>
                <span className="inline-flex items-center gap-2 font-medium">
                  <span className="text-lg" aria-hidden>✦</span>
                  {teacher.experienceYears}+ years teaching
                </span>
                {teacher.platformHoursBooked ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-teal-700/20 bg-teal-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0f766e]">
                    <span aria-hidden>🌿</span>
                    <HoursBookedLabel hours={teacher.platformHoursBooked} teacherName={teacher.fullName} />
                  </span>
                ) : null}
              </div>

              <p className="max-w-3xl text-lg leading-relaxed text-stone-700">{bioLead}</p>

              <div className="flex flex-wrap gap-3 pt-1">
                {BOOKING_ENABLED ? (
                  <Link className={tealSolidBtn} href={user ? `/teachers/${teacher.slug}/book` : `/sign-in?next=${encodeURIComponent(`/teachers/${teacher.slug}/book`)}`}>
                    Book a session
                  </Link>
                ) : null}
                <TeacherHeartControl
                  heartInteraction={heartInteraction}
                  profileButtonClassName={tealOutlineBtn}
                  serverHeartCount={0}
                  serverViewerHasHearted={false}
                  teacherFullName={teacher.fullName}
                  teacherId={teacher.id}
                  teacherSlug={teacher.slug}
                  variant="profile"
                  viewerUserId={viewerUserId}
                />
              </div>

              {teacherLinks.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {teacherLinks.map((link) => (
                    <a
                      className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/80 px-3.5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                      href={link.href}
                      key={link.label}
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

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            {teacher.bio && teacher.bio.trim().length > bioLead.length ? (
              <section className={`${wellnessCard} p-6 sm:p-8`}>
                <h2 className="text-xl font-semibold text-[#0c3d3a]">About {teacher.fullName.split(" ")[0]}</h2>
                <div className="mt-4 space-y-4 whitespace-pre-line text-stone-700">{teacher.bio}</div>
              </section>
            ) : null}

            {teacher.training ? (
              <section className={`${wellnessCard} p-6 sm:p-8`}>
                <h2 className="text-xl font-semibold text-[#0c3d3a]">Training & Background</h2>
                <p className="mt-4 text-stone-700">{teacher.training}</p>
              </section>
            ) : null}

            {teacher.offerings.length > 0 ? (
              <section className={`${wellnessCard} p-6 sm:p-8`}>
                <h2 className="text-xl font-semibold text-[#0c3d3a]">Services & Sessions</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {teacher.offerings.map((offering) => (
                    <div
                      className="rounded-2xl border border-teal-100/80 bg-gradient-to-br from-teal-50/80 to-emerald-50/60 p-5"
                      key={offering.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#0c3d3a]">{offering.title}</p>
                          <p className="mt-1 text-sm text-stone-500">
                            {offering.deliveryMode === "online" ? "Online" : "In person"} · {offering.sessionLengthMin} min
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-[#0f766e] ring-1 ring-teal-200">
                          {formatCredits(offering.creditPrice)}
                        </span>
                      </div>
                      {offering.description ? (
                        <p className="mt-3 text-sm text-stone-600">{offering.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {upcomingEvents.length > 0 ? (
              <section className={`${wellnessCard} p-6 sm:p-8`}>
                <h2 className="text-xl font-semibold text-[#0c3d3a]">Upcoming Events</h2>
                <ul className="mt-4 space-y-3">
                  {upcomingEvents.map((event) => (
                    <li
                      className="flex items-start gap-3 rounded-2xl border border-teal-100/60 bg-teal-50/60 p-4"
                      key={event.id}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-[#0c3d3a]">{event.title}</p>
                        <p className="mt-0.5 text-sm text-stone-500">
                          by {event.hostName}
                          {event.eventDate ? ` · ${formatEventCalendarDayUtc(event.eventDate)}` : ""}
                        </p>
                      </div>
                      {event.eventUrl ? (
                        <a
                          className="shrink-0 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0f766e] transition hover:bg-teal-50"
                          href={event.eventUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          View
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6">
            {teacher.studioScheduleUrl || teacher.studioName ? (
              <div className={`${wellnessCard} p-6`}>
                <h3 className="font-semibold text-[#0c3d3a]">{teacher.studioName ?? "Studio"}</h3>
                {teacher.studioScheduleUrl ? (
                  <a
                    className="mt-3 block rounded-full border border-teal-200 bg-teal-50 px-4 py-2.5 text-center text-sm font-semibold text-[#0f766e] transition hover:bg-teal-100"
                    href={teacher.studioScheduleUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    View Schedule
                  </a>
                ) : null}
              </div>
            ) : null}

            {!user ? (
              <div className={`${wellnessCard} p-6 text-center`}>
                <p className="text-sm text-stone-600">Sign in to book sessions and follow this teacher.</p>
                <Link
                  className="mt-4 inline-flex rounded-full bg-[#0f766e] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9488]"
                  href={`/sign-in?next=${encodeURIComponent(`/teachers/${teacher.slug}`)}`}
                >
                  Sign in
                </Link>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
