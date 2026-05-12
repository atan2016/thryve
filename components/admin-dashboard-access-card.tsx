import Link from "next/link";

type AdminDashboardAccessCardProps = {
  state: "signed_out" | "wrong_role";
  userName?: string;
};

export function AdminDashboardAccessCard({ state, userName }: AdminDashboardAccessCardProps) {
  if (state === "signed_out") {
    return (
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Sign in to access the admin dashboard</h1>
        <p className="mt-3 text-stone-500">Use an admin account to manage teachers, bookings, payouts, and user accounts.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-full bg-stone-900 px-5 py-3 text-white" href="/sign-in">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-amber-200 bg-amber-50 p-8 shadow-sm">
      <h1 className="text-3xl font-semibold text-amber-950">This dashboard is for admin accounts only</h1>
      <p className="mt-3 text-amber-900">
        {userName ? `${userName} is currently signed in without admin access.` : "Your current account does not have admin access."} Sign in as an
        admin to manage marketplace data.
      </p>
      <p className="mt-3 text-sm text-amber-900/80">Demo admin login: `admin@yoga.local` with password `password123`.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded-full bg-stone-900 px-5 py-3 text-white" href="/sign-in">
          Switch account
        </Link>
        <Link className="rounded-full border border-amber-300 bg-white px-5 py-3" href="/">
          Back home
        </Link>
      </div>
    </div>
  );
}
