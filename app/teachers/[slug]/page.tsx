import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HoursBookedLabel } from "@/components/hours-booked-label";
import { MetricCard } from "@/components/metric-card";
import { TeacherContactForm } from "@/components/teacher-contact-form";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { contactTeacherAction } from "@/lib/actions";
import { formatCredits, formatDateTime } from "@/lib/format";
import { getTeacherBySlug } from "@/lib/persistence";
import { getRecaptchaSiteKey } from "@/lib/recaptcha";

type TeacherProfileProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ contact?: string }>;
};

export default async function TeacherProfilePage({ params, searchParams }: TeacherProfileProps) {
  const { slug } = await params;
  const query = await searchParams;
  const teacher = await getTeacherBySlug(slug);
  const recaptchaSiteKey = getRecaptchaSiteKey();

  if (!teacher) {
    notFound();
  }

  const totalHoursBooked =
    teacher.teachingHours.reduce((total, counter) => total + counter.totalHours, 0) || teacher.platformHoursBooked;

  return (
    <div className="space-y-8">
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
              {teacher.slug === "ashley-tan" ? (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    aria-label="Yoga by Ashley Tan website"
                    className="opacity-80 transition-opacity hover:opacity-100"
                    href="https://yogabyashleytan.com/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Image alt="" className="h-9 w-9 object-contain" height={36} src="/assets/images/website_icon.png" width={36} />
                  </a>
                  <a
                    aria-label="Facebook"
                    className="opacity-80 transition-opacity hover:opacity-100"
                    href="https://www.facebook.com/xtan1"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Image alt="" className="h-[28.8px] w-[28.8px] rounded-full object-cover" height={36} src="/assets/images/facebook_icon.jpeg" width={36} />
                  </a>
                  <a
                    aria-label="Instagram"
                    className="opacity-80 transition-opacity hover:opacity-100"
                    href="https://www.instagram.com/ashleytan2017/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Image alt="" className="h-[28.8px] w-[28.8px] rounded-md object-cover" height={36} src="/assets/images/instagram_icon.jpeg" width={36} />
                  </a>
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
              href={`/teachers/${teacher.slug}/book`}
            >
              Book with credits
            </Link>
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

      {teacher.upcomingEvents?.length ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Upcoming Events</h2>
            <p className="text-stone-500">See where this instructor is currently teaching and explore upcoming classes or studio events.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {teacher.upcomingEvents.map((event) => (
              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm" key={event.id}>
                <p className="text-sm font-medium text-emerald-700">Upcoming event</p>
                <h3 className="mt-2 text-xl font-semibold">{event.title}</h3>
                {event.hostName ? <p className="mt-2 text-sm text-stone-500">{event.hostName}</p> : null}
                <p className="mt-2 text-sm text-stone-600">
                  {event.eventDate
                    ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "Ongoing schedule"}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    className="inline-flex items-center justify-center rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white"
                    href={event.eventUrl}
                    rel="noreferrer"
                    style={{ color: "#ffffff" }}
                    target="_blank"
                  >
                    Book
                  </a>
                  {teacher.studioWebsiteUrl ? (
                    <a className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm" href={teacher.studioWebsiteUrl} rel="noreferrer" target="_blank">
                      Studio website
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Stories and media</h2>
            <p className="text-stone-500">Showcase personality, style, and teaching philosophy through visuals.</p>
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
          <h2 className="text-2xl font-semibold">Availability</h2>
          <p className="mt-2 text-stone-500">Only open time slots appear here and on the booking screen.</p>
          <div className="mt-5 space-y-3">
            {teacher.availability
              .filter((slot) => !slot.isBooked)
              .map((slot) => (
                <div className="rounded-2xl bg-stone-50 p-4" key={slot.id}>
                  <p className="font-medium">{formatDateTime(slot.startsAt)}</p>
                  <p className="text-sm text-stone-500">{slot.timezone}</p>
                </div>
              ))}
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
