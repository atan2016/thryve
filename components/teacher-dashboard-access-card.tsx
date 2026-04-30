import Link from "next/link";

type TeacherDashboardAccessCardProps = {
  state: "signed_out" | "wrong_role";
  userName?: string;
};

export function TeacherDashboardAccessCard({ state, userName }: TeacherDashboardAccessCardProps) {
  if (state === "signed_out") {
    return (
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Sign in to access the teacher dashboard</h1>
        <p className="mt-3 text-stone-500">
          Use a teacher account to manage your public profile, stories, offerings, availability, and earnings.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-full bg-stone-900 px-5 py-3 text-white" href="/sign-in">
            Sign in
          </Link>
          <Link className="rounded-full border border-stone-300 px-5 py-3" href="/sign-up">
            Create teacher account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-amber-200 bg-amber-50 p-8 shadow-sm">
      <h1 className="text-3xl font-semibold text-amber-950">This dashboard is for teacher accounts only</h1>
      <p className="mt-3 text-amber-900">
        {userName ? `${userName} is currently signed in without teacher access.` : "Your current account does not have teacher access."}{" "}
        Sign in as a teacher to update profile content.
      </p>
      <p className="mt-3 text-sm text-amber-900/80">Demo teacher login: `teacher@yoga.local` with password `password123`.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded-full bg-stone-900 px-5 py-3 text-white" href="/sign-in">
          Switch account
        </Link>
        <Link className="rounded-full border border-amber-300 bg-white px-5 py-3" href="/teachers">
          Browse teachers
        </Link>
      </div>
    </div>
  );
}
