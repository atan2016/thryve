import { AdminDashboardAccessCard } from "@/components/admin-dashboard-access-card";
import { AdminDashboardNav } from "@/components/admin-dashboard-nav";
import { reviewTeacherCertificationSubmissionAction } from "@/lib/actions";
import { getAdminDashboardContext } from "@/lib/admin-dashboard";
import { MetricCard } from "@/components/metric-card";
import { getAdminSnapshot } from "@/lib/store";
import { listTeachersForAdmin } from "@/lib/persistence";

export default async function AdminTeachersPage() {
  const context = await getAdminDashboardContext();

  if (context.status === "signed_out") {
    return <AdminDashboardAccessCard state="signed_out" />;
  }

  if (context.status === "wrong_role") {
    return <AdminDashboardAccessCard state="wrong_role" userName={context.user.name} />;
  }

  const snapshot = getAdminSnapshot();
  const teachers = await listTeachersForAdmin();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Admin: teachers</h1>
          <p className="mt-2 text-stone-500">Approve teacher content, verify badges, and monitor published profiles.</p>
        </div>
        <AdminDashboardNav current="teachers" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Published teachers" value={snapshot.teachers.length} />
        <MetricCard label="Tracked revenue" value={`${snapshot.totalGross} credits`} />
        <MetricCard label="Platform commission" value={`${snapshot.totalCommission} credits`} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {teachers.map((teacher) => (
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
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Certification submissions</h3>
              {teacher.certificationSubmissions?.length ? (
                teacher.certificationSubmissions.map((submission) => (
                  <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4" key={submission.id}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{submission.credentialName}</p>
                        <p className="mt-1 text-sm text-stone-500">{submission.fileName}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                          submission.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : submission.status === "rejected"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    {submission.notes ? <p className="mt-2 text-sm text-stone-600">{submission.notes}</p> : null}
                    {submission.reviewNote ? <p className="mt-2 text-sm text-stone-600">Review note: {submission.reviewNote}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-3">
                      <a className="inline-flex text-sm font-medium text-emerald-700" href={submission.fileUrl} rel="noreferrer" target="_blank">
                        Open uploaded file
                      </a>
                      <span className="text-sm text-stone-500">
                        Submitted {new Date(submission.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <form action={reviewTeacherCertificationSubmissionAction} className="mt-4 space-y-3">
                      <input name="submissionId" type="hidden" value={submission.id} />
                      <input name="teacherSlug" type="hidden" value={teacher.slug} />
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium">Review note (optional)</span>
                        <textarea className="min-h-20" defaultValue={submission.reviewNote} name="reviewNote" />
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white" name="decision" type="submit" value="approved">
                          Approve and mark certified
                        </button>
                        <button className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white" name="decision" type="submit" value="rejected">
                          Reject
                        </button>
                      </div>
                    </form>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500">
                  No certification files uploaded yet.
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
