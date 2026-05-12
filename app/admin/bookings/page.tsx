import { AdminDashboardAccessCard } from "@/components/admin-dashboard-access-card";
import { AdminDashboardNav } from "@/components/admin-dashboard-nav";
import { getAdminDashboardContext } from "@/lib/admin-dashboard";
import { formatCredits, formatDateTime } from "@/lib/format";
import { getAdminSnapshot } from "@/lib/store";

export default async function AdminBookingsPage() {
  const context = await getAdminDashboardContext();

  if (context.status === "signed_out") {
    return <AdminDashboardAccessCard state="signed_out" />;
  }

  if (context.status === "wrong_role") {
    return <AdminDashboardAccessCard state="wrong_role" userName={context.user.name} />;
  }

  const snapshot = getAdminSnapshot();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Admin: bookings</h1>
          <p className="mt-2 text-stone-500">Review booking volume, credit spend, and booking status across the marketplace.</p>
        </div>
        <AdminDashboardNav current="bookings" />
      </section>

      <section className="space-y-4">
        {snapshot.bookings.map((booking) => (
          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm" key={booking.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{formatDateTime(booking.startsAt)}</h2>
                <p className="text-stone-500">
                  Teacher: {snapshot.teachers.find((teacher) => teacher.id === booking.teacherId)?.fullName ?? "Unknown"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCredits(booking.creditsSpent)}</p>
                <p className="text-sm capitalize text-stone-500">{booking.status}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
