import Link from "next/link";

import { resetPasswordAction } from "@/lib/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-policy";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string; error?: string; message?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  const errorMessage =
    params.error === "mismatch"
      ? "New passwords do not match."
      : params.error === "invalid"
        ? "This reset link is invalid."
        : params.error === "expired"
          ? "This reset link has expired. Request a new one from the sign-in page."
          : params.error === "consumed"
            ? "This reset link has already been used."
            : params.error === "policy"
              ? params.message ?? "That password does not meet requirements."
              : null;

  if (!token) {
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Reset password</h1>
        <p className="mt-4 text-stone-600">This reset link is missing or invalid.</p>
        <p className="mt-6 text-sm text-stone-500">
          <Link className="font-semibold text-emerald-700" href="/forgot-password">
            Request a new reset link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Choose a new password</h1>
      <p className="mt-2 text-stone-500">Enter a new password for your Thryve account.</p>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}

      <form action={resetPasswordAction} className="mt-8 space-y-4">
        <input name="token" type="hidden" value={token} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium">New password</span>
          <input name="newPassword" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Confirm new password</span>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
          />
        </label>
        <p className="text-sm text-stone-500">Use at least {MIN_PASSWORD_LENGTH} characters.</p>
        <button className="w-full rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
          Reset password
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
