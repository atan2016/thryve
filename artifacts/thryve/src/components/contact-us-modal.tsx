import { useMemo, useState } from "react";
import { useLocation } from "wouter";

type ContactUsModalProps = {
  user?: {
    name?: string;
    email?: string;
  } | null;
};

export function ContactUsModal({ user }: ContactUsModalProps) {
  const [location] = useLocation();
  const [manualOpen, setManualOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<"sent" | "error" | null>(null);

  const open = manualOpen;

  function closeModal() {
    setManualOpen(false);
    setStatusMsg(null);
  }

  return (
    <>
      <button
        aria-label="Contact us"
        className="fixed bottom-6 right-6 z-40 overflow-hidden rounded-full bg-transparent shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)] transition hover:scale-[1.03]"
        onClick={() => setManualOpen(true)}
        type="button"
      >
        <img alt="Contact us" height={72} src="/assets/images/contactus_icon.png" width={72} />
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

            {statusMsg === "sent" ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Message sent successfully.
              </div>
            ) : null}
            {statusMsg === "error" ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                We could not send your message. Please try again.
              </div>
            ) : null}

            <form
              className="mt-8 grid gap-4 md:grid-cols-2"
              onSubmit={async (event) => {
                event.preventDefault();
                setSubmitting(true);
                try {
                  await new Promise((r) => setTimeout(r, 600));
                  setStatusMsg("sent");
                } catch {
                  setStatusMsg("error");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
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
              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <button
                  className="rounded-full bg-stone-900 px-5 py-3 text-white disabled:cursor-not-allowed disabled:bg-stone-300"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? "Sending…" : "Send message"}
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
