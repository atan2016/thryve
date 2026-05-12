"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { consumePendingSignupVerification, createPendingSignupVerification } from "@/lib/auth/sign-up-verification";
import { getCurrentUser, signIn, clearSession } from "@/lib/auth/session";
import { bookCalendarSession, bookSession } from "@/lib/booking/book-session";
import { purchaseCredits } from "@/lib/credits/purchase-credits";
import { saveCertificationDocument, savePendingSignupResume, saveProfileImage, saveStoryMedia, saveTeacherResume } from "@/lib/media/storage";
import { schedulePayout } from "@/lib/payouts/payout-provider";
import { extractResumeText, type TeacherImportSourceInput } from "@/lib/teacher-profile-import";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import {
  DEFAULT_CUSTOMER_ID,
  addAdminContactInquiry,
  addAvailabilitySlot,
  addTeacherOffering,
  markPayoutPaid,
} from "@/lib/store";
import {
  consumePendingUserEmailChange,
  addCommunityDiscussion,
  addTeacherCalendarSession,
  addTeacherCertificationSubmission,
  addTeacherStory,
  addTeacherUpcomingEvent,
  createContactInquiry,
  deleteUserForAdmin,
  deleteTeacherCalendarSession,
  ensureTeacherProfile,
  followEventHostForUser,
  followTeacherForUser,
  reviewTeacherCertificationSubmission,
  skipTeacherImportOnboarding,
  submitTeacherImportOnboarding,
  unfollowEventHostForUser,
  unfollowTeacherForUser,
  updateAdminContentFilters,
  updateUserForAdmin,
  updateTeacherCalendarSession,
  updateTeacherPublicCalendarVisibility,
  updateTeacherStory,
  updateTeacherProfile
} from "@/lib/persistence";
import type { DeliveryMode, ServiceCategory } from "@/lib/types";

async function requireCurrentTeacher() {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    throw new Error("You must be signed in as a teacher to manage this page.");
  }

  return ensureTeacherProfile(user.id, user.name);
}

async function requireCurrentAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    throw new Error("You must be signed in as an admin to manage this page.");
  }

  return user;
}

async function requireSignedInUser() {
  return requireSignedInUserWithNext("/");
}

