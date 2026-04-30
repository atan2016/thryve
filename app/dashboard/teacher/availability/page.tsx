import { TeacherDashboardAccessCard } from "@/components/teacher-dashboard-access-card";
import { addAvailabilityAction } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import { getTeacherDashboardContext } from "@/lib/teacher-dashboard";

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
        <h1 className="text-3xl font-semibold">Availability</h1>
        <p className="mt-2 text-stone-500">Add live bookable slots. Students can only book from the slots shown here.</p>
        <form action={addAvailabilityAction} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Starts at</span>
            <input name="startsAt" type="datetime-local" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Ends at</span>
            <input name="endsAt" type="datetime-local" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Timezone</span>
            <input defaultValue="America/Los_Angeles" name="timezone" />
          </label>
          <button className="rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
            Add slot
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Open calendar slots</h2>
        <div className="mt-6 space-y-3">
          {teacher.availability.map((slot) => (
            <div className="flex items-center justify-between rounded-2xl bg-stone-50 p-4" key={slot.id}>
              <div>
                <p className="font-medium">{formatDateTime(slot.startsAt)}</p>
                <p className="text-sm text-stone-500">{slot.timezone}</p>
              </div>
              <span className={slot.isBooked ? "text-sm font-medium text-amber-700" : "text-sm font-medium text-emerald-700"}>
                {slot.isBooked ? "Booked" : "Open"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
