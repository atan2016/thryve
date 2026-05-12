import Link from "next/link";

type ConfirmEmailChangePageProps = {
  searchParams: Promise<{
    state?: string;
    message?: string;
    email?: string;
  }>;
};

export default async function ConfirmEmailChangePage({ searchParams }: ConfirmEmailChangePageProps) {
  const params = await searchParams;
  const state = params.state?.trim() || "invalid";
  const message =
    params.message?.trim() ||
    (state === "success"
      ? "Your email address has been updated."
      : state === "expired"
        ? "This email change link has expired. Ask an admin to send a new confirmation email."
        : state === "consumed"
          ? "This email change link has already been used."
          : state === "blocked"
            ? "That email is already attached to another account."
            : "This email change link is invalid.");
  const email = params.email?.trim() || "";

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Confirm email change</h1>
      <p className="mt-3 text-stone-600">{message}</p>
      {state === "success" && email ? <p className="mt-2 text-sm text-stone-500">New sign-in email: {email}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className="inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold"
          href={email ? `/sign-in?email=${encodeURIComponent(email)}` : "/sign-in"}
          style={{ color: "#ffffff" }}
        >
          {state === "success" ? "Sign in" : "Back to sign in"}
        </Link>
        <Link className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700" href="/">
          Back home
        </Link>
      </div>
    </div>
  );
}
