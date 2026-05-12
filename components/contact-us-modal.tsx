"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ContactUsModalProps = {
  action: (formData: FormData) => void | Promise<void>;
  siteKey?: string;
  user?: {
    name?: string;
    email?: string;
  } | null;
};

export function ContactUsModal({ action, siteKey, user }: ContactUsModalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [manualOpen, setManualOpen] = useState(false);
  const [token, setToken] = useState("");
  const status = searchParams.get("support");
  const open = manualOpen || Boolean(status);

  const returnTo = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("support");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  function closeModal() {
    setManualOpen(false);
    setToken("");

    if (!status) {
      return;
    }

    router.replace(returnTo, { scroll: false });
  }

  const canSubmit = Boolean(siteKey && token);

  return (
    <>
      <button
        aria-label="Contact us"
        className="fixed bottom-6 right-6 z-40 overflow-hidden rounded-full bg-transparent shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)] transition hover:scale-[1.03]"
        onClick={() => setManualOpen(true)}
        type="button"
      >
        <Image
          alt="Contact us"
          height={72}
          priority
          src="/assets/images/contactus_icon.png"
          width={72}
        />
      </button>

      {open ? (
        <div
          aria-labelledby="contact-us-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4"
          onClick={closeModal}
          role="dialog"
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-700">Contact us</p>
                <h2 className="mt-1 text-2xl font-semibold text-stone-900" id="contact-us-modal-title">
                  Reach the Thryve team
                </h2>
                <p className="mt-2 text-sm text-stone-500">
                  Send a note to the admin team about partnerships, support, onboarding, or general questions.
                </p>
              </div>
              <button
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700"
                onClick={closeModal}
                type="button"
              >
                Close
              </button>
            </div>

            {status === "sent" ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Message sent successfully.
              </div>
            ) : null}
            {status === "captcha" ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Please complete the reCAPTCHA check before sending your message.
              </div>
            ) : null}
            {status === "error" ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                We could not send your message. Please try again.
              </div>
            ) : null}

            <form action={action} className="mt-8 grid gap-4 md:grid-cols-2">
              <input name="returnTo" type="hidden" value={returnTo} />
              <input name="recaptchaToken" type="hidden" value={token} />
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Your name</span>
                <input defaultValue={user?.name ?? ""} name="name" placeholder="Your name" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Email</span>
                <input defaultValue={user?.email ?? ""} name="email" placeholder="you@example.com" required type="email" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium">Message</span>
                <textarea className="min-h-32" name="message" placeholder="How can the Thryve team help?" required />
              </label>
              <div className="md:col-span-2">
                {siteKey ? (
                  <ReCAPTCHA onChange={(value: string | null) => setToken(value ?? "")} onExpired={() => setToken("")} sitekey={siteKey} />
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    reCAPTCHA is not configured yet. Add `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`.
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <button className="rounded-full bg-stone-900 px-5 py-3 text-white disabled:cursor-not-allowed disabled:bg-stone-300" disabled={!canSubmit} type="submit">
                  Send message
                </button>
                <button className="rounded-full border border-stone-300 bg-white px-5 py-3 text-stone-900" onClick={closeModal} type="button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
