import { addDays, addHours, startOfDay } from "date-fns";

import type {
  AppUser,
  AvailabilitySlot,
  Badge,
  Booking,
  CreditTransaction,
  CreditWallet,
  Teacher,
  TeacherBadge,
  TeacherEarningsLedger,
  TeacherOffering,
  TeacherPayoutAccount,
  CommunityDiscussion,
  TeacherStory,
  TeacherStyle,
  TeachingHourCounter,
  YogaStyle
} from "@/lib/types";

const today = startOfDay(new Date());

const makeSlot = (id: string, teacherId: string, dayOffset: number, hour: number, durationHours = 1): AvailabilitySlot => {
  const startsAt = addHours(addDays(today, dayOffset), hour);
  const endsAt = addHours(startsAt, durationHours);

  return {
    id,
    teacherId,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    timezone: "America/Los_Angeles",
    isBooked: false
  };
};

export const serviceCategoryLabels = {
  studio: "Studio",
  private: "Private",
  "corporate-events": "Corporate / events",
  kids: "Kids",
  older: "Older"
} as const;

export const demoUsers: AppUser[] = [
  { id: "user-customer-1", email: "student@yoga.local", password: "password123", role: "customer", name: "Maya Student" },
  { id: "user-teacher-1", email: "teacher@yoga.local", password: "password123", role: "teacher", name: "Ashley Tan" },
  { id: "user-teacher-2", email: "teacher2@yoga.local", password: "password123", role: "teacher", name: "Kelly Heinrich" },
  { id: "user-admin-1", email: "admin@yoga.local", password: "password123", role: "admin", name: "Jordan Admin" }
];

export const demoTeachers: Teacher[] = [
  {
    id: "teacher-1",
    userId: "user-teacher-1",
    slug: "ashley-tan",
    fullName: "Ashley Tan",
    avatarUrl: "/assets/images/ashley-tan.png",
    studioName: "J8 Hot Pilates & Yoga",
    studioWebsiteUrl: "https://www.j8hotpilatesyoga.com/",
    studioScheduleUrl: "https://www.j8hotpilatesyoga.com/about/classes/",
    platformHoursBooked: 14,
    city: "San Francisco",
    serviceRadiusMiles: 20,
    training: "500-hour Vinyasa certification with advanced pre/postnatal and restorative training in Bali and California.",
    experienceYears: 9,
    bio: `Hi, I'm Ashley Tan. I've been practicing yoga for over 25 years, but my journey really began in Chengdu, China, where I spent most of my childhood. Some of my most meaningful memories are from Qingcheng Mountain—the home of Taoism—where I developed a deep appreciation for balance, nature, and inner stillness.

Growing up drinking green tea every day, it feels natural for me to bring together all the things I love—yoga, tea, and movement. This blend is at the heart of my practice, creating a space that is calming, accessible, and thoughtfully designed for every individual.

That same spirit is how I approach teaching: yoga isn't one shape or pace—it's meeting yourself where you are. As a certified instructor, I offer Chair, Yin, and Flow so that people of all ages can find steadiness, softness, and strength in a way that fits their body and their day.

Whether you need support in a seat, depth in stillness, or rhythm in movement, sessions are built around your needs and energy—so practice stays grounded, approachable, and truly yours.`,
    gender: "female",
    certificationStatus: "certified",
    published: true
  },
  {
    id: "teacher-2",
    userId: "user-teacher-2",
    slug: "kai-raman",
    fullName: "Kelly Heinrich",
    platformHoursBooked: 264,
    city: "Oakland",
    serviceRadiusMiles: 15,
    training: "RYT-300 in Hatha and trauma-informed yoga with a specialization in seniors and kids classes.",
    experienceYears: 12,
    bio: "Kai focuses on inclusive movement for schools, older adults, and corporate wellness sessions.",
    gender: "male",
    certificationStatus: "certified",
    published: true
  }
];

