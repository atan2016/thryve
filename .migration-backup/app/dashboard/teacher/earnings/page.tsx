import { TeacherDashboardAccessCard } from "@/components/teacher-dashboard-access-card";
import { MetricCard } from "@/components/metric-card";
import { formatCredits } from "@/lib/format";
import { getTeacherBalance, getTeacherBookings } from "@/lib/store";
import { getTeacherDashboardContext } from "@/lib/teacher-dashboard";

export default async function TeacherEarningsDashboardPage() {
  const context = await getTeacherDashboardContext();

  if (context.status === "signed_out") {
    return <TeacherDashboardAccessCard state="signed_out" />;
  }

  if (context.status === "wrong_role") {
    return <TeacherDashboardAccessCard state="wrong_role" userName={context.user.name} />;
  }

  const balance = getTeacherBalance(context.teacher.id);
  const bookings = getTeacherBookings(context.teacher.id);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Instructor earnings</h1>
        <p className="mt-2 text-stone-500">V1 shows balances and payout history in-app while admins pay instructors manually outside the platform.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Available balance" value={formatCredits(balance.availableBalance)} />
        <MetricCard label="Total earned" value={formatCredits(balance.totalEarned)} />
        <MetricCard label="Commission deducted" value={formatCredits(balance.totalCommission)} />
        <MetricCard label="Sessions taught" value={bookings.length} />
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Earnings ledger</h2>
        <div className="mt-6 space-y-3">
          {balance.entries.map((entry) => (
            <div className="grid gap-4 rounded-2xl bg-stone-50 p-4 md:grid-cols-4" key={entry.id}>
              <div>
                <p className="text-sm text-stone-500">Gross</p>
                <p className="font-semibold">{formatCredits(entry.grossCredits)}</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Commission</p>
                <p className="font-semibold">{formatCredits(entry.platformCommission)}</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Net</p>
                <p className="font-semibold">{formatCredits(entry.netCredits)}</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Payout status</p>
                <p className="font-semibold capitalize">{entry.payoutStatus}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
