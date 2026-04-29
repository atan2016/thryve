import Image from "next/image";

import { getCurrentUser } from "@/lib/auth/session";
import { addStoryAction, updateStoryAction, updateTeacherProfileAction } from "@/lib/actions";
import { getTeacherByUserId } from "@/lib/store";

type TeacherProfileDashboardPageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function TeacherProfileDashboardPage({ searchParams }: TeacherProfileDashboardPageProps) {
  const user = await getCurrentUser();
  const teacher = user ? getTeacherByUserId(user.id) : null;
  const params = await searchParams;
  const saved = params.saved;

  if (!teacher) {
    return null;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Teacher profile dashboard</h1>
        <p className="mt-2 text-stone-500">Update the public page fields students rely on before booking.</p>
        {saved ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {saved === "profile"
              ? "Profile saved."
              : saved === "story-added"
                ? "Story added."
                : "Story updated."}
          </div>
        ) : null}
        <form action={updateTeacherProfileAction} className="mt-8 grid gap-4 md:grid-cols-2">
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
            <span className="mb-2 block text-sm font-medium">Certification</span>
            <select defaultValue={teacher.certificationStatus} name="certificationStatus">
              <option value="certified">Certified</option>
              <option value="not_certified">Not certified</option>
            </select>
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
          <h2 className="text-2xl font-semibold">Add a story</h2>
          <form action={addStoryAction} className="mt-6 space-y-4">
            <input name="title" placeholder="Story title" />
            <textarea className="min-h-28" name="caption" placeholder="What makes this story or offering unique?" />
            <input name="mediaUrl" placeholder="Image or video URL" />
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
