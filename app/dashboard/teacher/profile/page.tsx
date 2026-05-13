import Image from "next/image";
import Link from "next/link";

import { TeacherDashboardAccessCard } from "@/components/teacher-dashboard-access-card";
import { TeacherProfileEditor } from "@/components/teacher-profile-editor";
import {
  addStoryAction,
  addTeacherCertificationSubmissionAction,
  addUpcomingEventAction,
  updateStoryAction,
  updateTeacherProfileAction
} from "@/lib/actions";
import { getTeacherDashboardContext } from "@/lib/teacher-dashboard";

type TeacherProfileDashboardPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function TeacherProfileDashboardPage({ searchParams }: TeacherProfileDashboardPageProps) {
  const context = await getTeacherDashboardContext();
  const params = await searchParams;
  const saved = params.saved;
  const error = params.error;

  if (context.status === "signed_out") {
    return <TeacherDashboardAccessCard state="signed_out" />;
  }

  if (context.status === "wrong_role") {
    return <TeacherDashboardAccessCard state="wrong_role" userName={context.user.name} />;
  }

  const { teacher } = context;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Teacher profile dashboard</h1>
        <p className="mt-2 text-stone-500">Update the public page fields students rely on before booking.</p>
        <div className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
          <p>Your public profile is shown at `/teachers/{teacher.slug}`.</p>
          {!teacher.published ? <p className="mt-1 text-amber-700">This profile is currently in preview mode until you save and publish it.</p> : null}
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-stone-800"
              href={`/teachers/${teacher.slug}`}
              style={{ color: "#ffffff" }}
            >
              {teacher.published ? "View public profile" : "Preview public profile"}
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 font-medium text-emerald-800 transition hover:bg-emerald-100"
              href="/onboarding/teacher"
            >
              Import profile from website, socials, or resume
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 font-medium text-stone-800 transition hover:bg-stone-100"
              href="/dashboard/teacher/availability"
            >
              Manage teaching calendar
            </Link>
          </div>
        </div>
        {error === "invalid_event_url" ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            That event link does not look like a valid URL. Use https://… or leave the link blank.
          </div>
        ) : null}
        {saved ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {saved === "profile"
              ? "Profile saved and displayed on your public page."
              : saved === "imported"
                ? "Profile import finished. Review the suggested details below before publishing."
                : saved === "import-skipped"
                  ? "Profile import skipped. You can return to it any time."
              : saved === "story-added"
                ? "Story added."
                : saved === "event-added"
                  ? "Upcoming event added."
                  : saved === "certification-submitted"
                    ? "Certification file submitted for admin review."
                : "Story updated."}
          </div>
        ) : null}
        <TeacherProfileEditor action={updateTeacherProfileAction} teacher={teacher} />
      </section>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Certification files</h2>
          <p className="mt-2 text-stone-500">Upload proof like PDFs or image certificates so the admin can review them before granting badges.</p>
          <form action={addTeacherCertificationSubmissionAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Credential name</span>
              <input name="credentialName" placeholder="200RYT, Yin Yoga Teacher Training, Kids Yoga Certification..." required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Notes for admin (optional)</span>
              <textarea className="min-h-24" name="notes" placeholder="Anything the admin should know about this certificate or badge request." />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Upload certification file</span>
              <input accept="application/pdf,image/png,image/jpeg,image/webp" name="certificationFile" required type="file" />
            </label>
            <button className="rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
              Submit certification
            </button>
          </form>
          <div className="mt-6 space-y-4">
            {teacher.certificationSubmissions?.length ? (
              teacher.certificationSubmissions.map((submission) => (
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4" key={submission.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium">{submission.credentialName}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                        submission.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : submission.status === "rejected"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-500">{submission.fileName}</p>
                  {submission.notes ? <p className="mt-2 text-sm text-stone-600">{submission.notes}</p> : null}
                  {submission.reviewNote ? <p className="mt-2 text-sm text-stone-600">Admin note: {submission.reviewNote}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a className="inline-flex text-sm font-medium text-emerald-700" href={submission.fileUrl} rel="noreferrer" target="_blank">
                      Open uploaded file
                    </a>
                    <span className="text-sm text-stone-500">
                      Submitted {new Date(submission.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-500">
                No certification files uploaded yet.
              </div>
            )}
          </div>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Add an upcoming event</h2>
          <form action={addUpcomingEventAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Course or event name</span>
              <input name="title" placeholder="Sunrise Flow, Weekend Retreat, Hot Pilates..." required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Studio or event host</span>
              <input name="hostName" placeholder="J8 Hot Pilates & Yoga, Community Center, Wellness Festival..." />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Address or location</span>
              <input name="address" placeholder="Studio address, neighborhood, or Online" required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Time</span>
              <input name="eventTime" placeholder="e.g. 6:00 PM – 7:30 PM or Doors 5:45 PM" required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Schedule or event URL (optional)</span>
              <input name="eventUrl" placeholder="https://… for tickets, RSVP, or details" type="text" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Date (optional for one-time events)</span>
              <input name="eventDate" type="date" />
            </label>
            <button className="rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
              Add upcoming event
            </button>
          </form>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Current upcoming events</h2>
          <p className="mt-2 text-sm text-stone-500">
            Events with a scheduled date before today are hidden here and on your public profile. Ongoing schedules (no date) stay listed.
          </p>
          <div className="mt-6 space-y-4">
            {teacher.upcomingEvents?.length ? (
              teacher.upcomingEvents.map((event) => (
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4" key={event.id}>
                  <p className="font-medium">{event.title}</p>
                  {event.hostName ? <p className="mt-1 text-sm text-stone-500">{event.hostName}</p> : null}
                  {event.address ? <p className="mt-1 text-sm text-stone-600">{event.address}</p> : null}
                  {event.eventTime ? <p className="mt-1 text-sm text-stone-600">{event.eventTime}</p> : null}
                  <p className="mt-2 text-sm text-stone-600">
                    {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Ongoing schedule"}
                  </p>
                  {event.eventUrl ? (
                    <a className="mt-3 inline-flex text-sm font-medium text-emerald-700" href={event.eventUrl} rel="noreferrer" target="_blank">
                      Open event link
                    </a>
                  ) : (
                    <p className="mt-3 text-sm text-stone-500">No external link on this event.</p>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-500">
                No upcoming events yet. Add a class, workshop, retreat, or studio schedule link here.
              </div>
            )}
          </div>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Add a story</h2>
          <form action={addStoryAction} className="mt-6 space-y-4">
            <input name="title" placeholder="Story title" />
            <textarea className="min-h-28" name="caption" placeholder="What makes this story or offering unique?" />
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Upload event image or video</span>
              <input accept="image/*,video/mp4,video/webm,video/quicktime" name="mediaFile" type="file" />
            </label>
            <input name="mediaUrl" placeholder="Or paste an image/video URL" />
            <select name="mediaType">
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <button className="rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
              Publish story
            </button>
          </form>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Current stories</h2>
          <div className="mt-6 space-y-4">
            {teacher.stories.map((story) => (
              <div className="overflow-hidden rounded-3xl border border-stone-200" key={story.id}>
                <div className="relative h-40">
                  <Image alt={story.title} fill className="object-cover" src={story.mediaUrl} />
                </div>
                <div className="space-y-4 p-4">
                  <form action={updateStoryAction} className="space-y-3">
                    <input name="storyId" type="hidden" value={story.id} />
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Title</span>
                      <input defaultValue={story.title} name="title" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Caption</span>
                      <textarea className="min-h-24" defaultValue={story.caption} name="caption" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Upload replacement media</span>
                      <input accept="image/*,video/mp4,video/webm,video/quicktime" name="mediaFile" type="file" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Media URL</span>
                      <input defaultValue={story.mediaUrl} name="mediaUrl" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Media type</span>
                      <select defaultValue={story.mediaType} name="mediaType">
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </label>
                    <button className="rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
                      Update story
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