export const demoBadges: Badge[] = [
  { id: "badge-1", name: "RYT-500", description: "Advanced 500-hour teacher training" },
  { id: "badge-2", name: "Kids Yoga", description: "Registered children's yoga school certification", imageUrl: "/assets/images/yoga_kids_certification.png" },
  { id: "badge-3", name: "Corporate Wellness", description: "Experienced in workplace and event facilitation" },
  { id: "badge-4", name: "Red Cross", description: "Red Cross verified credential", imageUrl: "/assets/images/red_cross_CPR.png" },
  { id: "badge-5", name: "200RYT", description: "Registered Yoga Teacher 200-hour certification", imageUrl: "/assets/images/200RYT_certification.jpeg" },
  { id: "badge-6", name: "Yin Yoga", description: "Yin Yoga certification", imageUrl: "/assets/images/Yin_Yoga_Certification_badge.jpeg" },
  { id: "badge-7", name: "Background Checked", description: "Background check verified", imageUrl: "/assets/images/background_checked.png" }
];

export const demoTeacherBadges: TeacherBadge[] = [
  { teacherId: "teacher-1", badgeId: "badge-4", verified: true },
  { teacherId: "teacher-1", badgeId: "badge-5", verified: true },
  { teacherId: "teacher-1", badgeId: "badge-7", verified: true },
  { teacherId: "teacher-1", badgeId: "badge-6", verified: true },
  { teacherId: "teacher-2", badgeId: "badge-2", verified: true },
  { teacherId: "teacher-2", badgeId: "badge-5", verified: true },
  { teacherId: "teacher-2", badgeId: "badge-6", verified: true }
];

export const demoYogaStyles: YogaStyle[] = [
  { id: "style-1", name: "Vinyasa" },
  { id: "style-2", name: "Restorative" },
  { id: "style-3", name: "Hatha" },
  { id: "style-4", name: "Yin" },
  { id: "style-5", name: "Chair" }
];

export const demoTeacherStyles: TeacherStyle[] = [
  { teacherId: "teacher-1", styleId: "style-1" },
  { teacherId: "teacher-1", styleId: "style-2" },
  { teacherId: "teacher-1", styleId: "style-4" },
  { teacherId: "teacher-1", styleId: "style-3" },
  { teacherId: "teacher-1", styleId: "style-5" },
  { teacherId: "teacher-2", styleId: "style-3" },
  { teacherId: "teacher-2", styleId: "style-4" }
];

export const demoOfferings: TeacherOffering[] = [
  {
    id: "offering-1",
    teacherId: "teacher-1",
    category: "private",
    title: "Private flow session",
    description: "1:1 customized flow focused on mobility and strength.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 14,
    active: true
  },
  {
    id: "offering-2",
    teacherId: "teacher-1",
    category: "corporate-events",
    title: "Chair Yoga",
    description: "Accessible chair-supported movement focused on mobility, breath, and gentle strength.",
    deliveryMode: "online",
    sessionLengthMin: 45,
    creditPrice: 18,
    active: true
  },
  {
    id: "offering-3",
    teacherId: "teacher-1",
    category: "private",
    title: "Sensory Awakening",
    description: "A grounded in-person session designed to awaken the senses through movement, breath, and mindful presence.",
    deliveryMode: "in_person",
    sessionLengthMin: 90,
    creditPrice: 30,
    active: true
  },
  {
    id: "offering-4",
    teacherId: "teacher-2",
    category: "older",
    title: "Older adults mobility",
    description: "Gentle session tailored for stability and confidence.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 12,
    active: true
  },
  {
    id: "offering-5",
    teacherId: "teacher-2",
    category: "kids",
    title: "Kids storytelling yoga",
    description: "Creative movement and breath work for ages 6-10.",
    deliveryMode: "online",
    sessionLengthMin: 30,
    creditPrice: 10,
    active: true
  }
];

export const demoStories: TeacherStory[] = [
  {
    id: "story-1",
    teacherId: "teacher-1",
    title: "Moonlit rooftop flow",
    caption: "A storytelling series built around breath, music, and sunset city views.",
    mediaUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    sortOrder: 1,
    published: true
  },
  {
    id: "story-2",
    teacherId: "teacher-1",
    title: "Founder story",
    caption: "Video intro explaining Ashley's teaching philosophy and training journey.",
    mediaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    mediaType: "video",
    sortOrder: 2,
    published: true
  },
  {
    id: "story-3",
    teacherId: "teacher-2",
    title: "Community chair yoga",
    caption: "A gentle series from a weekly community center class.",
    mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    sortOrder: 1,
    published: true
  }
];

