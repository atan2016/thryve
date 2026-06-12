import Link from "next/link";

import { TeacherDashboardAccessCard } from "@/components/teacher-dashboard-access-card";
import { completeTeacherImportOnboardingAction, skipTeacherImportOnboardingAction } from "@/lib/actions";
import { getTeacherDashboardContext } from "@/lib/teacher-dashboard";

type TeacherOnboardingPageProps = {
  searchParams: Promise<{ new?: string; next?: string }>;
};

export default async function TeacherOnboardingPage({ searchParams }: TeacherOnboardingPageProps) {
  const context = await getTeacherDashboardContext();
  const params = await searchParams;

  if (context.status === "signed_out") {
    return <TeacherDashboardAccessCard state="signed_out" />;
  }

  if (context.status === "wrong_role") {
    return <TeacherDashboardAccessCard state="wrong_role" userName={context.user.name} />;
  }

  const { teacher } = context;
  const isNewTeacher = params.new === "1";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">{isNewTeacher ? "Welcome to Thryve" : "Profile import"}</p>
        <h1 className="mt-2 text-3xl font-semibold">Build your teacher profile faster</h1>
        <p className="mt-3 max-w-3xl text-stone-600">
          Optionally share your website, LinkedIn, Instagram, Facebook, or resume and we&apos;ll prefill your draft teacher
          profile for review. Nothing publishes automatically.
        </p>
        <div className="mt-6 rounded-2xl bg-stone-50 p-5 text-sm text-stone-600">
          <p className="font-medium text-stone-900">What happens next</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Your links and resume are stored on your teacher profile.</li>
            <li>We only fetch public web pages if you explicitly opt in below.</li>
            <li>You&apos;ll review and edit every imported field before using the profile publicly.</li>
          </ul>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Import sources</h2>
          <form action={completeTeacherImportOnboardingAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Website</span>
              <input defaultValue={teacher.websiteUrl ?? teacher.studioWebsiteUrl ?? ""} name="websiteUrl" placeholder="https://yourwebsite.com" type="url" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">LinkedIn</span>
              <input defaultValue={teacher.linkedinUrl ?? ""} name="linkedinUrl" placeholder="https://www.linkedin.com/in/your-profile" type="url" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Instagram</span>
              <input defaultValue={teacher.instagramUrl ?? ""} name="instagramUrl" placeholder="https://www.instagram.com/your-handle" type="url" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Facebook</span>
              <input defaultValue={teacher.facebookUrl ?? ""} name="facebookUrl" placeholder="https://www.facebook.com/your-page" type="url" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Upload resume</span>
              <input accept="application/pdf,text/plain,text/markdown,application/rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" name="resumeFile" type="file" />
              <span className="mt-2 block text-xs text-stone-500">PDF, TXT, Markdown, RTF, DOC, and DOCX supported up to 10MB.</span>
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <input className="mt-1" defaultChecked={teacher.profileImportConsent ?? false} name="profileImportConsent" type="checkbox" />
              <span className="text-sm text-stone-600">
                <span className="block font-medium text-stone-900">Allow Thryve to crawl the public links I provided</span>
                We will only fetch the URLs you enter here to suggest profile fields like bio, training, experience, city,
                studio website, booking link, and headshot.
              </span>
            </label>
            <button className="rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
              Save and prefill profile
            </button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <form action={skipTeacherImportOnboardingAction}>
              <button className="rounded-full border border-stone-300 bg-white px-5 py-3 text-stone-900" type="submit">
                Skip for now
              </button>
            </form>
            <Link className="text-sm font-medium text-emerald-700" href="/dashboard/teacher/profile">
              Go straight to the profile editor
            </Link>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Current import status</h2>
            <p className="mt-3 text-sm text-stone-600">
              Status: <span className="font-medium text-stone-900">{teacher.profileImportStatus ?? "not_started"}</span>
            </p>
            {teacher.resumeFileName ? <p className="mt-2 text-sm text-stone-600">Latest resume: {teacher.resumeFileName}</p> : null}
            {teacher.profileImportNotes ? (
              <div className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                <p className="font-medium text-stone-900">Last import notes</p>
                <p className="mt-2 whitespace-pre-line">{teacher.profileImportNotes}</p>
              </div>
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Saved source links</h2>
            <div className="mt-4 space-y-3 text-sm text-stone-600">
              {teacher.websiteUrl ? <p>Website: {teacher.websiteUrl}</p> : null}
              {teacher.linkedinUrl ? <p>LinkedIn: {teacher.linkedinUrl}</p> : null}
              {teacher.instagramUrl ? <p>Instagram: {teacher.instagramUrl}</p> : null}
              {teacher.facebookUrl ? <p>Facebook: {teacher.facebookUrl}</p> : null}
              {!teacher.websiteUrl && !teacher.linkedinUrl && !teacher.instagramUrl && !teacher.facebookUrl ? <p>No source links saved yet.</p> : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
