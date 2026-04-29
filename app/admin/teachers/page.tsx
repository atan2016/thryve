import { MetricCard } from "@/components/metric-card";
import { getAdminSnapshot } from "@/lib/store";

export default function AdminTeachersPage() {
  const snapshot = getAdminSnapshot();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Admin: teachers</h1>
        <p className="mt-2 text-stone-500">Approve teacher content, verify badges, and monitor published profiles.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Published teachers" value={snapshot.teachers.length} />
        <MetricCard label="Tracked revenue" value={`${snapshot.totalGross} credits`} />
        <MetricCard label="Platform commission" value={`${snapshot.totalCommission} credits`} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {snapshot.teachers.map((teacher) => (
          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm" key={teacher.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{teacher.fullName}</h2>
                <p className="text-stone-500">
                  {teacher.city} • {teacher.certificationStatus === "certified" ? "Certified" : "Not certified"}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">Published</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {teacher.badges.map((badge) => (
                <span className="rounded-full border border-stone-200 px-3 py-1" key={badge.name}>
                  {badge.name}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
