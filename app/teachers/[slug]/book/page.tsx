import { notFound } from "next/navigation";

import { bookCalendarSessionAction, bookSessionAction } from "@/lib/actions";
import { formatCredits, formatDateTime } from "@/lib/format";
import { getTeacherBySlug } from "@/lib/persistence";

type TeacherBookingPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sessionId?: string }>;
};

export default async function TeacherBookingPage({ params, searchParams }: TeacherBookingPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const teacher = await getTeacherBySlug(slug);

  if (!teacher) {
    notFound();
  }

  const showPublicCalendar = teacher.showPublicCalendar !== false;
  const selectedSession = query.sessionId
    ? showPublicCalendar
      ? teacher.calendarSessions?.find((session) => session.id === query.sessionId && !session.isBooked)
      : null
    : null;
  const selectedOffering = selectedSession
    ? teacher.offerings.find((offering) => offering.id === selectedSession.offeringId)
    : null;
  const availableSlots = showPublicCalendar ? teacher.availability.filter((slot) => !slot.isBooked) : [];

  if (query.sessionId && (!selectedSession || !selectedOffering)) {
    notFound();
  }

  if (selectedSession && selectedOffering) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Book {selectedSession.title}</h1>
          <p className="mt-2 text-stone-500">This calendar session is reserved with {teacher.fullName}.</p>

          <div className="mt-8 rounded-2xl bg-stone-50 p-5">
            <p className="font-semibold">{formatDateTime(selectedSession.startsAt)}</p>
            <p className="mt-1 text-sm text-stone-500">{selectedSession.location} • {selectedSession.timezone}</p>
            <p className="mt-3 text-stone-600">{selectedSession.description}</p>
            <p className="mt-3 text-sm font-semibold">{formatCredits(selectedOffering.creditPrice)}</p>
          </div>

          <form action={bookCalendarSessionAction} className="mt-8 space-y-5">
            <input name="teacherId" type="hidden" value={teacher.id} />
            <input name="teacherSlug" type="hidden" value={teacher.slug} />
            <input name="sessionId" type="hidden" value={selectedSession.id} />

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Notes for the teacher</span>
              <textarea className="min-h-32" name="notes" placeholder="Goals, injuries, preferences, group size..." />
            </label>

            <button
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 font-medium text-stone-900 shadow-[0_14px_35px_-18px_rgba(16,185,129,0.9)] transition hover:-translate-y-0.5 hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              type="submit"
            >
              Confirm booking
            </button>
          </form>
        </section>

        <aside className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Session details</h2>
          <ul className="space-y-3 text-stone-600">
            <li>{selectedOffering.title}</li>
            <li>{selectedOffering.deliveryMode === "online" ? "Online" : "In person"}</li>
            <li>{selectedOffering.sessionLengthMin} minutes</li>
            <li>{formatCredits(selectedOffering.creditPrice)}</li>
          </ul>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Book {teacher.fullName}</h1>
        <p className="mt-2 text-stone-500">
          {showPublicCalendar
            ? "Pick an offering, select a live availability slot, and pay with credits."
            : "This teacher is not currently showing live calendar slots on their public profile."}
        </p>
        {teacher.studioScheduleUrl ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-medium">
              {showPublicCalendar ? "Prefer the teacher&apos;s external calendar?" : "Use the teacher&apos;s external availability link instead."}
            </p>
            <a className="mt-2 inline-flex font-medium text-emerald-700" href={teacher.studioScheduleUrl} rel="noreferrer" target="_blank">
              Open availability link
            </a>
          </div>
        ) : null}
        {showPublicCalendar ? (
          <form action={bookSessionAction} className="mt-8 space-y-5">
            <input name="teacherId" type="hidden" value={teacher.id} />
            <input name="teacherSlug" type="hidden" value={teacher.slug} />

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Offering</span>
              <select name="offeringId" required>
                {teacher.offerings.map((offering) => (
                  <option key={offering.id} value={offering.id}>
                    {offering.title} • {offering.sessionLengthMin} min • {formatCredits(offering.creditPrice)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Available slot</span>
              <select name="slotId" required>
                {availableSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {formatDateTime(slot.startsAt)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Notes for the teacher</span>
              <textarea className="min-h-32" name="notes" placeholder="Goals, injuries, preferences, group size..." />
            </label>

            <button
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 font-medium text-stone-900 shadow-[0_14px_35px_-18px_rgba(16,185,129,0.9)] transition hover:-translate-y-0.5 hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500 disabled:shadow-none disabled:hover:translate-y-0"
              disabled={availableSlots.length === 0}
              type="submit"
            >
              Confirm booking
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 p-6 text-sm text-stone-500">
            Live booking slots are hidden right now. Use the teacher&apos;s external schedule link above or contact them directly from their profile.
          </div>
        )}
      </section>

      <aside className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">What students can check first</h2>
        <ul className="space-y-3 text-stone-600">
          <li>Badges and certification status</li>
          <li>Teaching styles and story-led media</li>
          <li>{showPublicCalendar ? "Live availability based on open slots" : "Whether the teacher is sharing live booking times publicly"}</li>
            {teacher.studioScheduleUrl ? <li>External availability link if the teacher books through another calendar</li> : null}
          <li>Credit pricing for online and in-person work</li>
          <li>Total hours taught by category inside the platform</li>
        </ul>
      </aside>
    </div>
  );
}
