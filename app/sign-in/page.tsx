import { signInAction } from "@/lib/actions";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-stone-500">Use a demo account or create your own account to test the booking flow.</p>
      <form action={signInAction} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input defaultValue="student@yoga.local" name="email" type="email" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Password</span>
          <input defaultValue="password123" name="password" type="password" />
        </label>
        <button className="w-full rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
