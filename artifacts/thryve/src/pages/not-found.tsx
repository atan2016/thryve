import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-stone-200">404</h1>
      <p className="mt-4 text-xl font-semibold text-stone-700">Page not found</p>
      <p className="mt-2 text-stone-500">The page you're looking for doesn't exist.</p>
      <Link
        className="mt-8 inline-flex rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
        href="/"
      >
        Back to Home
      </Link>
    </div>
  );
}
