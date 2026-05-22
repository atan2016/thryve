import { redirect } from "next/navigation";

import { TeacherDashboardAccessCard } from "@/components/teacher-dashboard-access-card";
import { addOfferingAction } from "@/lib/actions";
import { BOOKING_ENABLED } from "@/lib/booking-enabled";
import { formatCredits, formatDateTime } from "@/lib/format";
import { getServiceOptions, getTeacherBookings } from "@/lib/store";
import { getTeacherDashboardContext } from "@/lib/teacher-dashboard";

export default async function TeacherBookingsDashboardPage() {
  const context = await getTeacherDashboardContext();

  if (context.status === "signed_out") {
    return <TeacherDashboardAccessCard state="signed_out" />;
  }

  if (context.status === "wrong_role") {
    return <TeacherDashboardAccessCard state="wrong_role" userName={context.user.name} />;
  }

  if (!BOOKING_ENABLED) {
    redirect("/dashboard/teacher/profile");
  }

  const { teacher } = context;
  const bookings = getTeacherBookings(teacher.id);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Offerings and rates</h1>
          <p className="mt-2 text-stone-500">Create online or in-person offerings and define the credit price for each session.</p>
          <form action={addOfferingAction} className="mt-8 grid gap-4 md:grid-cols-2">
            <input className="md:col-span-2" name="title" placeholder="Offering title" />
            <textarea className="min-h-28 md:col-span-2" name="description" placeholder="Describe the session" />
            <select name="category">
              {getServiceOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select name="deliveryMode">
              <option value="online">Online</option>
              <option value="in_person">In person</option>
            </select>
            <input defaultValue="60" name="sessionLengthMin" type="number" />
            <input defaultValue="12" name="creditPrice" type="number" />
            <button className="rounded-full bg-stone-900 px-5 py-3 text-white md:col-span-2" type="submit">
              Add offering
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Current offerings</h2>
          <div className="mt-6 space-y-3">
            {teacher.offerings.map((offering) => (
              <div className="rounded-2xl bg-stone-50 p-4" key={offering.id}>
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

      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Sessions taught</h2>
        <div className="mt-6 space-y-3">
          {bookings.map((booking) => (
            <div className="rounded-2xl bg-stone-50 p-4" key={booking.id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{booking.customerName}</p>
                  <p className="text-sm text-stone-500">{booking.offeringTitle}</p>
                </div>
                <span className="text-sm capitalize text-stone-500">{booking.status}</span>
              </div>
              <p className="mt-3 text-sm text-stone-600">{formatDateTime(booking.startsAt)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