async function requireSignedInUserWithNext(nextPath: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

function buildAuthRedirect(pathname: "/sign-in" | "/sign-up", params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value && value.trim()) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function appendStatusToReturnTo(returnTo: string, statusKey: string, statusValue: string) {
  const fallbackPath = returnTo.trim() || "/";
  const [pathname, queryString = ""] = fallbackPath.split("?");
  const searchParams = new URLSearchParams(queryString);
  searchParams.set(statusKey, statusValue);
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function getTeacherImportSourceFields(formData: FormData) {
  return {
    websiteUrl: String(formData.get("websiteUrl") ?? "").trim() || undefined,
    linkedinUrl: String(formData.get("linkedinUrl") ?? "").trim() || undefined,
    instagramUrl: String(formData.get("instagramUrl") ?? "").trim() || undefined,
    facebookUrl: String(formData.get("facebookUrl") ?? "").trim() || undefined,
    profileImportConsent: String(formData.get("profileImportConsent") ?? "") === "on"
  };
}

async function buildTeacherImportSourceInput(formData: FormData, teacherId: string): Promise<TeacherImportSourceInput> {
  const sourceFields = getTeacherImportSourceFields(formData);
  const resumeFile = formData.get("resumeFile");
  let resume:
    | {
        url: string;
        fileName: string;
        mimeType: string;
        text?: string;
      }
    | undefined;

  if (resumeFile instanceof File && resumeFile.size > 0) {
    const uploadedResume = await saveTeacherResume(resumeFile, teacherId);
    const extractedText = await extractResumeText(resumeFile);
    resume = {
      ...uploadedResume,
      text: extractedText || undefined
    };
  }

  return {
    ...sourceFields,
    resume
  };
}

async function buildPendingSignupTeacherImportSourceInput(
  formData: FormData,
  pendingSignupId: string
): Promise<TeacherImportSourceInput> {
  const sourceFields = getTeacherImportSourceFields(formData);
  const resumeFile = formData.get("resumeFile");
  let resume:
    | {
        url: string;
        fileName: string;
        mimeType: string;
        text?: string;
      }
    | undefined;

  if (resumeFile instanceof File && resumeFile.size > 0) {
    const uploadedResume = await savePendingSignupResume(resumeFile, pendingSignupId);
    const extractedText = await extractResumeText(resumeFile);
    resume = {
      ...uploadedResume,
      text: extractedText || undefined
    };
  }

  return {
    ...sourceFields,
    resume
  };
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "").trim();

  try {
    await signIn(email, password);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    redirect(
      buildAuthRedirect("/sign-in", {
        next: nextPath || undefined,
        error:
          message === "Invalid email or password."
            ? "invalid_credentials"
            : message === "Please verify your email before signing in."
              ? "email_not_verified"
              : "sign_in_failed",
        email
      })
    );
  }

  redirect(nextPath || "/");
}

export async function signUpAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "customer") as "customer" | "teacher";
  const nextPath = String(formData.get("next") ?? "").trim();
  const teacherImportSourceFields = getTeacherImportSourceFields(formData);
  const pendingSignupUploadId = `pending-signup-upload-${Date.now()}`;

  try {
    await createPendingSignupVerification({
      name,
      email,
      password,
      role,
      nextPath: nextPath || undefined,
      teacherImport:
        role === "teacher"
          ? await buildPendingSignupTeacherImportSourceInput(formData, pendingSignupUploadId)
          : undefined
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    console.error("[signUpAction] failed to start signup", error);
    redirect(
      buildAuthRedirect("/sign-up", {
        next: nextPath || undefined,
        error: "sign_up_failed",
        email,
        name,
        role,
        websiteUrl: teacherImportSourceFields.websiteUrl,
        linkedinUrl: teacherImportSourceFields.linkedinUrl,
        instagramUrl: teacherImportSourceFields.instagramUrl,
        facebookUrl: teacherImportSourceFields.facebookUrl,
        profileImportConsent: teacherImportSourceFields.profileImportConsent ? "1" : undefined
      })
    );
  }

  redirect(
    buildAuthRedirect("/sign-up", {
      status: "verification_sent",
      email,
      name,
      role,
      next: nextPath || undefined
    })
  );
}

export async function signOutAction() {
  await clearSession();
  redirect("/");
}

export async function completePendingSignupVerificationAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const selectedProfileKind = String(formData.get("selectedProfileKind") ?? "") as "user" | "teacher" | "";
  const selectedProfileId = String(formData.get("selectedProfileId") ?? "");

  const result = await consumePendingSignupVerification(
    token,
    selectedProfileKind && selectedProfileId ? { kind: selectedProfileKind, id: selectedProfileId } : undefined
  );

  if (result.status === "success") {
    redirect(result.redirectTo);
  }

  const query = new URLSearchParams();
  query.set("token", token);
  query.set("state", result.status);

  if ("message" in result) {
    query.set("message", result.message);
  }

  if (result.status === "blocked") {
    query.set("email", result.email);
  }

  redirect(`/auth/verify-email?${query.toString()}`);
}

