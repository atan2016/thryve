"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactElement } from "react";

import { signOutAction } from "@/lib/actions";
import type { Role } from "@/lib/types";

type AppHeaderProps = {
  user: { name: string; email: string; role: Role } | null;
  canAccessTeacherDashboard: boolean;
};

function roleLabel(role: Role) {
  if (role === "teacher") return "Teacher";
  if (role === "admin") return "Admin";
  return "Student";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function IconClasses({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 000 6.706c1.543-.94 3.31-.824 4.13.163 1.092 1.256 2.892 1.256 3.984 0 1.543-.94 3.31-.824 4.13.163V4.034c-1.543-.94-3.31-.824-4.13-.163-1.092-1.256-2.892-1.256-3.984 0-1.543.94-3.31.824-4.13.163v12.164zM19.74 10.147a60.438 60.438 0 010 6.706c-1.543-.94-3.31-.824-4.13.163-1.092 1.256-2.892 1.256-3.984 0-1.543-.94-3.31-.824-4.13-.163V4.034c1.543-.94 3.31-.824 4.13-.163 1.092-1.256 2.892-1.256 3.984 0 1.543.94 3.31.824 4.13.163v12.164zM9 6.75h6" />
    </svg>
  );
}

function IconCommunity({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.09 9.09 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198A12.02 12.02 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.06 6.06 0 016 18.719m12 0a5.97 5.97 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.99 8.99 0 003.74.477M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}

function IconJobs({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2-1.75 2H5.25c-.963 0-1.75-.906-1.75-2v-4.25m16.5 0c0 1.094-.787 2-1.75 2H5.25c-.963 0-1.75-.906-1.75-2m16.5 0V8.108c0-1.094-.787-2-1.75-2H5.25c-.963 0-1.75.906-1.75 2v6.042m16.5 0v.75a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-.75m16.5 0h-15" />
    </svg>
  );
}

function IconPromotion({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.109V8.25c0-1.69-1.23-3.184-2.928-3.502a48.108 48.108 0 00-3.286-.033c-.78.07-1.52.25-2.184.513m13.732 10.04a48.11 48.11 0 01-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function IconBookmark({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

type NavItemConfig = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => ReactElement;
  match: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItemConfig[] = [
  { href: "/", label: "Home", icon: IconHome, match: (p) => p === "/" },
  { href: "/teachers", label: "Classes", icon: IconClasses, match: (p) => p.startsWith("/teachers") },
  { href: "/community", label: "Community", icon: IconCommunity, match: (p) => p.startsWith("/community") },
  { href: "/#local-gigs", label: "Jobs", icon: IconJobs, match: () => false },
  { href: "/credits", label: "Promotion", icon: IconPromotion, match: (p) => p.startsWith("/credits") },
];

export function AppHeader({ user, canAccessTeacherDashboard }: AppHeaderProps) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <header className="border-b border-stone-200/80 bg-[#FCFCFC]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex h-10 w-[180px] shrink-0 items-center overflow-visible py-0.5 sm:w-[220px]" aria-label="thryve WELLNESS, home">
          <Image
            src="/assets/images/thryve-wellness-logo.png"
            alt="thryve WELLNESS"
            width={226}
            height={89}
            className="h-[72px] w-auto max-w-none sm:h-20"
            priority
            sizes="(max-width: 640px) 360px, 440px"
          />
        </Link>

        <nav
          className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto py-1 sm:gap-2 md:gap-4"
          aria-label="Primary"
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={label}
                href={href}
                className={`flex min-w-[4.25rem] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold transition sm:min-w-[4.75rem] sm:px-3 ${
                  active ? "text-teal-600" : "text-stone-700 hover:bg-white/60 hover:text-teal-700"
                }`}
              >
                <Icon className={`h-6 w-6 ${active ? "text-teal-600" : "text-stone-700"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <button
                type="button"
                className="relative rounded-full p-2 text-slate-800 transition hover:bg-white/80 hover:text-teal-700"
                aria-label="Notifications (demo)"
              >
                <IconBell className="h-6 w-6" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#FCFCFC]" aria-hidden />
              </button>
              <Link
                href="/bookings"
                className="rounded-full p-2 text-slate-800 transition hover:bg-white/80 hover:text-teal-700"
                aria-label="My bookings"
              >
                <IconBookmark className="h-6 w-6" />
              </Link>
              <div className="relative pl-1" ref={accountRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 text-left transition hover:bg-white/80 sm:gap-2.5 sm:pr-3"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountOpen((o) => !o)}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-sky-100 text-sm font-bold text-slate-800 ring-1 ring-slate-200/80"
                    aria-hidden
                  >
                    {initials(user.name)}
                  </span>
                  <span className="hidden min-w-0 sm:block">
                    <span className="block truncate text-sm font-bold text-slate-900">{user.name}</span>
                    <span className="block text-xs font-medium text-sky-700">{roleLabel(user.role)}</span>
                  </span>
                  <IconChevronDown className={`hidden h-4 w-4 shrink-0 text-slate-600 sm:block ${accountOpen ? "rotate-180" : ""} transition`} />
                </button>
                {accountOpen ? (
                  <div
                    className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-stone-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
                    role="menu"
                  >
                    <Link href="/bookings" className="block px-4 py-2.5 text-sm text-slate-800 hover:bg-stone-50" role="menuitem" onClick={() => setAccountOpen(false)}>
                      My bookings
                    </Link>
                    <Link href="/credits" className="block px-4 py-2.5 text-sm text-slate-800 hover:bg-stone-50" role="menuitem" onClick={() => setAccountOpen(false)}>
                      Credits
                    </Link>
                    {canAccessTeacherDashboard ? (
                      <Link
                        href="/dashboard/teacher/profile"
                        className="block px-4 py-2.5 text-sm text-slate-800 hover:bg-stone-50"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                      >
                        Teacher dashboard
                      </Link>
                    ) : null}
                    <div className="my-1 border-t border-stone-100" />
                    <form action={signOutAction} className="px-2 pb-1">
                      <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-stone-100" role="menuitem">
                        Sign out
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-stone-50" href="/sign-in">
                Sign in
              </Link>
              <Link
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-stone-50"
                href="/sign-up"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
