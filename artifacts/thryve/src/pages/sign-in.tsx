import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";

const DEMO_USERS = [
  { email: "teacher@yoga.local", password: "password123", id: "user-teacher-1", name: "Ashley Tan", role: "teacher" as const },
  { email: "student@yoga.local", password: "password123", id: "user-student-1", name: "Demo Student", role: "customer" as const }
];

export function SignInPage() {
  const { setUser } = useAuth();
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const nextPath = searchParams.get("next") ?? "/";
  const defaultEmail = searchParams.get("email") ?? "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(event.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    await new Promise((r) => setTimeout(r, 300));
    const match = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (!match) {
      setError("Invalid email or password. Please try again.");
      setSubmitting(false);
      return;
    }
    setUser({ id: match.id, name: match.name, email: match.email, role: match.role });
    navigate(nextPath || "/");
  }

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-stone-500">Use a demo account or create your own account to test the booking flow.</p>
      <div className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
        <p>Teacher demo: <code>teacher@yoga.local</code> / <code>password123</code></p>
        <p className="mt-1">Student demo: <code>student@yoga.local</code> / <code>password123</code></p>
      </div>
      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input defaultValue={defaultEmail} name="email" type="email" required />
        </label>
        <label className="block">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Password</span>
            <Link className="text-sm font-medium text-emerald-700" href="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="w-full rounded-full bg-stone-900 px-5 py-3 text-white disabled:opacity-50" disabled={submitting} type="submit">
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-500">
        Don't have an account?{" "}
        <Link className="font-semibold text-emerald-700" href={nextPath ? `/sign-up?next=${encodeURIComponent(nextPath)}` : "/sign-up"}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
