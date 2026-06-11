"use client";

import Link from "next/link";
import { useState } from "react";

import { signUpAction } from "@/lib/actions";

type SignUpFormProps = {
  nextPath: string;
  errorMessage?: string | null;
  successMessage?: string | null;
  defaultName?: string;
  defaultEmail?: string;
  defaultRole: "customer" | "teacher";
  defaultWebsiteUrl?: string;
  defaultLinkedinUrl?: string;
  defaultInstagramUrl?: string;
  defaultFacebookUrl?: string;
  defaultProfileImportConsent?: boolean;
};

export function SignUpForm({
  nextPath,
  errorMessage,
  successMessage,
  defaultName = "",
  defaultEmail = "",
  defaultRole,
  defaultWebsiteUrl = "",
  defaultLinkedinUrl = "",
  defaultInstagramUrl = "",
  defaultFacebookUrl = "",
  defaultProfileImportConsent = false
}: SignUpFormProps) {
  const [role, setRole] = useState<"customer" | "teacher">(defaultRole);

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Create account</h1>
      <p className="mt-2 text-stone-500">
        Students can book with credits. Teachers get a profile, dashboard, and earnings visibility. We&apos;ll email you a
        verification link before creating the account.
      </p>
      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}
      {successMessage ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}
      <form action={signUpAction} className="mt-8 space-y-4">
        <input name="next" type="hidden" value={nextPath} />
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
          <input name="password" type="password" placeholder="Create a password" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">I am signing up as</span>
          <select name="role" defaultValue={defaultRole} onChange={(event) => setRole(event.target.value as "customer" | "teacher")}>
            <option value="customer">Student / customer</option>
            <option value="teacher">Teacher</option>
          </select>
        </label>

        {role === "teacher" ? (
          <div className="space-y-4 rounded-[1.75rem] border border-emerald-200 bg-emerald-50/60 p-5">
            <div>
              <p className="text-sm font-semibold text-emerald-900">Optional teacher profile import</p>
              <p className="mt-1 text-sm text-stone-600">
                Add your resume or public profile links now and Thryve can prefill your teacher profile after your email is
                verified. You can also skip this section and do it later from your teacher dashboard.
              </p>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Website</span>
              <input defaultValue={defaultWebsiteUrl} name="websiteUrl" placeholder="https://yourwebsite.com" type="url" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">LinkedIn</span>
              <input defaultValue={defaultLinkedinUrl} name="linkedinUrl" placeholder="https://www.linkedin.com/in/your-profile" type="url" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Instagram</span>
              <input defaultValue={defaultInstagramUrl} name="instagramUrl" placeholder="https://www.instagram.com/your-handle" type="url" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Facebook</span>
              <input defaultValue={defaultFacebookUrl} name="facebookUrl" placeholder="https://www.facebook.com/your-page" type="url" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Upload resume</span>
              <input
                accept="application/pdf,text/plain,text/markdown,application/rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                name="resumeFile"
                type="file"
              />
              <span className="mt-2 block text-xs text-stone-500">PDF, TXT, Markdown, RTF, DOC, and DOCX supported up to 10MB.</span>
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white/70 p-4">
              <input className="mt-1" defaultChecked={defaultProfileImportConsent} name="profileImportConsent" type="checkbox" />
              <span className="text-sm text-stone-600">
                <span className="block font-medium text-stone-900">Allow Thryve to pull from the public links I provided</span>
                We will only fetch the website or social links you enter here to suggest profile fields like bio, training,
                experience, studio website, and booking links.
              </span>
            </label>
            <p className="text-xs text-stone-500">
              Leave everything blank if you want to create the account first and add these details later.
            </p>
          </div>
        ) : (
          <span className="block text-xs text-stone-500">
            Teacher accounts can optionally import profile details from a website, social links, or resume right after signup.
          </span>
        )}

        <button className="w-full rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
          Send verification email
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
