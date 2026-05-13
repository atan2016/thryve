"use client";

import Image from "next/image";
import { useEffect, useState, type ChangeEvent } from "react";
import { differenceInMinutes } from "date-fns";

import { HoursBookedLabel } from "@/components/hours-booked-label";
import { MetricCard } from "@/components/metric-card";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { formatCredits, formatDateTime } from "@/lib/format";

type TeacherProfileEditorProps = {
  action: (formData: FormData) => void | Promise<void>;
  teacher: {
    slug: string;
    id: string;
    fullName: string;
    avatarUrl?: string;
    showPublicCalendar?: boolean;
    studioName?: string;
    studioWebsiteUrl?: string;
    city: string;
    serviceRadiusMiles: number;
    experienceYears: number;
    gender: "female" | "male" | "other";
    certificationStatus: "certified" | "not_certified";
    platformHoursBooked?: number;
    bio: string;
    training: string;
    studioScheduleUrl?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    resumeUrl?: string;
    resumeFileName?: string;
    profileImportStatus?: "not_started" | "sources_saved" | "completed" | "failed" | "skipped";
    profileImportNotes?: string;
    profileImportCompletedAt?: string;
    styles: string[];
    badges: Array<{ name: string; verified: boolean; imageUrl?: string }>;
    offerings: Array<{ id: string; title: string; creditPrice: number; deliveryMode: "online" | "in_person"; sessionLengthMin: number }>;
    teachingHours: Array<{ category: string; totalHours: number }>;
    upcomingEvents?: Array<{
      id: string;
      title: string;
      hostName?: string;
      address?: string;
      eventTime?: string;
      eventDate?: string;
      eventUrl?: string;
    }>;
    calendarSessions?: Array<{
      id: string;
      offeringId: string;
      title: string;
      description: string;
      location: string;
      startsAt: string;
      endsAt: string;
      sourceUrl?: string;
      isBooked: boolean;
    }>;
    stories: Array<{ id: string; title: string; caption: string; mediaUrl: string; mediaType: "image" | "video" }>;
    availability: Array<{ id: string; startsAt: string; timezone: string; isBooked: boolean }>;
  };
};

function formatGenderLabel(gender: "female" | "male" | "other") {
  return gender === "female" ? "Female" : gender === "male" ? "Male" : "Other";
}

function formatExternalLinkLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function TeacherProfileEditor({ action, teacher }: TeacherProfileEditorProps) {
  const [fullName, setFullName] = useState(teacher.fullName);
  const [studioName, setStudioName] = useState(teacher.studioName ?? "");
  const [studioWebsiteUrl, setStudioWebsiteUrl] = useState(teacher.studioWebsiteUrl ?? "");
  const [city, setCity] = useState(teacher.city);
  const [serviceRadiusMiles, setServiceRadiusMiles] = useState(String(teacher.serviceRadiusMiles));
  const [experienceYears, setExperienceYears] = useState(String(teacher.experienceYears));
  const [gender, setGender] = useState<"female" | "male" | "other">(teacher.gender);
  const [bio, setBio] = useState(teacher.bio);
  const [training, setTraining] = useState(teacher.training);
  const [studioScheduleUrl, setStudioScheduleUrl] = useState(teacher.studioScheduleUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(teacher.websiteUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(teacher.linkedinUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(teacher.instagramUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(teacher.facebookUrl ?? "");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>(undefined);
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewAvatarUrl = avatarPreviewUrl ?? teacher.avatarUrl;
  const previewServiceRadius = Number(serviceRadiusMiles) || 0;
  const previewExperienceYears = Number(experienceYears) || 0;
  const showPublicCalendar = teacher.showPublicCalendar !== false;
  const totalHoursBooked =
    teacher.teachingHours.reduce((total, counter) => total + counter.totalHours, 0) || teacher.platformHoursBooked;
  const openCalendarSessions = showPublicCalendar ? (teacher.calendarSessions ?? []).filter((session) => !session.isBooked) : [];
  const upcomingCalendarSessions = openCalendarSessions.slice(0, 3);
  const openAvailability = showPublicCalendar
    ? teacher.availability.filter((slot) => !slot.isBooked).slice(0, studioScheduleUrl ? 3 : teacher.availability.length)
    : [];

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    if (!previewOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewOpen]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setAvatarPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return file ? URL.createObjectURL(file) : undefined;
    });
  }

  return (
    <div className="mt-8">
      <form action={action} className="grid gap-4 md:grid-cols-2">
        {teacher.profileImportStatus && teacher.profileImportStatus !== "not_started" ? (
          <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-medium">Latest import status: {teacher.profileImportStatus}</p>
            {teacher.profileImportCompletedAt ? (
              <p className="mt-1 text-emerald-800">
                Completed {new Date(teacher.profileImportCompletedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            ) : null}
            {teacher.profileImportNotes ? <p className="mt-2 whitespace-pre-line text-emerald-800">{teacher.profileImportNotes}</p> : null}
            {teacher.resumeUrl && teacher.resumeFileName ? (
              <a className="mt-3 inline-flex font-medium text-emerald-800 underline-offset-2 hover:underline" href={teacher.resumeUrl} rel="noreferrer" target="_blank">
                Open uploaded resume: {teacher.resumeFileName}
              </a>
            ) : null}
          </div>
        ) : null}
        <div className="md:col-span-2 flex items-center gap-4 rounded-2xl bg-stone-50 p-4">
          <TeacherAvatar className="h-24 w-24 rounded-[1.25rem]" height={96} name={fullName} src={previewAvatarUrl} width={96} />
          <div className="flex-1">
            <p className="font-medium text-stone-900">Profile photo</p>
            <p className="mt-1 text-sm text-stone-500">Upload a JPG, PNG, or WebP image to display on your public profile.</p>
            <label className="mt-3 block">
              <span className="mb-2 block text-sm font-medium">Upload image file</span>
              <input accept="image/png,image/jpeg,image/webp" name="avatarFile" onChange={handleAvatarChange} type="file" />
            </label>
          </div>
        </div>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium">Full name</span>
          <input name="fullName" onChange={(event) => setFullName(event.target.value)} value={fullName} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Studio or business name</span>
          <input name="studioName" onChange={(event) => setStudioName(event.target.value)} value={studioName} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Studio or business website</span>
          <input name="studioWebsiteUrl" onChange={(event) => setStudioWebsiteUrl(event.target.value)} placeholder="https://yourstudio.com" type="url" value={studioWebsiteUrl} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">City</span>
          <input name="city" onChange={(event) => setCity(event.target.value)} value={city} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Service radius (miles)</span>
          <input name="serviceRadiusMiles" onChange={(event) => setServiceRadiusMiles(event.target.value)} type="number" value={serviceRadiusMiles} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Years teaching</span>
          <input name="experienceYears" onChange={(event) => setExperienceYears(event.target.value)} type="number" value={experienceYears} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Availability or booking link</span>
          <input
            name="studioScheduleUrl"
            onChange={(event) => setStudioScheduleUrl(event.target.value)}
            placeholder="https://calendly.com/your-name/session"
            type="url"
            value={studioScheduleUrl}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Main website</span>
          <input name="websiteUrl" onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://yourwebsite.com" type="url" value={websiteUrl} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">LinkedIn</span>
          <input name="linkedinUrl" onChange={(event) => setLinkedinUrl(event.target.value)} placeholder="https://www.linkedin.com/in/your-profile" type="url" value={linkedinUrl} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Instagram</span>
          <input name="instagramUrl" onChange={(event) => setInstagramUrl(event.target.value)} placeholder="https://www.instagram.com/your-handle" type="url" value={instagramUrl} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Facebook</span>
          <input name="facebookUrl" onChange={(event) => setFacebookUrl(event.target.value)} placeholder="https://www.facebook.com/your-page" type="url" value={facebookUrl} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Gender</span>
          <select name="gender" onChange={(event) => setGender(event.target.value as "female" | "male" | "other")} value={gender}>
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
          <textarea className="min-h-32" name="bio" onChange={(event) => setBio(event.target.value)} value={bio} />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium">Training</span>
          <textarea className="min-h-32" name="training" onChange={(event) => setTraining(event.target.value)} value={training} />
        </label>
        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <button className="rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
            Save profile
          </button>
          <button
            className="rounded-full border border-stone-300 bg-white px-5 py-3 text-stone-900"
            onClick={() => setPreviewOpen(true)}
            type="button"
          >
            Preview profile
          </button>
          <span className="text-sm text-stone-500">Open the preview popup any time before saving.</span>
        </div>
      </form>

      {previewOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4"
          onClick={() => setPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="teacher-profile-preview-title"
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-[#FCFCFC] p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-700">Preview</p>
                <h3 id="teacher-profile-preview-title" className="mt-1 text-2xl font-semibold text-stone-900">
                  Public profile preview
                </h3>
                <p className="mt-1 text-sm text-stone-500">These unsaved edits will appear on the teacher profile after you save.</p>
              </div>
              <button
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700"
                onClick={() => setPreviewOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-5">
                <TeacherAvatar
                  className="h-24 w-24 rounded-[1.5rem]"
                  height={96}
                  name={fullName}
                  src={previewAvatarUrl}
                  width={96}
                />
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-4xl font-semibold text-stone-900">{fullName || "Your name"}</h4>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                      {teacher.certificationStatus === "certified" ? "Certified" : "Not certified"}
                    </span>
                  </div>
                  {studioName ? <p className="text-sm font-medium text-stone-600">{studioName}</p> : null}
                  <p className="text-stone-500">
                    {city || "City"} • {previewServiceRadius} mile service radius
                    {totalHoursBooked ? (
                      <>
                        {" • "}
                        <HoursBookedLabel hours={totalHoursBooked} teacherName={fullName || teacher.fullName} />
                      </>
                    ) : (
                      <> • {previewExperienceYears} years teaching</>
                    )}
                  </p>
                  <p className="text-sm text-stone-500">{formatGenderLabel(gender)}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {[studioWebsiteUrl, websiteUrl, linkedinUrl, instagramUrl, facebookUrl]
                      .filter((url): url is string => Boolean(url))
                      .map((url) => (
                        <a
                          className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-stone-700"
                          href={url}
                          key={url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {formatExternalLinkLabel(url)}
                        </a>
                      ))}
                  </div>
                </div>
              </div>

              {bio ? <p className="mt-5 whitespace-pre-line text-lg text-stone-700">{bio}</p> : null}

              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                {teacher.styles.map((style) => (
                  <span className="rounded-full bg-stone-100 px-3 py-1" key={style}>
                    {style}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {teacher.badges.map((badge) => (
                  <span className="rounded-full border border-stone-200 px-3 py-1" key={badge.name}>
                    {badge.name}
                    {badge.verified ? " verified" : ""}
                  </span>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-stone-50 p-5">
                <h5 className="text-lg font-semibold text-stone-900">Training</h5>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-stone-600">{training}</p>
                <div className="mt-5 space-y-3">
                  {teacher.offerings.map((offering) => (
                    <div className="rounded-2xl bg-white p-4" key={offering.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{offering.title}</p>
                          <p className="text-sm text-stone-500">
                            {offering.deliveryMode === "online" ? "Online" : "In person"} • {offering.sessionLengthMin} min
                          </p>
                        </div>
                        <span className="font-semibold">{formatCredits(offering.creditPrice)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h5 className="text-lg font-semibold text-stone-900">Teaching history booked on Thryve</h5>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {teacher.teachingHours.map((counter) => (
                    <MetricCard hint="Booked through Thryve" key={counter.category} label={counter.category} value={`${counter.totalHours} hrs`} />
                  ))}
                </div>
              </div>

              {teacher.upcomingEvents?.length ? (
                <div className="mt-6">
                  <h5 className="text-lg font-semibold text-stone-900">Upcoming Events</h5>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {teacher.upcomingEvents.map((event) => (
                      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4" key={event.id}>
                        <p className="text-sm font-medium text-emerald-700">Upcoming event</p>
                        <h6 className="mt-2 font-semibold text-stone-900">{event.title}</h6>
                        {event.hostName ? <p className="mt-1 text-sm text-stone-500">{event.hostName}</p> : null}
                        {event.address ? <p className="mt-1 text-sm text-stone-600">{event.address}</p> : null}
                        {event.eventTime ? <p className="mt-1 text-sm text-stone-600">{event.eventTime}</p> : null}
                        <p className="mt-2 text-sm text-stone-600">
                          {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Ongoing schedule"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {showPublicCalendar ? (
                <div className="mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h5 className="text-lg font-semibold text-stone-900">Teaching calendar</h5>
                    {studioScheduleUrl ? (
                      <a
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800"
                        href={studioScheduleUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open full availability
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-4 space-y-3">
                    {upcomingCalendarSessions.length > 0 ? (
                      upcomingCalendarSessions.map((session) => {
                        const offering = teacher.offerings.find((entry) => entry.id === session.offeringId);

                        return (
                          <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4" key={session.id}>
                            <p className="text-sm font-semibold text-emerald-900">{formatDateTime(session.startsAt)}</p>
                            <h6 className="mt-1 font-semibold text-stone-900">{session.title}</h6>
                            <p className="mt-1 text-sm text-stone-600">{session.location}</p>
                            <p className="mt-1 text-sm text-stone-500">
                              {offering?.deliveryMode === "online" ? "Online" : "In person"} /{" "}
                              {differenceInMinutes(new Date(session.endsAt), new Date(session.startsAt))} min
                            </p>
                          </article>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-500">No listed classes this month.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-500">
                  The public profile is currently set to hide live calendar sessions.
                </div>
              )}

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-lg font-semibold text-stone-900">Stories and media</h5>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {teacher.stories.map((story) => (
                      <article className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm" key={story.id}>
                        <div className="relative h-40">
                          {story.mediaType === "image" ? (
                            <Image alt={story.title} fill className="object-cover" src={story.mediaUrl} />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-stone-100 text-sm text-stone-500">Video preview</div>
                          )}
                        </div>
                        <div className="space-y-2 p-4">
                          <p className="text-xs uppercase tracking-wide text-stone-500">{story.mediaType}</p>
                          <h6 className="font-semibold text-stone-900">{story.title}</h6>
                          <p className="text-sm text-stone-600">{story.caption}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h5 className="text-lg font-semibold text-stone-900">Availability</h5>
                    {studioScheduleUrl ? (
                      <a
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
                        href={studioScheduleUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open calendar
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-stone-500">
                    {showPublicCalendar
                      ? studioScheduleUrl
                        ? "Showing the first 3 open times from the instructor&apos;s calendar."
                        : "Only open time slots appear here and on the booking screen."
                      : "Live availability is hidden from the public profile right now."}
                  </p>
                  <div className="mt-5 space-y-3">
                    {openAvailability.length > 0 ? (
                      openAvailability.map((slot) => (
                        <div className="rounded-2xl bg-stone-50 p-4" key={slot.id}>
                          <p className="font-medium">{formatDateTime(slot.startsAt)}</p>
                          <p className="text-sm text-stone-500">{slot.timezone}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-500">
                        {showPublicCalendar ? "No open availability yet." : "Live booking times are hidden for now."}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {studioScheduleUrl ? (
                <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                  External calendar link is included and will open in a new tab on the public page.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
