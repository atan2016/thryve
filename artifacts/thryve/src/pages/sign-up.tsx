import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";

export function SignUpPage() {
  const { setUser } = useAuth();
  const [, navigate] = useLocation();
  const [role, setRole] = useState<"customer" | "teacher">("customer");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const nextPath = searchParams.get("next") ?? "/";
  const defaultEmail = searchParams.get("email") ?? "";
  const defaultName = searchParams.get("name") ?? "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(event.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    await new Promise((r) => setTimeout(r, 500));
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role
    };
    setUser(newUser);
    navigate(nextPath || "/");
  }

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Create account</h1>
      <p className="mt-2 text-stone-500">
        Students can book with credits. Teachers get a profile, dashboard, and earnings visibility.
      </p>
      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Full name</span>
          <input defaultValue={defaultName} name="name" placeholder="Your name" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input defaultValue={defaultEmail} name="email" type="email" placeholder="you@example.com" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Password</span>
          <input name="password" type="password" autoComplete="new-password" required minLength={8} />
        </label>
        <div>
          <span className="mb-2 block text-sm font-medium">I am a</span>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                checked={role === "customer"}
                name="role"
                onChange={() => setRole("customer")}
                type="radio"
                value="customer"
              />
              <span className="text-sm">Student / Customer</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                checked={role === "teacher"}
                name="role"
                onChange={() => setRole("teacher")}
                type="radio"
                value="teacher"
              />
              <span className="text-sm">Teacher</span>
            </label>
          </div>
        </div>
        {role === "teacher" ? (
          <div className="space-y-4 rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Website URL (optional)</span>
              <input name="websiteUrl" placeholder="https://yoursite.com" type="url" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Instagram URL (optional)</span>
              <input name="instagramUrl" placeholder="https://instagram.com/yourhandle" type="url" />
            </label>
          </div>
        ) : null}
        <button
          className="w-full rounded-full bg-stone-900 px-5 py-3 text-white disabled:opacity-50"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link className="font-semibold text-emerald-700" href={nextPath ? `/sign-in?next=${encodeURIComponent(nextPath)}` : "/sign-in"}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
