import { differenceInMinutes, formatISO } from "date-fns";

import {
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
  teachingHours: JSON.parse(JSON.stringify(demoTeachingHours)) as typeof demoTeachingHours
};

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

function hydrateTeacher(teacher: Teacher) {
  const badgeIds = state.teacherBadges.filter((item) => item.teacherId === teacher.id);
  const styleIds = state.teacherStyles.filter((item) => item.teacherId === teacher.id);
  const offerings = state.offerings.filter((offering) => offering.teacherId === teacher.id && offering.active);
  const stories = state.stories
    .filter((story) => story.teacherId === teacher.id && story.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const availability = state.availability
    .filter((slot) => slot.teacherId === teacher.id)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const counters = state.teachingHours.filter((item) => item.teacherId === teacher.id);
  const earnings = state.earnings.filter((item) => item.teacherId === teacher.id);

  return {
    ...teacher,
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
    teachingHours: counters.map((counter) => ({
      category: serviceCategoryLabels[counter.category],
      totalHours: counter.totalHours
    })),
    earnings,
    payoutAccount: state.payoutAccounts.find((account) => account.teacherId === teacher.id) ?? null
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

  updateTeachingHours(state.teachingHours, input.teacherId, offering.category, differenceInMinutes(new Date(slot.endsAt), new Date(slot.startsAt)));
  return booking;
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
