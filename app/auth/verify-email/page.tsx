import Link from "next/link";
import { redirect } from "next/navigation";

import { completePendingSignupVerificationAction } from "@/lib/actions";
import { getPendingSignupVerificationPageResult } from "@/lib/auth/sign-up-verification";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string;
    state?: string;
    message?: string;
    email?: string;
  }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const state = params.state?.trim() ?? "";

  if (!token) {
    return (
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Verify email</h1>
        <p className="mt-3 text-stone-600">This verification link is missing a token. Please return to signup and request a new email.</p>
        <div className="mt-6">
          <Link
            className="inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold"
            href="/sign-up"
            style={{ color: "#ffffff" }}
          >
            Back to sign up
          </Link>
        </div>
      </div>
    );
  }

  if (!state) {
    redirect(`/auth/verify-email/complete?token=${encodeURIComponent(token)}`);
  }

  const result =
    state === "selection_required"
      ? await getPendingSignupVerificationPageResult(token)
      : state === "blocked"
        ? {
            status: "blocked" as const,
            message: params.message?.trim() || "That email is already attached to a verified account. Please sign in instead.",
            email: params.email?.trim() || ""
          }
        : state === "expired"
          ? {
              status: "expired" as const,
              message: params.message?.trim() || "This verification link has expired. Please sign up again to receive a new email."
            }
          : state === "consumed"
            ? {
                status: "consumed" as const,
                message: params.message?.trim() || "This verification link has already been used."
              }
            : {
                status: "invalid" as const,
                message: params.message?.trim() || "This verification link is invalid."
              };

  if (result.status === "selection_required") {
    return (
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Choose your profile</h1>
        <p className="mt-3 text-stone-600">
          We found more than one unverified @yoga.local profile for {result.pendingSignup.email}. Pick the one you want to
          claim.
        </p>

        <div className="mt-8 space-y-4">
          {result.options.map((option) => (
            <form
              key={`${option.kind}-${option.id}`}
              action={completePendingSignupVerificationAction}
              className="rounded-[1.5rem] border border-stone-200 px-5 py-4"
            >
              <input name="selectedProfileKind" type="hidden" value={option.kind} />
              <input name="selectedProfileId" type="hidden" value={option.id} />
              <input name="token" type="hidden" value={token} />
              <div className="flex items-start justify-between gap-4">
                <span>
                <span className="block text-sm font-semibold text-stone-900">{option.title}</span>
                <span className="block text-sm text-stone-600">{option.subtitle}</span>
                <span className="mt-1 block text-xs uppercase tracking-[0.24em] text-stone-400">{option.email}</span>
                </span>
                <button className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
                  Claim this profile
                </button>
              </div>
            </form>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Verify email</h1>
      <p className="mt-3 text-stone-600">{result.message}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className="inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold"
          href="/sign-up"
          style={{ color: "#ffffff" }}
        >
          Back to sign up
        </Link>
        {result.status === "blocked" && result.email ? (
          <Link
            className="rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700"
            href={`/sign-in?email=${encodeURIComponent(result.email)}`}
          >
            Sign in instead
          </Link>
        ) : null}
      </div>
    </div>
  );
}
