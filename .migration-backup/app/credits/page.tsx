import { redirect } from "next/navigation";

import { MetricCard } from "@/components/metric-card";
import { purchaseCreditsAction } from "@/lib/actions";
import { BOOKING_ENABLED } from "@/lib/booking-enabled";
import { formatCredits } from "@/lib/format";
import { getCustomerTransactions, getCustomerWallet } from "@/lib/store";

export default function CreditsPage() {
  if (!BOOKING_ENABLED) {
    redirect("/teachers");
  }

  const wallet = getCustomerWallet();
  const transactions = getCustomerTransactions();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Current balance" value={formatCredits(wallet.balance)} hint="Credits available to spend on new bookings." />
        <MetricCard label="Pricing model" value="Teacher-defined" hint="Each teacher controls their own credit price per offering." />
        <MetricCard label="Checkout mode" value={process.env.STRIPE_SECRET_KEY ? "Stripe checkout" : "Demo top-up"} hint="Set Stripe keys to switch from demo credit top-ups to live checkout sessions." />
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Buy credits</h1>
          <p className="mt-2 text-stone-500">Top up your wallet before booking a teacher.</p>
          <form action={purchaseCreditsAction} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Credits</span>
              <select defaultValue="20" name="credits">
                <option value="10">10 credits</option>
                <option value="20">20 credits</option>
                <option value="50">50 credits</option>
              </select>
            </label>
            <button className="w-full rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
              Continue to checkout
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Wallet activity</h2>
          <div className="mt-6 space-y-3">
            {transactions.map((transaction) => (
              <div className="flex items-center justify-between rounded-2xl bg-stone-50 p-4" key={transaction.id}>
                <div>
                  <p className="font-medium capitalize">{transaction.type}</p>
                  <p className="text-sm text-stone-500">{new Date(transaction.createdAt).toLocaleString()}</p>
                </div>
                <span className={transaction.amount > 0 ? "font-semibold text-emerald-700" : "font-semibold text-stone-900"}>
                  {transaction.amount > 0 ? "+" : ""}
                  {formatCredits(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
