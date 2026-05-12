import { differenceInMinutes, formatISO } from "date-fns";

import {
  demoAdminContactInquiries,
  demoAvailability,
  demoBadges,
  demoBookings,
  demoCommunityDiscussions,
  demoEarnings,
  demoOfferings,
  demoPayoutAccounts,
  demoStories,
  demoTeacherBadges,
  demoTeachers,
  demoTeacherStyles,
  demoTeachingHours,
  demoTransactions,
  demoUsers,
  demoWallets,
  demoYogaStyles,
  serviceCategoryLabels
} from "@/lib/mock-data";
import { calculateCommission } from "@/lib/payments/calculate-commission";
import { updateTeachingHours } from "@/lib/teachers/update-teaching-hours";
import type {
  AdminContentFilters,
  AdminContactInquiry,
  AdminManagedUser,
  AppUser,
  AvailabilitySlot,
  Booking,
  CommunityDiscussion,
  SearchFilters,
  ServiceCategory,
  Teacher,
  TeacherOffering,
  TeacherStory
} from "@/lib/types";

export const DEFAULT_CUSTOMER_ID = "user-customer-1";
export const DEFAULT_TEACHER_ID = "teacher-1";
export const DEFAULT_ADMIN_ID = "user-admin-1";

const state = {
  users: JSON.parse(JSON.stringify(demoUsers)) as typeof demoUsers,
  teachers: JSON.parse(JSON.stringify(demoTeachers)) as typeof demoTeachers,
  badges: JSON.parse(JSON.stringify(demoBadges)) as typeof demoBadges,
  teacherBadges: JSON.parse(JSON.stringify(demoTeacherBadges)) as typeof demoTeacherBadges,
  yogaStyles: JSON.parse(JSON.stringify(demoYogaStyles)) as typeof demoYogaStyles,
  teacherStyles: JSON.parse(JSON.stringify(demoTeacherStyles)) as typeof demoTeacherStyles,
  offerings: JSON.parse(JSON.stringify(demoOfferings)) as typeof demoOfferings,
  stories: JSON.parse(JSON.stringify(demoStories)) as typeof demoStories,
  availability: JSON.parse(JSON.stringify(demoAvailability)) as typeof demoAvailability,
  bookings: JSON.parse(JSON.stringify(demoBookings)) as typeof demoBookings,
  discussions: JSON.parse(JSON.stringify(demoCommunityDiscussions)) as typeof demoCommunityDiscussions,
  wallets: JSON.parse(JSON.stringify(demoWallets)) as typeof demoWallets,
  transactions: JSON.parse(JSON.stringify(demoTransactions)) as typeof demoTransactions,
  earnings: JSON.parse(JSON.stringify(demoEarnings)) as typeof demoEarnings,
  payoutAccounts: JSON.parse(JSON.stringify(demoPayoutAccounts)) as typeof demoPayoutAccounts,
  teachingHours: JSON.parse(JSON.stringify(demoTeachingHours)) as typeof demoTeachingHours,
  adminContactInquiries: JSON.parse(JSON.stringify(demoAdminContactInquiries)) as typeof demoAdminContactInquiries,
  adminContentFilters: {
    hiddenEventKeywords: [],
    hiddenJobKeywords: []
  } as AdminContentFilters
};

const teacherPublicCalendarVisibility = Object.fromEntries(
  demoTeachers.map((teacher) => [teacher.id, teacher.showPublicCalendar ?? true])
) as Record<string, boolean>;

export function getUserById(userId: string) {
  return state.users.find((user) => user.id === userId) ?? null;
}

