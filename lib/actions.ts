"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentUser, signIn, signUp, clearSession } from "@/lib/auth/session";
import { bookSession } from "@/lib/booking/book-session";
import { purchaseCredits } from "@/lib/credits/purchase-credits";
import { saveProfileImage, saveStoryMedia } from "@/lib/media/storage";
import { schedulePayout } from "@/lib/payouts/payout-provider";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import {
  DEFAULT_CUSTOMER_ID,
  addAvailabilitySlot,
  addTeacherOffering,
  markPayoutPaid,
} from "@/lib/store";
import { addCommunityDiscussion, addTeacherStory, addTeacherUpcomingEvent, createContactInquiry, ensureTeacherProfile, updateTeacherStory, updateTeacherProfile } from "@/lib/persistence";
import type { DeliveryMode, ServiceCategory } from "@/lib/types";

async function requireCurrentTeacher() {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    throw new Error("You must be signed in as a teacher to manage this page.");
  }

  return ensureTeacherProfile(user.id, user.name);
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  await signIn(email, password);
  redirect("/");
}

export async function signUpAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "customer") as "customer" | "teacher";

  await signUp({ name, email, password, role });
  redirect("/");
}

export async function signOutAction() {
  await clearSession();
  redirect("/");
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

  await addCommunityDiscussion({
    authorName: user?.name ?? "Community Member",
    authorRole: user?.role === "teacher" ? "teacher" : user?.role === "admin" ? "admin" : "member",
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
  const user = await getCurrentUser();

  await bookSession({
    customerId: user?.id ?? DEFAULT_CUSTOMER_ID,
    teacherId,
    offeringId,
    slotId,
    notes
  });

  revalidatePath(`/teachers`);
  revalidatePath(`/teachers/${String(formData.get("teacherSlug"))}`);
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
    city: String(formData.get("city") ?? ""),
    serviceRadiusMiles: Number(formData.get("serviceRadiusMiles") ?? 0),
    training: String(formData.get("training") ?? ""),
    experienceYears: Number(formData.get("experienceYears") ?? 0),
    bio: String(formData.get("bio") ?? ""),
    gender: String(formData.get("gender") ?? "female") as "female" | "male" | "other",
    certificationStatus: String(formData.get("certificationStatus") ?? "certified") as "certified" | "not_certified",
    avatarUrl: uploadedAvatarUrl
  });

  revalidatePath("/dashboard/teacher/profile");
  revalidatePath(`/teachers/${teacher.slug}`);
  redirect("/dashboard/teacher/profile?saved=profile");
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

export async function markPayoutPaidAction(formData: FormData) {
  const providedTeacherId = formData.get("teacherId");
  const teacherId = providedTeacherId ? String(providedTeacherId) : (await requireCurrentTeacher()).id;
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
