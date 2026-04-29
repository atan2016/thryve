export type Role = "customer" | "teacher" | "admin";
export type DeliveryMode = "online" | "in_person";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PayoutStatus = "pending" | "scheduled" | "paid" | "failed";
export type ServiceCategory =
  | "studio"
  | "private"
  | "corporate-events"
  | "kids"
  | "older";

export type AppUser = {
  id: string;
  email: string;
  password: string;
  role: Role;
  name: string;
};

export type Teacher = {
  id: string;
  userId: string;
  slug: string;
  fullName: string;
  avatarUrl?: string;
  platformHoursBooked?: number;
  city: string;
  serviceRadiusMiles: number;
  training: string;
  experienceYears: number;
  bio: string;
  gender: "female" | "male" | "other";
  certificationStatus: "certified" | "not_certified";
  published: boolean;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
};

export type TeacherBadge = {
  teacherId: string;
  badgeId: string;
  verified: boolean;
  proofUrl?: string;
};

export type YogaStyle = {
  id: string;
  name: string;
};

export type TeacherStyle = {
  teacherId: string;
  styleId: string;
};

export type TeacherOffering = {
  id: string;
  teacherId: string;
  category: ServiceCategory;
  title: string;
  description: string;
  deliveryMode: DeliveryMode;
  sessionLengthMin: number;
  creditPrice: number;
  active: boolean;
};

export type TeacherStory = {
  id: string;
  teacherId: string;
  title: string;
  caption: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  sortOrder: number;
  published: boolean;
};

export type AvailabilitySlot = {
  id: string;
  teacherId: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isBooked: boolean;
};

export type Booking = {
  id: string;
  customerId: string;
  teacherId: string;
  offeringId: string;
  slotId: string;
  notes?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  startsAt: string;
  endsAt: string;
  creditsSpent: number;
};

export type CreditWallet = {
  userId: string;
  balance: number;
};

export type CreditTransaction = {
  id: string;
  userId: string;
  amount: number;
  type: "purchase" | "spend" | "refund" | "adjustment";
  reference?: string;
  createdAt: string;
};

export type TeacherEarningsLedger = {
  id: string;
  teacherId: string;
  bookingId: string;
  grossCredits: number;
  platformCommission: number;
  netCredits: number;
  payoutStatus: PayoutStatus;
  payoutBatchRef?: string;
};

export type TeacherPayoutAccount = {
  teacherId: string;
  provider?: string;
  providerAccountId?: string;
  onboardingComplete: boolean;
};

export type TeachingHourCounter = {
  teacherId: string;
  category: ServiceCategory;
  totalHours: number;
};

export type SearchFilters = {
  category?: ServiceCategory;
  style?: string;
  length?: number;
  certified?: "certified" | "not_certified";
  gender?: "female" | "male";
  deliveryMode?: DeliveryMode;
  date?: string;
  city?: string;
};
