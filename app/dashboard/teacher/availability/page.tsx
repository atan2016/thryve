import { format } from "date-fns";

import { TeacherDashboardAccessCard } from "@/components/teacher-dashboard-access-card";
import { addCalendarSessionAction, deleteCalendarSessionAction, updateCalendarSessionAction } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import { getTeacherDashboardContext } from "@/lib/teacher-dashboard";

function formatDateTimeLocal(value: string) {
  return format(new Date(value), "yyyy-MM-dd'T'HH:mm");
}

export default async function TeacherAvailabilityDashboardPage() {
  const context = await getTeacherDashboardContext();

  if (context.status === "signed_out") {
    return <TeacherDashboardAccessCard state="signed_out" />;
  }

  if (context.status === "wrong_role") {
    return <TeacherDashboardAccessCard state="wrong_role" userName={context.user.name} />;
  }

  const { teacher } = context;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Calendar sessions</h1>
        <p className="mt-2 text-stone-500">Add bookable class sessions. Students can book these directly from your public profile calendar.</p>
        <form action={addCalendarSessionAction} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Offering</span>
            <select name="offeringId" required>
              {teacher.offerings.map((offering) => (
                <option key={offering.id} value={offering.id}>
                  {offering.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Session title</span>
            <input name="title" placeholder="26&2 Bikram Yoga" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Description</span>
            <textarea className="min-h-28" name="description" placeholder="What students should expect in this session" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Location</span>
            <input name="location" placeholder={teacher.studioName ?? teacher.city} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Starts at</span>
            <input name="startsAt" required type="datetime-local" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Ends at</span>
            <input name="endsAt" required type="datetime-local" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Timezone</span>
            <input defaultValue="America/Los_Angeles" name="timezone" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Source URL</span>
            <input defaultValue={teacher.studioScheduleUrl ?? ""} name="sourceUrl" placeholder="https://..." type="url" />
          </label>
          <button className="rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
            Add session
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Current calendar sessions</h2>
        <div className="mt-6 space-y-3">
          {teacher.calendarSessions?.map((session) => (
            <div className="rounded-2xl bg-stone-50 p-4" key={session.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{session.title}</p>
                  <p className="text-sm text-stone-500">{formatDateTime(session.startsAt)} · {session.location}</p>
                  <p className="mt-2 text-sm text-stone-600">{session.description}</p>
                </div>
                <span className={session.isBooked ? "text-sm font-medium text-amber-700" : "text-sm font-medium text-emerald-700"}>
                  {session.isBooked ? "Booked" : "Open"}
                </span>
              </div>
              {!session.isBooked ? (
                <div className="mt-5 space-y-3 border-t border-stone-200 pt-5">
                  <form action={updateCalendarSessionAction} className="grid gap-3 md:grid-cols-2">
                    <input name="sessionId" type="hidden" value={session.id} />
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Offering</span>
                      <select defaultValue={session.offeringId} name="offeringId" required>
                        {teacher.offerings.map((offering) => (
                          <option key={offering.id} value={offering.id}>
                            {offering.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Title</span>
                      <input defaultValue={session.title} name="title" required />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-medium">Description</span>
                      <textarea className="min-h-24" defaultValue={session.description} name="description" required />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Location</span>
                      <input defaultValue={session.location} name="location" required />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Timezone</span>
                      <input defaultValue={session.timezone} name="timezone" required />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Starts at</span>
                      <input defaultValue={formatDateTimeLocal(session.startsAt)} name="startsAt" required type="datetime-local" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Ends at</span>
                      <input defaultValue={formatDateTimeLocal(session.endsAt)} name="endsAt" required type="datetime-local" />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-medium">Source URL</span>
                      <input defaultValue={session.sourceUrl ?? ""} name="sourceUrl" placeholder="https://..." type="url" />
                    </label>
                    <div className="flex flex-wrap gap-3 md:col-span-2">
                      <button className="rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
                        Save session
                      </button>
                    </div>
                  </form>
                  <form action={deleteCalendarSessionAction}>
                    <input name="sessionId" type="hidden" value={session.id} />
                    <button className="rounded-full border border-red-200 px-5 py-3 text-red-700" type="submit">
                      Delete session
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ))}
          {teacher.calendarSessions?.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-stone-500">
              No calendar sessions yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