export async function updateUserAsAdminAction(formData: FormData) {
  const admin = await requireCurrentAdmin();
  const userId = String(formData.get("userId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "customer") as "customer" | "teacher" | "admin";

  if (admin.id === userId && role !== "admin") {
    redirect("/admin/users?error=cannot_demote_self");
  }

  try {
    const result = await updateUserForAdmin(userId, { name, email, role });
    revalidatePath("/admin/users");
    redirect(result.emailChangeRequested ? "/admin/users?saved=email_change_requested" : "/admin/users?saved=user");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update user.";
    const errorCode =
      message === "That email is already in use."
        ? "email_in_use"
        : message === "That email is already waiting for confirmation."
          ? "email_pending"
          : "update_failed";
    redirect(`/admin/users?error=${errorCode}`);
  }
}

export async function deleteUserAsAdminAction(formData: FormData) {
  const admin = await requireCurrentAdmin();
  const userId = String(formData.get("userId") ?? "");

  if (admin.id === userId) {
    redirect("/admin/users?error=cannot_delete_self");
  }

  try {
    await deleteUserForAdmin(userId);
  } catch {
    redirect("/admin/users?error=delete_failed");
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?removed=user");
}

export async function updateAdminContentFiltersAction(formData: FormData) {
  await requireCurrentAdmin();

  const eventKeywords = String(formData.get("eventKeywords") ?? "");
  const jobKeywords = String(formData.get("jobKeywords") ?? "");

  const parseKeywords = (value: string) =>
    value
      .split(/\r?\n|,/)
      .map((keyword) => keyword.trim())
      .filter(Boolean);

  try {
    await updateAdminContentFilters({
      hiddenEventKeywords: parseKeywords(eventKeywords),
      hiddenJobKeywords: parseKeywords(jobKeywords)
    });
  } catch {
    redirect("/admin/content?error=update_failed");
  }

  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=filters");
}

export async function completePendingUserEmailChangeAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const result = await consumePendingUserEmailChange(token);

  const query = new URLSearchParams();
  query.set("state", result.status);

  if ("message" in result) {
    query.set("message", result.message);
  }

  if (result.status === "success") {
    query.set("email", result.email);
  }

  redirect(`/auth/confirm-email-change?${query.toString()}`);
}

export async function purchaseCreditsAction(formData: FormData) {
  const credits = Number(formData.get("credits") ?? 0);
  const user = await getCurrentUser();
  const result = await purchaseCredits(user?.id ?? DEFAULT_CUSTOMER_ID, credits);

  if (result.mode === "stripe" && result.checkoutUrl) {
    redirect(result.checkoutUrl);
  }

  revalidatePath("/credits");
}

export async function addCommunityDiscussionAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  await addCommunityDiscussion({
    authorName: user.name,
    authorRole: user.role === "teacher" ? "teacher" : user.role === "admin" ? "admin" : "member",
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  });

  revalidatePath("/community");
  redirect("/community?posted=1");
}

export async function bookSessionAction(formData: FormData) {
  const teacherId = String(formData.get("teacherId"));
  const offeringId = String(formData.get("offeringId"));
  const slotId = String(formData.get("slotId"));
  const notes = String(formData.get("notes") ?? "");
  const teacherSlug = String(formData.get("teacherSlug") ?? "");
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/teachers/${teacherSlug}/book`)}`);
  }

  await bookSession({
    customerId: user.id,
    teacherId,
    offeringId,
    slotId,
    notes
  });

  revalidatePath(`/teachers`);
  revalidatePath(`/teachers/${teacherSlug}`);
  revalidatePath("/bookings");
  revalidatePath("/credits");
  redirect("/bookings?created=1");
}

export async function bookCalendarSessionAction(formData: FormData) {
  const teacherId = String(formData.get("teacherId"));
  const sessionId = String(formData.get("sessionId"));
  const teacherSlug = String(formData.get("teacherSlug"));
  const notes = String(formData.get("notes") ?? "");
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/teachers/${teacherSlug}/book?sessionId=${sessionId}`)}`);
  }

  await bookCalendarSession({
    customerId: user.id,
    teacherId,
    sessionId,
    notes
  });

  revalidatePath(`/teachers`);
  revalidatePath(`/teachers/${teacherSlug}`);
  revalidatePath(`/teachers/${teacherSlug}/book`);
  revalidatePath("/dashboard/teacher/availability");
  revalidatePath("/bookings");
  revalidatePath("/credits");
  redirect("/bookings?created=1");
}

