import Link from "next/link";

import { requestPasswordResetAction } from "@/lib/actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ status?: string; error?: string; email?: string; dev_reset?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const defaultEmail = params.email ?? "";
  const devResetUrl = params.dev_reset?.trim();
  const successMessage =
    params.status === "sent"
      ? devResetUrl
        ? "Email is not configured in this environment. Use the reset link below (also printed in the dev server console)."
        : "If an account exists for that email and it is verified, we sent a link to reset your password."
      : null;
  const errorMessage =
    params.error === "send_failed"
      ? "We could not send a reset email right now. Please try again later."
      : null;

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Forgot password</h1>
      <p className="mt-2 text-stone-500">
        Enter the email on your account. If it is verified, we will send a link to choose a new password.
      </p>

      {successMessage ? (
        <div className="mt-4 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p>{successMessage}</p>
          {devResetUrl ? (
            <p className="break-all">
              <a className="font-semibold text-emerald-900 underline" href={devResetUrl}>
                {devResetUrl}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}

      <form action={requestPasswordResetAction} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input defaultValue={defaultEmail} name="email" type="email" required autoComplete="email" />
        </label>
        <button className="w-full rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
          Send reset link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        <Link className="font-semibold text-emerald-700" href="/sign-in">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