export const demoAvailability: AvailabilitySlot[] = [
  makeSlot("slot-1", "teacher-1", 1, 9),
  makeSlot("slot-2", "teacher-1", 2, 13),
  makeSlot("slot-3", "teacher-1", 4, 17),
  makeSlot("slot-4", "teacher-2", 1, 11),
  makeSlot("slot-5", "teacher-2", 3, 15),
  makeSlot("slot-6", "teacher-2", 5, 10)
];

export const demoBookings: Booking[] = [
  {
    id: "booking-1",
    customerId: "user-customer-1",
    teacherId: "teacher-1",
    offeringId: "offering-1",
    slotId: "slot-history-1",
    notes: "Focus on posture after long desk days.",
    status: "completed",
    paymentStatus: "paid",
    startsAt: addHours(addDays(today, -4), 10).toISOString(),
    endsAt: addHours(addDays(today, -4), 11).toISOString(),
    creditsSpent: 14
  }
];

export const demoWallets: CreditWallet[] = [
  { userId: "user-customer-1", balance: 48 }
];

export const demoTransactions: CreditTransaction[] = [
  {
    id: "txn-1",
    userId: "user-customer-1",
    amount: 50,
    type: "purchase",
    createdAt: addDays(today, -6).toISOString(),
    reference: "initial-top-up"
  },
  {
    id: "txn-2",
    userId: "user-customer-1",
    amount: -14,
    type: "spend",
    createdAt: addDays(today, -4).toISOString(),
    reference: "booking-1"
  }
];

export const demoEarnings: TeacherEarningsLedger[] = [
  {
    id: "earn-1",
    teacherId: "teacher-1",
    bookingId: "booking-1",
    grossCredits: 14,
    platformCommission: 3,
    netCredits: 11,
    payoutStatus: "paid",
    payoutBatchRef: "manual-payout-apr-week1"
  }
];

export const demoPayoutAccounts: TeacherPayoutAccount[] = [
  {
    teacherId: "teacher-1",
    provider: "stripe-connect",
    providerAccountId: "",
    onboardingComplete: false
  }
];

export const demoTeachingHours: TeachingHourCounter[] = [
  { teacherId: "teacher-1", category: "private", totalHours: 8 },
  { teacherId: "teacher-1", category: "older", totalHours: 5 },
  { teacherId: "teacher-1", category: "kids", totalHours: 1 },
  { teacherId: "teacher-2", category: "studio", totalHours: 18 },
  { teacherId: "teacher-2", category: "private", totalHours: 44 },
  { teacherId: "teacher-2", category: "corporate-events", totalHours: 8 },
  { teacherId: "teacher-2", category: "kids", totalHours: 84 },
  { teacherId: "teacher-2", category: "older", totalHours: 110 }
];

export const demoCommunityDiscussions: CommunityDiscussion[] = [
  {
    id: "discussion-1",
    authorName: "Ashley Tan",
    authorRole: "teacher",
    title: "What helps you stay consistent with your practice?",
    body:
      "I would love to hear how people keep a rhythm with movement and breath when life gets busy. Do short daily sessions help more than longer weekend practices?",
    tags: ["practice", "habits"],
    createdAt: addDays(today, -2).toISOString(),
    replyCount: 6
  },
  {
    id: "discussion-2",
    authorName: "Maya Student",
    authorRole: "member",
    title: "Favorite restorative props for home sessions",
    body:
      "I am building a cozy home setup and would love recommendations for bolsters, blocks, blankets, or other props that make restorative sessions feel more supportive.",
    tags: ["restorative", "home-practice"],
    createdAt: addDays(today, -1).toISOString(),
    replyCount: 4
  },
  {
    id: "discussion-3",
    authorName: "Jordan Admin",
    authorRole: "admin",
    title: "Welcome to the Thryve community forum",
    body:
      "Use this space to ask questions, swap wellness ideas, share resources, and connect with teachers and members across the platform.",
    tags: ["welcome", "community"],
    createdAt: today.toISOString(),
    replyCount: 2
  }
];
