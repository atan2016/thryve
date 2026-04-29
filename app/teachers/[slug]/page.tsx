import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HoursBookedLabel } from "@/components/hours-booked-label";
import { MetricCard } from "@/components/metric-card";
import { formatCredits, formatDateTime } from "@/lib/format";
import { getTeacherBySlug } from "@/lib/store";

type TeacherProfileProps = {
  params: Promise<{ slug: string }>;
};

export default async function TeacherProfilePage({ params }: TeacherProfileProps) {
  const { slug } = await params;
  const teacher = getTeacherBySlug(slug);

  if (!teacher) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-5">
            {teacher.avatarUrl ? (
              <Image
                alt={teacher.fullName}
                className="h-32 w-32 rounded-[1.5rem] object-cover"
                height={128}
                src={teacher.avatarUrl}
                width={128}
              />
            ) : null}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold">{teacher.fullName}</h1>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                  {teacher.certificationStatus === "certified" ? "Certified" : "Not certified"}
                </span>
              </div>
              <p className="text-stone-500">
                {teacher.city} • {teacher.serviceRadiusMiles} mile service radius •{" "}
                {teacher.platformHoursBooked ? (
                  <HoursBookedLabel hours={teacher.platformHoursBooked} teacherName={teacher.fullName} />
                ) : (
                  <span>{`${teacher.experienceYears} years teaching`}</span>
                )}
              </p>
            </div>
          </div>
          <p className="max-w-3xl text-lg text-stone-700">{teacher.bio}</p>
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
                    badge.name === "200RYT" || badge.name === "Yin Yoga"
                      ? "h-16 w-16 object-contain"
                      : badge.name === "Red Cross"
                        ? "h-[88px] w-[88px] object-contain"
                        : "h-20 w-20 object-contain"
                  }
                  height={badge.name === "200RYT" || badge.name === "Yin Yoga" ? 64 : badge.name === "Red Cross" ? 88 : 80}
                  key={badge.name}
                  src={badge.imageUrl}
                  width={badge.name === "200RYT" || badge.name === "Yin Yoga" ? 64 : badge.name === "Red Cross" ? 88 : 80}
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
    </div>
  );
}
