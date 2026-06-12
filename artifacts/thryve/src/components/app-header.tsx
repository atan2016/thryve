import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";

function ThryveLogoSvg() {
  return (
    <svg aria-label="Thryve" className="h-7" viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="27" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="28" fill="#1D3B5C" letterSpacing="-0.5">
        thryve
      </text>
    </svg>
  );
}

function IconMenu() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

export function AppHeader() {
  const { user, signOut } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img alt="Thryve" className="h-8 w-auto" src="/assets/images/thryve-wellness-logo.png" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <Link
              href="/"
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${isActive("/") ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"}`}
            >
              Home
            </Link>
            <Link
              href="/teachers"
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${isActive("/teachers") ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"}`}
            >
              Teachers
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm font-medium text-stone-700 sm:block">{user.name}</span>
              <button
                className="rounded-full border border-stone-300 px-3.5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                onClick={signOut}
                type="button"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                className="rounded-full px-3.5 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 hover:text-stone-900"
                href="/sign-in"
              >
                Sign in
              </Link>
              <Link
                className="rounded-full bg-stone-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
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
