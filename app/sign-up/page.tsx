import Link from "next/link";

import { signUpAction } from "@/lib/actions";

type SignUpPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const nextPath = params.next ?? "";

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Create account</h1>
      <p className="mt-2 text-stone-500">Students can book with credits. Teachers get a profile, dashboard, and earnings visibility.</p>
      <form action={signUpAction} className="mt-8 space-y-4">
        <input name="next" type="hidden" value={nextPath} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Full name</span>
          <input name="name" placeholder="Your name" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input name="email" type="email" placeholder="you@example.com" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Password</span>
          <input name="password" type="password" placeholder="Create a password" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">I am signing up as</span>
          <select name="role" defaultValue="customer">
            <option value="customer">Student / customer</option>
            <option value="teacher">Teacher</option>
          </select>
        </label>
        <button className="w-full rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
          Create account
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
