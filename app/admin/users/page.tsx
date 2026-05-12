import Link from "next/link";

import { AdminDashboardAccessCard } from "@/components/admin-dashboard-access-card";
import { AdminDashboardNav } from "@/components/admin-dashboard-nav";
import { MetricCard } from "@/components/metric-card";
import { deleteUserAsAdminAction, updateUserAsAdminAction } from "@/lib/actions";
import { getAdminDashboardContext } from "@/lib/admin-dashboard";
import { listUsersForAdmin } from "@/lib/persistence";

type AdminUsersPageProps = {
  searchParams: Promise<{ saved?: string; removed?: string; error?: string }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const context = await getAdminDashboardContext();
  const params = await searchParams;

  if (context.status === "signed_out") {
    return <AdminDashboardAccessCard state="signed_out" />;
  }

  if (context.status === "wrong_role") {
    return <AdminDashboardAccessCard state="wrong_role" userName={context.user.name} />;
  }

  const users = await listUsersForAdmin();
  const adminCount = users.filter((user) => user.role === "admin").length;
  const teacherCount = users.filter((user) => user.role === "teacher").length;
  const customerCount = users.filter((user) => user.role === "customer").length;
  const verifiedCount = users.filter((user) => user.emailVerifiedAt).length;

  const feedbackMessage =
    params.saved === "user"
      ? "User updated."
      : params.saved === "email_change_requested"
        ? "User updated. A confirmation email was sent to the new address before the email change will be applied."
      : params.removed === "user"
        ? "User removed."
        : params.error === "cannot_delete_self"
          ? "You cannot remove the admin account you are currently using."
          : params.error === "cannot_demote_self"
            ? "You cannot remove your own admin access while signed in."
            : params.error === "email_in_use"
              ? "That email is already in use."
              : params.error === "email_pending"
                ? "That email is already waiting for confirmation."
              : params.error === "update_failed"
                ? "We couldn't update that user."
                : params.error === "delete_failed"
                  ? "We couldn't remove that user."
                  : null;

  const feedbackTone =
    params.error === "cannot_delete_self" ||
    params.error === "cannot_demote_self" ||
    params.error === "email_in_use" ||
    params.error === "email_pending" ||
    params.error === "update_failed" ||
    params.error === "delete_failed"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Admin: users</h1>
          <p className="mt-2 text-stone-500">Update account details, adjust roles, and remove users when needed.</p>
        </div>
        <AdminDashboardNav current="users" />
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total users" value={users.length} />
        <MetricCard label="Admins" value={adminCount} />
        <MetricCard label="Teachers" value={teacherCount} />
        <MetricCard label="Verified emails" value={verifiedCount} />
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Accounts</h2>
            <p className="mt-1 text-sm text-stone-500">
              Customers: {customerCount}. Removing a teacher account keeps the teacher profile unclaimed rather than deleting it.
            </p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">{users.length} records</span>
        </div>

        {feedbackMessage ? <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${feedbackTone}`}>{feedbackMessage}</div> : null}

        <div className="mt-6 space-y-4">
          {users.map((user) => {
            const isCurrentAdmin = user.id === context.user.id;

            return (
              <article className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5" key={user.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <p className="text-sm text-stone-500">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-stone-600">
                      {user.role}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                        user.emailVerifiedAt ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {user.emailVerifiedAt ? "verified" : "unverified"}
                    </span>
                    {isCurrentAdmin ? (
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-sky-700">
                        current session
                      </span>
                    ) : null}
                  </div>
                </div>

                {user.linkedTeacherId ? (
                  <p className="mt-3 text-sm text-stone-600">
                    Linked teacher profile:{" "}
                    {user.linkedTeacherSlug ? (
                      <Link className="font-medium text-emerald-700" href={`/teachers/${user.linkedTeacherSlug}`}>
                        {user.linkedTeacherName ?? user.linkedTeacherSlug}
                      </Link>
                    ) : (
                      <span className="font-medium">{user.linkedTeacherName ?? user.linkedTeacherId}</span>
                    )}
                  </p>
                ) : null}

                {user.pendingEmailChangeTo ? (
                  <p className="mt-2 text-sm text-amber-700">
                    Pending email change: {user.pendingEmailChangeTo}
                    {user.pendingEmailChangeRequestedAt
                      ? ` requested ${new Date(user.pendingEmailChangeRequestedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}`
                      : ""}
                  </p>
                ) : null}

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <form action={updateUserAsAdminAction} className="grid gap-4 md:grid-cols-3">
                    <input name="userId" type="hidden" value={user.id} />
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Name</span>
                      <input defaultValue={user.name} name="name" required />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Email</span>
                      <input defaultValue={user.email} name="email" required type="email" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Role</span>
                      <select defaultValue={user.role} name="role">
                        <option value="customer">Customer</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>
                    <div className="md:col-span-3">
                      <button className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white" type="submit">
                        Save changes
                      </button>
                    </div>
                  </form>

                  <form action={deleteUserAsAdminAction} className="flex items-end">
                    <input name="userId" type="hidden" value={user.id} />
                    <button
                      className="rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-rose-300"
                      disabled={isCurrentAdmin}
                      type="submit"
                    >
                      Remove user
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
