import Link from "next/link";

import { signInAction } from "@/lib/actions";

type SignInPageProps = {
  searchParams: Promise<{ next?: string; error?: string; email?: string; status?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const nextPath = params.next ?? "";
  const error = params.error;
  const defaultEmail = params.email ?? "";
  const successMessage = params.status === "password_reset" ? "Your password was reset. Sign in with your new password." : null;
  const errorMessage =
    error === "invalid_credentials"
      ? "Invalid email or password. Please try again."
      : error === "email_not_verified"
        ? "Please verify your email before signing in."
      : error === "sign_in_failed"
        ? "We couldn't sign you in. Please try again."
        : null;

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-stone-500">Use a demo account or create your own account to test the booking flow.</p>
      <div className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
        <p>Teacher demo: `teacher@yoga.local` / `password123`</p>
        <p className="mt-1">Student demo: `student@yoga.local` / `password123`</p>
      </div>
      {successMessage ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}
      <form action={signInAction} className="mt-8 space-y-4">
        <input name="next" type="hidden" value={nextPath} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input defaultValue={defaultEmail} name="email" type="email" />
        </label>
        <label className="block">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Password</span>
            <Link className="text-sm font-medium text-emerald-700" href="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <input name="password" type="password" autoComplete="current-password" />
        </label>
        <button className="w-full rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
          Sign in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-500">
        Don&apos;t have an account?{" "}
        <Link className="font-semibold text-emerald-700" href={nextPath ? `/sign-up?next=${encodeURIComponent(nextPath)}` : "/sign-up"}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
