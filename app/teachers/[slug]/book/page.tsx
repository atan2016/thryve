import { notFound } from "next/navigation";

import { bookSessionAction } from "@/lib/actions";
import { formatCredits, formatDateTime } from "@/lib/format";
import { getTeacherBySlug } from "@/lib/persistence";

type TeacherBookingPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TeacherBookingPage({ params }: TeacherBookingPageProps) {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);

  if (!teacher) {
    notFound();
  }

  const availableSlots = teacher.availability.filter((slot) => !slot.isBooked);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Book {teacher.fullName}</h1>
        <p className="mt-2 text-stone-500">Pick an offering, select a live availability slot, and pay with credits.</p>

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
      </section>

      <aside className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">What students can check first</h2>
        <ul className="space-y-3 text-stone-600">
          <li>Badges and certification status</li>
          <li>Teaching styles and story-led media</li>
          <li>Live availability based on open slots</li>
          <li>Credit pricing for online and in-person work</li>
          <li>Total hours taught by category inside the platform</li>
        </ul>
      </aside>
    </div>
  );
}