export async function updateTeacherProfileAction(formData: FormData) {
  const teacher = await requireCurrentTeacher();
  const avatarFile = formData.get("avatarFile");
  const uploadedAvatarUrl =
    avatarFile instanceof File && avatarFile.size > 0 ? await saveProfileImage(avatarFile, teacher.id) : undefined;

  await updateTeacherProfile(teacher.id, {
    fullName: String(formData.get("fullName") ?? ""),
    studioName: String(formData.get("studioName") ?? "").trim() || undefined,
    city: String(formData.get("city") ?? ""),
    serviceRadiusMiles: Number(formData.get("serviceRadiusMiles") ?? 0),
    training: String(formData.get("training") ?? ""),
    experienceYears: Number(formData.get("experienceYears") ?? 0),
    bio: String(formData.get("bio") ?? ""),
    gender: String(formData.get("gender") ?? "female") as "female" | "male" | "other",
    certificationStatus: teacher.certificationStatus,
    studioWebsiteUrl: String(formData.get("studioWebsiteUrl") ?? "").trim() || undefined,
    studioScheduleUrl: String(formData.get("studioScheduleUrl") ?? "").trim() || undefined,
    websiteUrl: String(formData.get("websiteUrl") ?? "").trim() || undefined,
    linkedinUrl: String(formData.get("linkedinUrl") ?? "").trim() || undefined,
    instagramUrl: String(formData.get("instagramUrl") ?? "").trim() || undefined,
    facebookUrl: String(formData.get("facebookUrl") ?? "").trim() || undefined,
    avatarUrl: uploadedAvatarUrl
  });

  revalidatePath("/dashboard/teacher/profile");
  revalidatePath(`/teachers/${teacher.slug}`);
  redirect("/dashboard/teacher/profile?saved=profile");
}

export async function completeTeacherImportOnboardingAction(formData: FormData) {
  const teacher = await requireCurrentTeacher();

  await submitTeacherImportOnboarding(teacher.id, await buildTeacherImportSourceInput(formData, teacher.id));

  revalidatePath("/onboarding/teacher");
  revalidatePath("/dashboard/teacher/profile");
  revalidatePath(`/teachers/${teacher.slug}`);
  redirect("/dashboard/teacher/profile?saved=imported");
}

export async function skipTeacherImportOnboardingAction() {
  const teacher = await requireCurrentTeacher();

  await skipTeacherImportOnboarding(teacher.id);

  revalidatePath("/onboarding/teacher");
  revalidatePath("/dashboard/teacher/profile");
  redirect("/dashboard/teacher/profile?saved=import-skipped");
}

export async function addAvailabilityAction(formData: FormData) {
  const teacher = await requireCurrentTeacher();

  addAvailabilitySlot(teacher.id, {
    startsAt: new Date(String(formData.get("startsAt"))).toISOString(),
    endsAt: new Date(String(formData.get("endsAt"))).toISOString(),
    timezone: String(formData.get("timezone") ?? "America/Los_Angeles")
  });

  revalidatePath("/dashboard/teacher/availability");
}

function getCalendarSessionInput(formData: FormData) {
  return {
    offeringId: String(formData.get("offeringId") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    startsAt: new Date(String(formData.get("startsAt"))).toISOString(),
    endsAt: new Date(String(formData.get("endsAt"))).toISOString(),
    timezone: String(formData.get("timezone") ?? "America/Los_Angeles").trim(),
    sourceUrl: String(formData.get("sourceUrl") ?? "").trim() || undefined
  };
}

export async function addCalendarSessionAction(formData: FormData) {
  const teacher = await requireCurrentTeacher();

  await addTeacherCalendarSession(teacher.id, getCalendarSessionInput(formData));

  revalidatePath("/dashboard/teacher/availability");
  revalidatePath(`/teachers/${teacher.slug}`);
}

export async function updateCalendarSessionAction(formData: FormData) {
  const teacher = await requireCurrentTeacher();
  const sessionId = String(formData.get("sessionId") ?? "");

  await updateTeacherCalendarSession(teacher.id, sessionId, getCalendarSessionInput(formData));

  revalidatePath("/dashboard/teacher/availability");
  revalidatePath(`/teachers/${teacher.slug}`);
}

export async function deleteCalendarSessionAction(formData: FormData) {
  const teacher = await requireCurrentTeacher();
  const sessionId = String(formData.get("sessionId") ?? "");

  await deleteTeacherCalendarSession(teacher.id, sessionId);

  revalidatePath("/dashboard/teacher/availability");
  revalidatePath(`/teachers/${teacher.slug}`);
}

export async function updatePublicCalendarVisibilityAction(formData: FormData) {
  const teacher = await requireCurrentTeacher();
  const showPublicCalendar = String(formData.get("showPublicCalendar") ?? "") === "true";

  await updateTeacherPublicCalendarVisibility(teacher.id, showPublicCalendar);

  revalidatePath("/dashboard/teacher/availability");
  revalidatePath("/dashboard/teacher/profile");
  revalidatePath(`/teachers/${teacher.slug}`);
  revalidatePath(`/teachers/${teacher.slug}/book`);
  redirect(`/dashboard/teacher/availability?saved=${showPublicCalendar ? "calendar-shown" : "calendar-hidden"}`);
}

export async function addOfferingAction(formData: FormData) {
  const teacher = await requireCurrentTeacher();

  addTeacherOffering(teacher.id, {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? "private") as ServiceCategory,
    deliveryMode: String(formData.get("deliveryMode") ?? "online") as DeliveryMode,
    sessionLengthMin: Number(formData.get("sessionLengthMin") ?? 60),
    creditPrice: Number(formData.get("creditPrice") ?? 10)
  });

  revalidatePath("/dashboard/teacher/bookings");
  revalidatePath(`/teachers/${teacher.slug}`);
}

