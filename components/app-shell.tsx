import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import { getCurrentUser, getSession } from "@/lib/auth/session";
import { signOutAction } from "@/lib/actions";

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await getSession();
  const user = await getCurrentUser();
  const canAccessTeacherDashboard = session?.role === "teacher" || user?.role === "teacher";

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3 text-2xl font-semibold tracking-tight">
              <Image alt="Thryve logo" className="h-10 w-10 rounded-full object-cover" height={40} src="/assets/images/logo.jpeg" width={40} />
              <span>Thryve</span>
            </Link>
            <p className="text-sm text-stone-500">
              A unified platform that brings together everything people need to live healthier lives-expert guidance,
              personalized recommendations, seamless booking for wellness services, curated products, and a connected
              community both online and in person.
            </p>
          </div>
          <nav className="shrink-0 flex items-center gap-3 text-sm">
            <Link href="/teachers">Find teachers</Link>
            <Link href="/community">Community</Link>
            {user ? <Link href="/credits">Credits</Link> : null}
            {user ? <Link href="/bookings">My bookings</Link> : null}
            {canAccessTeacherDashboard ? <Link href="/dashboard/teacher/profile">Teacher dashboard</Link> : null}
            {user ? (
              <form action={signOutAction}>
                <button className="rounded-full bg-stone-900 px-4 py-2 text-white" type="submit">
                  Sign out {user.name}
                </button>
              </form>
            ) : (
              <div className="flex gap-2">
                <Link className="rounded-full border border-stone-300 px-4 py-2" href="/sign-in">
                  Sign in
                </Link>
                <Link className="inline-flex items-center justify-center rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white" href="/sign-up" style={{ color: "#ffffff" }}>
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
