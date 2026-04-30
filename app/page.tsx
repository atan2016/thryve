import Link from "next/link";

import { TeacherCard } from "@/components/teacher-card";
import { getSession } from "@/lib/auth/session";
import { listTeachers } from "@/lib/persistence";

export default async function HomePage() {
  const session = await getSession();
  const teachers = await listTeachers();

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] bg-stone-900 px-8 py-10 text-white">
        <div className="space-y-5">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm">Story-led yoga teacher marketplace</span>
          <h1 className="text-4xl font-semibold leading-tight">Help teachers market their style, stories, and availability in one bookable home.</h1>
          <p className="max-w-2xl text-stone-200">
            Students can filter by category, style, teacher gender, certification, format, and date, then book with credits.
            Teachers can manage content, availability, earnings, and session history.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-full bg-emerald-400 px-5 py-3 font-medium text-stone-900" href="/teachers">
              Explore teachers
            </Link>
            {session?.role === "teacher" ? (
              <Link className="rounded-full border border-white/20 px-5 py-3" href="/dashboard/teacher/profile">
                Open teacher dashboard
              </Link>
            ) : null}
          </div>
        </div>
      </section>

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
    </div>
  );
}
