import Link from "next/link";

import { ConnectWithPeers } from "@/components/connect-with-peers";
import { buildConnectPeers } from "@/lib/connect-peers";
import { FeaturedEventsCarousel } from "@/components/featured-events-carousel";
import { FeaturedLocalGigsCarousel } from "@/components/featured-local-gigs-carousel";
import { TeacherCard } from "@/components/teacher-card";
import { getSession } from "@/lib/auth/session";
import { listTeachers } from "@/lib/persistence";

export default async function HomePage() {
  const session = await getSession();
  const teachers = await listTeachers();
  const connectPeers = session ? buildConnectPeers(teachers, { excludeUserId: session.userId }) : [];

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-stone-900 px-6 py-6 text-white sm:px-7 sm:py-7">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold leading-snug sm:text-3xl">Help teachers market their style, stories, and availability in one bookable home.</h1>
          <p className="max-w-2xl text-sm text-stone-200 sm:text-base">
            Students can filter by category, style, teacher gender, certification, format, and date, then book with credits.
            Teachers can manage content, availability, earnings, and session history.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-stone-900 sm:px-5 sm:py-2.5 sm:text-base" href="/teachers">
              Explore teachers
            </Link>
            {session?.role === "teacher" ? (
              <Link className="rounded-full border border-white/20 px-4 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base" href="/dashboard/teacher/profile">
                Open teacher dashboard
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <FeaturedEventsCarousel />

      <FeaturedLocalGigsCarousel />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Featured teachers</h2>
            <p className="text-stone-500">Public profiles highlight stories, badges, styles, and credit-based offerings.</p>
          </div>
          <Link className="text-sm font-medium text-emerald-700" href="/teachers">
            View all teachers
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </section>

      {session ? <ConnectWithPeers key={session.userId} peers={connectPeers} /> : null}
    </div>
  );
}