export function getUserByEmail(email: string) {
  return state.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function createUser(input: Pick<AppUser, "email" | "password" | "name" | "role">) {
  const user: AppUser = {
    id: `user-${Date.now()}`,
    ...input
  };

  state.users.push(user);
  state.wallets.push({ userId: user.id, balance: 0 });

  return user;
}

export function listUsersForAdmin() {
  return [...state.users]
    .map<AdminManagedUser>((user) => {
      const linkedTeacher = state.teachers.find((teacher) => teacher.userId === user.id);

      return {
        ...user,
        linkedTeacherId: linkedTeacher?.id,
        linkedTeacherName: linkedTeacher?.fullName,
        linkedTeacherSlug: linkedTeacher?.slug
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildClaimableEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.endsWith("@yoga.local")) {
    return normalizedEmail;
  }

  const [localPart] = normalizedEmail.split("@");
  return localPart ? `${localPart}@yoga.local` : normalizedEmail;
}

function normalizeKeywordList(keywords: string[]) {
  return Array.from(
    new Set(
      keywords
        .map((keyword) => keyword.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

export function getAdminContentFilters(): AdminContentFilters {
  return {
    hiddenEventKeywords: [...state.adminContentFilters.hiddenEventKeywords],
    hiddenJobKeywords: [...state.adminContentFilters.hiddenJobKeywords]
  };
}

export function updateAdminContentFilters(input: AdminContentFilters) {
  state.adminContentFilters = {
    hiddenEventKeywords: normalizeKeywordList(input.hiddenEventKeywords),
    hiddenJobKeywords: normalizeKeywordList(input.hiddenJobKeywords)
  };

  return getAdminContentFilters();
}

export function updateUserForAdmin(
  userId: string,
  input: Pick<AppUser, "name" | "email" | "role">
) {
  const user = state.users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("User not found.");
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const duplicate = state.users.find((entry) => entry.id !== userId && entry.email.toLowerCase() === normalizedEmail);

  if (duplicate) {
    throw new Error("That email is already in use.");
  }

  user.name = input.name;
  user.email = normalizedEmail;
  user.role = input.role;

  const linkedTeacher = state.teachers.find((teacher) => teacher.userId === userId);

  if (input.role === "teacher") {
    if (!linkedTeacher) {
      ensureTeacherProfile(userId, input.name);
    }
  } else if (linkedTeacher) {
    linkedTeacher.userId = undefined;
    linkedTeacher.claimEmail = buildClaimableEmail(normalizedEmail);
  }

  return user;
}

export function deleteUserForAdmin(userId: string) {
  const userIndex = state.users.findIndex((entry) => entry.id === userId);

  if (userIndex === -1) {
    throw new Error("User not found.");
  }

  const [user] = state.users.splice(userIndex, 1);
  const linkedTeacher = state.teachers.find((teacher) => teacher.userId === userId);

  if (linkedTeacher) {
    linkedTeacher.userId = undefined;
    linkedTeacher.claimEmail = buildClaimableEmail(user.email);
  }

  state.wallets = state.wallets.filter((wallet) => wallet.userId !== userId);
  state.transactions = state.transactions.filter((transaction) => transaction.userId !== userId);
  state.bookings = state.bookings.filter((booking) => booking.customerId !== userId);

  return user;
}

function slugifyTeacherName(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "teacher";
}

function getUniqueTeacherSlug(name: string) {
  const baseSlug = slugifyTeacherName(name);
  let slug = baseSlug;
  let suffix = 2;

  while (state.teachers.some((teacher) => teacher.slug === slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export function ensureTeacherProfile(userId: string, fullName: string) {
  const existingTeacher = state.teachers.find((entry) => entry.userId === userId);

  if (existingTeacher) {
    return hydrateTeacher(existingTeacher);
  }

  const teacher: Teacher = {
    id: `teacher-${Date.now()}`,
    userId,
    slug: getUniqueTeacherSlug(fullName),
    fullName,
    showPublicCalendar: true,
    city: "",
    serviceRadiusMiles: 0,
    training: "",
    experienceYears: 0,
    bio: "",
    gender: "other",
    certificationStatus: "not_certified",
    published: false
  };

  state.teachers.push(teacher);
  return hydrateTeacher(teacher);
}

function hydrateTeacher(teacher: Teacher) {
  const teacherData = getTeacherSupplement(teacher.id);

  return {
    ...teacher,
    ...teacherData
  };
}

export function getTeacherSupplement(teacherId: string) {
  const badgeIds = state.teacherBadges.filter((item) => item.teacherId === teacherId);
  const styleIds = state.teacherStyles.filter((item) => item.teacherId === teacherId);
  const offerings = state.offerings.filter((offering) => offering.teacherId === teacherId && offering.active);
  const stories = state.stories
    .filter((story) => story.teacherId === teacherId && story.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const availability = state.availability
    .filter((slot) => slot.teacherId === teacherId)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const counters = state.teachingHours.filter((item) => item.teacherId === teacherId);
  const earnings = state.earnings.filter((item) => item.teacherId === teacherId);

  return {
    badges: badgeIds.map((item) => {
      const badge = state.badges.find((entry) => entry.id === item.badgeId);
      return {
        ...badge!,
        verified: item.verified
      };
    }),
    styles: styleIds
      .map((item) => state.yogaStyles.find((style) => style.id === item.styleId)?.name)
      .filter(Boolean) as string[],
    offerings,
    stories,
    availability,
    showPublicCalendar: teacherPublicCalendarVisibility[teacherId] ?? state.teachers.find((entry) => entry.id === teacherId)?.showPublicCalendar ?? true,
    teachingHours: counters.map((counter) => ({
      category: serviceCategoryLabels[counter.category],
      totalHours: counter.totalHours
    })),
    earnings,
    payoutAccount: state.payoutAccounts.find((account) => account.teacherId === teacherId) ?? null
  };
}

export function listTeachers() {
  return state.teachers.filter((teacher) => teacher.published).map(hydrateTeacher);
}

export function getTeacherBySlug(slug: string) {
  const teacher = state.teachers.find((entry) => entry.slug === slug && entry.published);
  return teacher ? hydrateTeacher(teacher) : null;
}

export function getTeacherById(teacherId: string) {
  const teacher = state.teachers.find((entry) => entry.id === teacherId);
  return teacher ? hydrateTeacher(teacher) : null;
}

export function getTeacherByUserId(userId: string) {
  const teacher = state.teachers.find((entry) => entry.userId === userId);
  return teacher ? hydrateTeacher(teacher) : null;
}

function matchesDate(teacherId: string, date: string) {
  return state.availability.some((slot) => {
    if (slot.teacherId !== teacherId || slot.isBooked) return false;
    return slot.startsAt.slice(0, 10) === date;
  });
}

export function searchTeachers(filters: SearchFilters) {
  return listTeachers().filter((teacher) => {
    if (filters.city && !teacher.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.certified && teacher.certificationStatus !== filters.certified) return false;
    if (filters.gender && teacher.gender !== filters.gender) return false;
    if (filters.style && !teacher.styles.some((style) => style.toLowerCase().includes(filters.style!.toLowerCase()))) return false;
    if (filters.date && !matchesDate(teacher.id, filters.date)) return false;

    const matchingOfferings = teacher.offerings.filter((offering) => {
      if (filters.category && offering.category !== filters.category) return false;
      if (filters.length && offering.sessionLengthMin !== filters.length) return false;
      if (filters.deliveryMode && offering.deliveryMode !== filters.deliveryMode) return false;
      return true;
    });

    return matchingOfferings.length > 0;
  });
}

export function getCustomerWallet(userId = DEFAULT_CUSTOMER_ID) {
  return state.wallets.find((wallet) => wallet.userId === userId) ?? { userId, balance: 0 };
}

export function getCustomerTransactions(userId = DEFAULT_CUSTOMER_ID) {
  return state.transactions
    .filter((transaction) => transaction.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCustomerBookings(userId = DEFAULT_CUSTOMER_ID) {
  return state.bookings
    .filter((booking) => booking.customerId === userId)
    .map((booking) => {
      const teacher = state.teachers.find((entry) => entry.id === booking.teacherId);
      const offering = state.offerings.find((entry) => entry.id === booking.offeringId);
      return {
        ...booking,
        teacherName: teacher?.fullName ?? "Unknown teacher",
        offeringTitle: offering?.title ?? "Unknown session"
      };
    })
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}

export function getTeacherBookings(teacherId = DEFAULT_TEACHER_ID) {
  return state.bookings
    .filter((booking) => booking.teacherId === teacherId)
    .map((booking) => {
      const customer = state.users.find((entry) => entry.id === booking.customerId);
      const offering = state.offerings.find((entry) => entry.id === booking.offeringId);
      return {
        ...booking,
        customerName: customer?.name ?? "Unknown student",
        offeringTitle: offering?.title ?? "Unknown session"
      };
    })
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}

export function getTeacherBalance(teacherId = DEFAULT_TEACHER_ID) {
  const earnings = state.earnings.filter((entry) => entry.teacherId === teacherId);

  return {
    totalEarned: earnings.reduce((sum, entry) => sum + entry.netCredits, 0),
    totalGross: earnings.reduce((sum, entry) => sum + entry.grossCredits, 0),
    totalCommission: earnings.reduce((sum, entry) => sum + entry.platformCommission, 0),
    availableBalance: earnings
      .filter((entry) => entry.payoutStatus !== "paid")
      .reduce((sum, entry) => sum + entry.netCredits, 0),
    entries: earnings.sort((a, b) => b.id.localeCompare(a.id))
  };
}

export function getAdminSnapshot() {
  const allBookings = [...state.bookings].sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const teachers = listTeachers();
  const totalGross = state.earnings.reduce((sum, entry) => sum + entry.grossCredits, 0);
  const totalCommission = state.earnings.reduce((sum, entry) => sum + entry.platformCommission, 0);
  const pendingPayout = state.earnings
    .filter((entry) => entry.payoutStatus !== "paid")
    .reduce((sum, entry) => sum + entry.netCredits, 0);

  return {
    teachers,
    bookings: allBookings,
    totalGross,
    totalCommission,
    pendingPayout,
    earnings: [...state.earnings]
  };
}

export function listCommunityDiscussions() {
  return [...state.discussions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addCommunityDiscussion(input: Pick<CommunityDiscussion, "authorName" | "authorRole" | "title" | "body" | "tags">) {
  const discussion: CommunityDiscussion = {
    id: `discussion-${Date.now()}`,
    createdAt: new Date().toISOString(),
    replyCount: 0,
    ...input
  };

  state.discussions.push(discussion);
  return discussion;
}

export function addAdminContactInquiry(input: Pick<AdminContactInquiry, "name" | "email" | "message">) {
  const inquiry: AdminContactInquiry = {
    id: `admin-contact-${Date.now()}`,
    name: input.name,
    email: input.email.toLowerCase(),
    message: input.message,
    createdAt: formatISO(new Date())
  };

  state.adminContactInquiries.push(inquiry);
  return inquiry;
}

export function updateTeacherProfile(
  teacherId: string,
  input: Pick<Teacher, "fullName" | "city" | "serviceRadiusMiles" | "training" | "experienceYears" | "bio" | "gender" | "certificationStatus">
) {
  const teacher = state.teachers.find((entry) => entry.id === teacherId);
  if (!teacher) {
    throw new Error("Teacher not found.");
  }

  Object.assign(teacher, input);
  return hydrateTeacher(teacher);
}

export function setTeacherPublicCalendarVisibility(teacherId: string, showPublicCalendar: boolean) {
  teacherPublicCalendarVisibility[teacherId] = showPublicCalendar;

  const teacher = state.teachers.find((entry) => entry.id === teacherId);
  if (teacher) {
    teacher.showPublicCalendar = showPublicCalendar;
  }
}

export function addTeacherStory(teacherId: string, story: Pick<TeacherStory, "title" | "caption" | "mediaUrl" | "mediaType">) {
  const created: TeacherStory = {
    id: `story-${Date.now()}`,
    teacherId,
    sortOrder: state.stories.filter((entry) => entry.teacherId === teacherId).length + 1,
    published: true,
    ...story
  };

  state.stories.push(created);
  return created;
}

export function updateTeacherStory(
  teacherId: string,
  storyId: string,
  story: Pick<TeacherStory, "title" | "caption" | "mediaUrl" | "mediaType">
) {
  const existing = state.stories.find((entry) => entry.id === storyId && entry.teacherId === teacherId);

  if (!existing) {
    throw new Error("Story not found.");
  }

  Object.assign(existing, story);
  return existing;
}

export function addTeacherOffering(
  teacherId: string,
  offering: Pick<TeacherOffering, "title" | "description" | "category" | "deliveryMode" | "sessionLengthMin" | "creditPrice">
) {
  const created: TeacherOffering = {
    id: `offering-${Date.now()}`,
    teacherId,
    active: true,
    ...offering
  };

  state.offerings.push(created);
  return created;
}

export function addAvailabilitySlot(
  teacherId: string,
  slot: Pick<AvailabilitySlot, "startsAt" | "endsAt" | "timezone">
) {
  const created: AvailabilitySlot = {
    id: `slot-${Date.now()}`,
    teacherId,
    isBooked: false,
    ...slot
  };

  state.availability.push(created);
  return created;
}

export function purchaseCredits(userId: string, credits: number) {
  const wallet = getCustomerWallet(userId);
  wallet.balance += credits;

  state.transactions.push({
    id: `txn-${Date.now()}`,
    userId,
    amount: credits,
    type: "purchase",
    reference: "demo-credit-purchase",
    createdAt: new Date().toISOString()
  });

  return wallet;
}

export function bookTeacherSession(input: {
  customerId: string;
  teacherId: string;
  offeringId: string;
  slotId: string;
  notes?: string;
}) {
  const wallet = getCustomerWallet(input.customerId);
  const offering = state.offerings.find((entry) => entry.id === input.offeringId && entry.teacherId === input.teacherId && entry.active);
  const slot = state.availability.find((entry) => entry.id === input.slotId && entry.teacherId === input.teacherId);

  if (!offering || !slot) {
    throw new Error("The selected session is no longer available.");
  }

  if (slot.isBooked) {
    throw new Error("That time has already been booked.");
  }

  if (wallet.balance < offering.creditPrice) {
    throw new Error("Not enough credits. Please top up before booking.");
  }

  wallet.balance -= offering.creditPrice;
  slot.isBooked = true;

  const booking: Booking = {
    id: `booking-${Date.now()}`,
    customerId: input.customerId,
    teacherId: input.teacherId,
    offeringId: offering.id,
    slotId: slot.id,
    notes: input.notes,
    status: "confirmed",
    paymentStatus: "paid",
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    creditsSpent: offering.creditPrice
  };

  state.bookings.push(booking);
  state.transactions.push({
    id: `txn-${Date.now()}-spend`,
    userId: input.customerId,
    amount: -offering.creditPrice,
    type: "spend",
    reference: booking.id,
    createdAt: new Date().toISOString()
  });

  const commission = calculateCommission(offering.creditPrice);
  state.earnings.push({
    id: `earn-${Date.now()}`,
    teacherId: input.teacherId,
    bookingId: booking.id,
    grossCredits: commission.grossCredits,
    platformCommission: commission.platformCommission,
    netCredits: commission.netCredits,
    payoutStatus: "pending"
  });

  const minutesAdded = differenceInMinutes(new Date(slot.endsAt), new Date(slot.startsAt));
  updateTeachingHours(state.teachingHours, input.teacherId, offering.category, minutesAdded);
  return {
    booking,
    teachingHoursPersist: {
      teacherId: input.teacherId,
      category: offering.category,
      minutesAdded
    }
  };
}

export function bookTeacherCalendarSession(input: {
  customerId: string;
  teacherId: string;
  offeringId: string;
  sessionId: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
}) {
  const wallet = getCustomerWallet(input.customerId);
  const offering = state.offerings.find((entry) => entry.id === input.offeringId && entry.teacherId === input.teacherId && entry.active);

  if (!offering) {
    throw new Error("The selected session is no longer available.");
  }

  if (wallet.balance < offering.creditPrice) {
    throw new Error("Not enough credits. Please top up before booking.");
  }

  wallet.balance -= offering.creditPrice;

  const booking: Booking = {
    id: `booking-${Date.now()}`,
    customerId: input.customerId,
    teacherId: input.teacherId,
    offeringId: offering.id,
    slotId: input.sessionId,
    notes: input.notes,
    status: "confirmed",
    paymentStatus: "paid",
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    creditsSpent: offering.creditPrice
  };

  state.bookings.push(booking);
  state.transactions.push({
    id: `txn-${Date.now()}-spend`,
    userId: input.customerId,
    amount: -offering.creditPrice,
    type: "spend",
    reference: booking.id,
    createdAt: new Date().toISOString()
  });

  const commission = calculateCommission(offering.creditPrice);
  state.earnings.push({
    id: `earn-${Date.now()}`,
    teacherId: input.teacherId,
    bookingId: booking.id,
    grossCredits: commission.grossCredits,
    platformCommission: commission.platformCommission,
    netCredits: commission.netCredits,
    payoutStatus: "pending"
  });

  const minutesAdded = differenceInMinutes(new Date(input.endsAt), new Date(input.startsAt));
  updateTeachingHours(state.teachingHours, input.teacherId, offering.category, minutesAdded);
  return {
    booking,
    teachingHoursPersist: {
      teacherId: input.teacherId,
      category: offering.category,
      minutesAdded
    }
  };
}

export function markPayoutPaid(teacherId: string) {
  const batchRef = `manual-${formatISO(new Date(), { representation: "date" })}-${teacherId}`;
  state.earnings.forEach((entry) => {
    if (entry.teacherId === teacherId && entry.payoutStatus !== "paid") {
      entry.payoutStatus = "paid";
      entry.payoutBatchRef = batchRef;
    }
  });
}

export function getServiceOptions() {
  return Object.entries(serviceCategoryLabels).map(([value, label]) => ({
    value: value as ServiceCategory,
    label
  }));
}
