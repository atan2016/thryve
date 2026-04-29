import Image from "next/image";
import Link from "next/link";

import { HoursBookedLabel } from "@/components/hours-booked-label";
import { formatCredits } from "@/lib/format";

type TeacherCardProps = {
  teacher: {
    slug: string;
    fullName: string;
    avatarUrl?: string;
    platformHoursBooked?: number;
    city: string;
    experienceYears: number;
    styles: string[];
    badges: Array<{ name: string; verified: boolean; imageUrl?: string }>;
    offerings: Array<{ title: string; creditPrice: number; deliveryMode: string; sessionLengthMin: number }>;
  };
};

export function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {teacher.avatarUrl ? (
            <Image
              alt={teacher.fullName}
              className="h-[72px] w-[72px] rounded-2xl object-cover"
              height={72}
              src={teacher.avatarUrl}
              width={72}
            />
          ) : null}
          <div>
            <h3 className="text-xl font-semibold">{teacher.fullName}</h3>
            <p className="text-sm text-stone-500">
              {teacher.city} •{" "}
              {teacher.platformHoursBooked ? (
                <HoursBookedLabel hours={teacher.platformHoursBooked} teacherName={teacher.fullName} />
              ) : (
                <span>{`${teacher.experienceYears} years teaching`}</span>
              )}
            </p>
          </div>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white"
          href={`/teachers/${teacher.slug}`}
          style={{ color: "#ffffff" }}
        >
          Book
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {teacher.styles.map((style) => (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700" key={style}>
            {style}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-stone-500">
        {teacher.badges.map((badge) => (
          badge.imageUrl ? (
            <Image
              alt={badge.name}
              className={
                badge.name === "200RYT" || badge.name === "Yin Yoga"
                  ? "h-[45px] w-[45px] object-contain"
                  : badge.name === "Red Cross"
                    ? "h-[62px] w-[62px] object-contain"
                    : "h-14 w-14 object-contain"
              }
              height={badge.name === "200RYT" || badge.name === "Yin Yoga" ? 45 : badge.name === "Red Cross" ? 62 : 56}
              key={badge.name}
              src={badge.imageUrl}
              width={badge.name === "200RYT" || badge.name === "Yin Yoga" ? 45 : badge.name === "Red Cross" ? 62 : 56}
            />
          ) : (
            <span className="rounded-full border border-stone-200 px-3 py-1" key={badge.name}>
              {badge.name}
              {badge.verified ? " verified" : ""}
            </span>
          )
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {teacher.offerings.slice(0, 2).map((offering) => (
          <div className="rounded-2xl bg-stone-50 p-4" key={offering.title}>
            <p className="font-medium">{offering.title}</p>
            <p className="text-sm text-stone-500">
              {offering.deliveryMode === "online" ? "Online" : "In person"} • {offering.sessionLengthMin} min
            </p>
            <p className="mt-2 text-sm font-semibold">{formatCredits(offering.creditPrice)}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
