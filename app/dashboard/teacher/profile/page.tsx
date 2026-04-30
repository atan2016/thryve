import Image from "next/image";

import { TeacherAvatar } from "@/components/teacher-avatar";
import { TeacherDashboardAccessCard } from "@/components/teacher-dashboard-access-card";
import {
  addStoryAction,
  addTeacherCertificationSubmissionAction,
  addUpcomingEventAction,
  updateStoryAction,
  updateTeacherProfileAction
} from "@/lib/actions";
import { getTeacherDashboardContext } from "@/lib/teacher-dashboard";

type TeacherProfileDashboardPageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function TeacherProfileDashboardPage({ searchParams }: TeacherProfileDashboardPageProps) {
  const context = await getTeacherDashboardContext();
  const params = await searchParams;
  const saved = params.saved;

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
          <a className="mt-2 inline-flex font-medium text-emerald-700" href={`/teachers/${teacher.slug}`}>
            View public profile
          </a>
        </div>
        {saved ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {saved === "profile"
              ? "Profile saved and displayed on your public page."
              : saved === "story-added"
                ? "Story added."
                : saved === "event-added"
                  ? "Upcoming event added."
                  : saved === "certification-submitted"
                    ? "Certification file submitted for admin review."
                : "Story updated."}
          </div>
        ) : null}
        <form action={updateTeacherProfileAction} className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 flex items-center gap-4 rounded-2xl bg-stone-50 p-4">
            <TeacherAvatar className="h-24 w-24 rounded-[1.25rem]" height={96} name={teacher.fullName} src={teacher.avatarUrl} width={96} />
            <div className="flex-1">
              <p className="font-medium text-stone-900">Profile photo</p>
              <p className="mt-1 text-sm text-stone-500">Upload a JPG, PNG, or WebP image to display on your public profile.</p>
              <label className="mt-3 block">
                <span className="mb-2 block text-sm font-medium">Upload image file</span>
                <input accept="image/png,image/jpeg,image/webp" name="avatarFile" type="file" />
              </label>
            </div>
          </div>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Full name</span>
            <input defaultValue={teacher.fullName} name="fullName" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">City</span>
            <input defaultValue={teacher.city} name="city" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Service radius (miles)</span>
            <input defaultValue={teacher.serviceRadiusMiles} name="serviceRadiusMiles" type="number" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Years teaching</span>
            <input defaultValue={teacher.experienceYears} name="experienceYears" type="number" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Gender</span>
            <select defaultValue={teacher.gender} name="gender">
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Certification status</span>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
              <p className="font-medium text-stone-900">
                {teacher.certificationStatus === "certified" ? "Certified" : "Not certified"}
              </p>
              <p className="mt-1">Upload certification files below for admin review. Teachers cannot self-verify badges.</p>
            </div>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Bio</span>
            <textarea className="min-h-32" defaultValue={teacher.bio} name="bio" />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Training</span>
            <textarea className="min-h-32" defaultValue={teacher.training} name="training" />
          </label>
          <div className="md:col-span-2">
            <button className="rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
              Save profile
            </button>
          </div>
        </form>
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
              <span className="mb-2 block text-sm font-medium">Schedule or event URL</span>
              <input name="eventUrl" placeholder="https://..." required type="url" />
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
          <div className="mt-6 space-y-4">
            {teacher.upcomingEvents?.length ? (
              teacher.upcomingEvents.map((event) => (
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4" key={event.id}>
                  <p className="font-medium">{event.title}</p>
                  {event.hostName ? <p className="mt-1 text-sm text-stone-500">{event.hostName}</p> : null}
                  <p className="mt-2 text-sm text-stone-600">
                    {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Ongoing schedule"}
                  </p>
                  <a className="mt-3 inline-flex text-sm font-medium text-emerald-700" href={event.eventUrl} rel="noreferrer" target="_blank">
                    Open event link
                  </a>
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