export async function addStoryAction(formData: FormData) {
  const teacher = await requireCurrentTeacher();
  const mediaFile = formData.get("mediaFile");
  const uploadedMedia =
    mediaFile instanceof File && mediaFile.size > 0 ? await saveStoryMedia(mediaFile, teacher.id) : null;

  await addTeacherStory(teacher.id, {
    title: String(formData.get("title") ?? ""),
    caption: String(formData.get("caption") ?? ""),
    mediaUrl: uploadedMedia?.url ?? String(formData.get("mediaUrl") ?? ""),
    mediaType: uploadedMedia?.type ?? (String(formData.get("mediaType") ?? "image") as "image" | "video")
  });

  revalidatePath("/dashboard/teacher/profile");
  revalidatePath(`/teachers/${teacher.slug}`);
  redirect("/dashboard/teacher/profile?saved=story-added");
}

export async function updateStoryAction(formData: FormData) {
  const teacher = await requireCurrentTeacher();
  const mediaFile = formData.get("mediaFile");
  const uploadedMedia =
    mediaFile instanceof File && mediaFile.size > 0 ? await saveStoryMedia(mediaFile, teacher.id) : null;

  await updateTeacherStory(teacher.id, String(formData.get("storyId") ?? ""), {
    title: String(formData.get("title") ?? ""),
    caption: String(formData.get("caption") ?? ""),
    mediaUrl: uploadedMedia?.url ?? String(formData.get("mediaUrl") ?? ""),
    mediaType: uploadedMedia?.type ?? (String(formData.get("mediaType") ?? "image") as "image" | "video")
  });

  revalidatePath("/dashboard/teacher/profile");
  revalidatePath(`/teachers/${teacher.slug}`);
  redirect("/dashboard/teacher/profile?saved=story-updated");
}

export async function addUpcomingEventAction(formData: FormData) {
  const teacher = await requireCurrentTeacher();

  await addTeacherUpcomingEvent(teacher.id, {
    title: String(formData.get("title") ?? ""),
    hostName: String(formData.get("hostName") ?? "").trim() || undefined,
    eventUrl: String(formData.get("eventUrl") ?? ""),
    eventDate: String(formData.get("eventDate") ?? "").trim() || undefined
  });

  revalidatePath("/dashboard/teacher/profile");
  revalidatePath(`/teachers/${teacher.slug}`);
  redirect("/dashboard/teacher/profile?saved=event-added");
}

export async function toggleTeacherFollowAction(formData: FormData) {
  const user = await requireSignedInUser();
  const teacherId = String(formData.get("teacherId") ?? "");
  const teacherSlug = String(formData.get("teacherSlug") ?? "");
  const intent = String(formData.get("intent") ?? "follow");

  if (!teacherId) {
    throw new Error("Teacher follow is missing a teacher id.");
  }

  if (intent === "unfollow") {
    await unfollowTeacherForUser(user.id, teacherId);
  } else {
    await followTeacherForUser(user.id, teacherId);
  }

  revalidatePath("/");
  revalidatePath("/teachers");

  if (teacherSlug) {
    revalidatePath(`/teachers/${teacherSlug}`);
  }
}

