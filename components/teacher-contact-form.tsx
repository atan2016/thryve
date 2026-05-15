"use client";

import { useState } from "react";

import { RECAPTCHA_ACTION_CONTACT_TEACHER } from "@/lib/recaptcha-constants";
import { executeRecaptchaV3 } from "@/lib/recaptcha-v3-client";

type TeacherContactFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  siteKey?: string;
  teacherId: string;
  teacherName: string;
  teacherSlug: string;
  status?: string;
  id?: string;
  className?: string;
};

export function TeacherContactForm({ action, siteKey, teacherId, teacherName, teacherSlug, status, id, className }: TeacherContactFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const canAttemptSubmit = Boolean(siteKey) && !submitting;

  return (
    <section className={className ?? "rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm"} id={id}>
      <h2 className="text-2xl font-semibold">Contact {teacherName}</h2>
      <p className="mt-2 text-stone-500">Send a message about private sessions, studio classes, or upcoming events.</p>
      {status === "sent" ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Message sent successfully.
        </div>
      ) : null}
      {status === "captcha" ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Security verification did not pass. Please try sending again.
        </div>
      ) : null}
      {status === "error" ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          We could not send your message. Please try again.
        </div>
      ) : null}
      <form
        className="mt-8 grid gap-4 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!siteKey) {
            return;
          }
          setSubmitting(true);
          try {
            const token = await executeRecaptchaV3(siteKey, RECAPTCHA_ACTION_CONTACT_TEACHER);
            const fd = new FormData(event.currentTarget);
            fd.set("recaptchaToken", token);
            await action(fd);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <input name="teacherId" type="hidden" value={teacherId} />
        <input name="teacherSlug" type="hidden" value={teacherSlug} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Your name</span>
          <input name="name" placeholder="Your name" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input name="email" placeholder="you@example.com" required type="email" />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium">Message</span>
          <textarea className="min-h-32" name="message" placeholder="Tell the instructor what you are interested in..." required />
        </label>
        <div className="md:col-span-2">
          {siteKey ? (
            <p className="text-xs text-stone-500">
              This site is protected by reCAPTCHA; the Google{" "}
              <a className="underline" href="https://policies.google.com/privacy" rel="noreferrer" target="_blank">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a className="underline" href="https://policies.google.com/terms" rel="noreferrer" target="_blank">
                Terms of Service
              </a>{" "}
              apply.
            </p>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              reCAPTCHA is not configured yet. Add <code className="text-amber-950">NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code> and{" "}
              <code className="text-amber-950">RECAPTCHA_SECRET_KEY</code> for reCAPTCHA v3.
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <button
            className="rounded-full bg-[#0f766e] px-6 py-3 font-semibold text-white shadow-[0_14px_36px_-18px_rgba(15,118,110,0.75)] transition hover:bg-[#0d9488] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
            disabled={!canAttemptSubmit}
            type="submit"
          >
            {submitting ? "Sending…" : "Send message"}
          </button>
        </div>
      </form>
    </section>
  );
}
