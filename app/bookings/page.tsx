import Link from "next/link";

import { MetricCard } from "@/components/metric-card";
import { formatCredits, formatDateTime } from "@/lib/format";
import { getCustomerBookings } from "@/lib/store";

export default function BookingsPage() {
  const bookings = getCustomerBookings();

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">My bookings</h1>
          <p className="mt-2 text-stone-500">View upcoming sessions, completed bookings, and how many credits each booking used.</p>
        </div>
        <Link className="rounded-full bg-stone-900 px-5 py-3 text-white" href="/teachers">
          Book another teacher
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total bookings" value={bookings.length} />
        <MetricCard label="Upcoming" value={bookings.filter((booking) => new Date(booking.startsAt) > new Date()).length} />
        <MetricCard
          label="Credits spent"
          value={formatCredits(bookings.reduce((sum, booking) => sum + booking.creditsSpent, 0))}
        />
      </section>

      <section className="space-y-4">
        {bookings.map((booking) => (
          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm" key={booking.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{booking.teacherName}</h2>
                <p className="mt-1 text-stone-500">{booking.offeringTitle}</p>
                <p className="mt-3 text-sm text-stone-600">{formatDateTime(booking.startsAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCredits(booking.creditsSpent)}</p>
                <p className="text-sm capitalize text-stone-500">{booking.status}</p>
              </div>
            </div>
            {booking.notes ? <p className="mt-4 rounded-2xl bg-stone-50 p-4 text-stone-600">{booking.notes}</p> : null}
          </article>
        ))}
      </section>
    </div>
  );
}