export async function toggleEventHostFollowAction(formData: FormData) {
  const user = await requireSignedInUser();
  const hostId = String(formData.get("hostId") ?? "");
  const intent = String(formData.get("intent") ?? "follow");

  if (!hostId) {
    throw new Error("Host follow is missing a host id.");
  }

  if (intent === "unfollow") {
    await unfollowEventHostForUser(user.id, hostId);
  } else {
    await followEventHostForUser(user.id, hostId);
  }

  revalidatePath("/");
}

export async function addTeacherCertificationSubmissionAction(formData: FormData) {
  const teacher = await requireCurrentTeacher();
  const certificationFile = formData.get("certificationFile");

  if (!(certificationFile instanceof File) || certificationFile.size === 0) {
    throw new Error("Please upload a certification file before submitting.");
  }

  const uploadedFile = await saveCertificationDocument(certificationFile, teacher.id);

  await addTeacherCertificationSubmission(teacher.id, {
    credentialName: String(formData.get("credentialName") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim() || undefined,
    fileUrl: uploadedFile.url,
    fileName: uploadedFile.fileName,
    mimeType: uploadedFile.mimeType
  });

  revalidatePath("/dashboard/teacher/profile");
  revalidatePath("/admin/teachers");
  redirect("/dashboard/teacher/profile?saved=certification-submitted");
}

export async function reviewTeacherCertificationSubmissionAction(formData: FormData) {
  await requireCurrentAdmin();

  const submissionId = String(formData.get("submissionId") ?? "");
  const decision = String(formData.get("decision") ?? "approved") as "approved" | "rejected";
  const teacherSlug = String(formData.get("teacherSlug") ?? "");

  await reviewTeacherCertificationSubmission(
    submissionId,
    decision,
    String(formData.get("reviewNote") ?? "")
  );

  revalidatePath("/admin/teachers");

  if (teacherSlug) {
    revalidatePath(`/teachers/${teacherSlug}`);
  }
}

export async function contactTeacherAction(formData: FormData) {
  const teacherSlug = String(formData.get("teacherSlug") ?? "");
  const recaptchaToken = String(formData.get("recaptchaToken") ?? "");

  if (!recaptchaToken) {
    redirect(`/teachers/${teacherSlug}?contact=captcha`);
  }

  const verification = await verifyRecaptchaToken(recaptchaToken);

  if (!verification.success) {
    redirect(`/teachers/${teacherSlug}?contact=${verification.reason === "missing_secret" ? "error" : "captcha"}`);
  }

  await createContactInquiry({
    teacherId: String(formData.get("teacherId") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? "")
  });

  redirect(`/teachers/${teacherSlug}?contact=sent`);
}

export async function contactAdminAction(formData: FormData) {
  const returnTo = String(formData.get("returnTo") ?? "/").trim() || "/";
  const recaptchaToken = String(formData.get("recaptchaToken") ?? "");

  if (!recaptchaToken) {
    redirect(appendStatusToReturnTo(returnTo, "support", "captcha"));
  }

  const verification = await verifyRecaptchaToken(recaptchaToken);

  if (!verification.success) {
    redirect(appendStatusToReturnTo(returnTo, "support", verification.reason === "missing_secret" ? "error" : "captcha"));
  }

  addAdminContactInquiry({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? "")
  });

  redirect(appendStatusToReturnTo(returnTo, "support", "sent"));
}

export async function markPayoutPaidAction(formData: FormData) {
  const providedTeacherId = formData.get("teacherId");
  const teacherId = providedTeacherId ? String(providedTeacherId) : (await requireCurrentTeacher()).id;

  if (providedTeacherId) {
    await requireCurrentAdmin();
  }

  const providerResult = await schedulePayout({
    teacherId,
    amountCredits: Number(formData.get("amountCredits") ?? 0),
    payoutReference: `manual-${teacherId}-${Date.now()}`
  });

  if (providerResult.status === "scheduled" || providerResult.status === "paid") {
    markPayoutPaid(teacherId);
  }

  revalidatePath("/admin/payouts");
  revalidatePath("/dashboard/teacher/earnings");
}
