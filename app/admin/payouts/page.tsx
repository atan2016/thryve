import { markPayoutPaidAction } from "@/lib/actions";
import { formatCredits } from "@/lib/format";
import { getAdminSnapshot } from "@/lib/store";

export default function AdminPayoutsPage() {
  const snapshot = getAdminSnapshot();
  const teacherSummaries = snapshot.teachers.map((teacher) => {
    const teacherEntries = snapshot.earnings.filter((entry) => entry.teacherId === teacher.id);
    const pending = teacherEntries.filter((entry) => entry.payoutStatus !== "paid");

    return {
      teacherId: teacher.id,
      teacherName: teacher.fullName,
      availableBalance: pending.reduce((sum, entry) => sum + entry.netCredits, 0),
      pendingCount: pending.length
    };
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Admin: payouts</h1>
        <p className="mt-2 text-stone-500">V1 uses manual payouts. This screen records payout status while keeping the ledger ready for future automation.</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {teacherSummaries.map((summary) => (
          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm" key={summary.teacherId}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{summary.teacherName}</h2>
                <p className="text-stone-500">{summary.pendingCount} pending ledger entries</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCredits(summary.availableBalance)}</p>
                <p className="text-sm text-stone-500">Ready for manual payout</p>
              </div>
            </div>
            <form action={markPayoutPaidAction} className="mt-5">
              <input name="teacherId" type="hidden" value={summary.teacherId} />
              <input name="amountCredits" type="hidden" value={summary.availableBalance} />
              <button
                className="rounded-full bg-stone-900 px-5 py-3 text-white disabled:cursor-not-allowed disabled:bg-stone-300"
                disabled={summary.availableBalance <= 0}
                type="submit"
              >
                Mark payout as paid
              </button>
            </form>
          </article>
        ))}
      </section>
    </div>
  );
}
