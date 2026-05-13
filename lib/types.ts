export type Role = "customer" | "teacher" | "admin";
export type DeliveryMode = "online" | "in_person";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PayoutStatus = "pending" | "scheduled" | "paid" | "failed";
export type TeacherProfileImportStatus = "not_started" | "sources_saved" | "completed" | "failed" | "skipped";
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
  emailVerifiedAt?: string;
};

export type AdminManagedUser = AppUser & {
  linkedTeacherId?: string;
  linkedTeacherName?: string;
  linkedTeacherSlug?: string;
  pendingEmailChangeTo?: string;
  pendingEmailChangeRequestedAt?: string;
};

export type AdminUserUpdateResult = {
  user: AdminManagedUser;
  emailChangeRequested: boolean;
};

export type AdminContentFilters = {
  hiddenEventKeywords: string[];
  hiddenJobKeywords: string[];
};

export type Teacher = {
  id: string;
  userId?: string;
  claimEmail?: string;
  slug: string;
  fullName: string;
  avatarUrl?: string;
  showPublicCalendar?: boolean;
  studioName?: string;
  studioWebsiteUrl?: string;
  studioScheduleUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  resumeMimeType?: string;
  profileImportConsent?: boolean;
  profileImportRequestedAt?: string;
  profileImportCompletedAt?: string;
  profileImportStatus?: TeacherProfileImportStatus;
  profileImportNotes?: string;
  platformHoursBooked?: number;
  city: string;
  serviceRadiusMiles: number;
  training: string;
  experienceYears: number;
  bio: string;
  gender: "female" | "male" | "other";
  certificationStatus: "certified" | "not_certified";
  published: boolean;
  upcomingEvents?: TeacherUpcomingEvent[];
  calendarSessions?: TeacherCalendarSession[];
  certificationSubmissions?: TeacherCertificationSubmission[];
};

export type EventHost = {
  id: string;
  name: string;
  slug: string;
  websiteUrl?: string;
  imageUrl?: string;
};

export type UserTeacherFollow = {
  id: string;
  userId: string;
  teacherId: string;
  createdAt: string;
};

export type UserTeacherHeart = {
  id: string;
  userId: string;
  teacherId: string;
  createdAt: string;
};

export type UserEventHostFollow = {
  id: string;
  userId: string;
  hostId: string;
  createdAt: string;
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

export type TeacherUpcomingEvent = {
  id: string;
  teacherId: string;
  hostId?: string;
  title: string;
  /** Listing category (matches homepage event chips). */
  eventType: string;
  hostName?: string;
  address?: string;
  eventTime?: string;
  /** Resolved display URL: legacy path/HTTPS, or `/api/teacher-upcoming-events/[id]/image` when stored in DB. */
  imageUrl?: string;
  eventUrl?: string;
  eventDate?: string;
};

export type HomepageEventCard = {
  id: string;
  teacherId?: string;
  teacherSlug?: string;
  hostId?: string;
  sortDate?: string;
  /** When the listing was added (DB `createdAt`); used for “new this month” ordering. */
  listedAt?: string;
  title: string;
  dateRange: string;
  host: string;
  location: string;
  detail: string;
  href: string;
  external?: boolean;
  imageSrc: string;
  imageAlt: string;
  category: string;
  attendees?: number;
  featuredLabel?: string;
  isFollowedHost?: boolean;
  isFollowedTeacher?: boolean;
};

export type HomepageJobCard = {
  id: string;
  title: string;
  category: string;
  pay: string;
  company: string;
  location: string;
  posted: string;
};

export type TeacherCalendarSession = {
  id: string;
  teacherId: string;
  offeringId: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  sourceUrl?: string;
  isBooked: boolean;
};

export type TeacherCertificationSubmission = {
  id: string;
  teacherId: string;
  credentialName: string;
  notes?: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
};

export type AvailabilitySlot = {
  id: string;
  teacherId: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isBooked: boolean;
};

export type PendingSignupStatus = "pending" | "verified" | "consumed" | "expired" | "cancelled";

export type PendingSignup = {
  id: string;
  email: string;
  normalizedEmail: string;
  name: string;
  passwordHash: string;
  role: Role;
  nextPath?: string;
  teacherWebsiteUrl?: string;
  teacherLinkedinUrl?: string;
  teacherInstagramUrl?: string;
  teacherFacebookUrl?: string;
  teacherProfileImportConsent: boolean;
  teacherResumeUrl?: string;
  teacherResumeFileName?: string;
  teacherResumeMimeType?: string;
  teacherResumeText?: string;
  selectedProfileKind?: "user" | "teacher";
  selectedProfileId?: string;
  status: PendingSignupStatus;
  verifiedAt?: string;
  consumedAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ClaimableProfileOption = {
  id: string;
  kind: "user" | "teacher";
  title: string;
  subtitle: string;
  email: string;
  selectable: boolean;
  reason?: string;
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

export type CommunityDiscussion = {
  id: string;
  authorName: string;
  authorRole: "member" | "teacher" | "admin";
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  replyCount: number;
};

export type AdminContactInquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};
