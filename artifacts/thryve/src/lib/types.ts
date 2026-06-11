export type Role = "customer" | "teacher" | "admin";
export type DeliveryMode = "online" | "in_person";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PayoutStatus = "pending" | "scheduled" | "paid" | "failed";
export type ServiceCategory = "studio" | "private" | "corporate-events" | "kids" | "older";

export type AppUser = {
  id: string;
  email: string;
  role: Role;
  name: string;
  emailVerifiedAt?: string;
};

export type Teacher = {
  id: string;
  userId?: string;
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
  styles?: string[];
};

export type TeacherUpcomingEvent = {
  id: string;
  teacherId: string;
  hostId?: string;
  title: string;
  eventType: string;
  hostName: string;
  eventUrl?: string;
  eventDate?: string;
  imageSrc?: string;
};

export type TeacherCalendarSession = {
  id: string;
  teacherId: string;
  startsAt: string;
  endsAt: string;
  title: string;
  description?: string;
};

export type TeacherCertificationSubmission = {
  id: string;
  teacherId: string;
  credentialName: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  status: "pending" | "approved" | "rejected";
  reviewedAt?: string;
  createdAt: string;
};

export type TeacherOffering = {
  id: string;
  teacherId: string;
  category: ServiceCategory;
  title: string;
  description?: string;
  deliveryMode: DeliveryMode;
  sessionLengthMin: number;
  creditPrice: number;
  active: boolean;
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
};

export type HomepageEventCard = {
  id: string;
  title: string;
  host: string;
  hostId?: string;
  category: string;
  imageSrc: string;
  imageAlt: string;
  dateRange: string;
  detail: string;
  location: string;
  href: string;
  external?: boolean;
  featuredLabel?: string;
  attendees?: number;
  isFollowedHost?: boolean;
};

export type HomepageJobCard = {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  pay: string;
  posted: string;
  applyUrl?: string;
  contactName?: string;
  contactRole?: string;
};

export type LinkedInJob = {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string;
  location: string;
  type: string;
  level: string;
  postedAgo: string;
  applicants?: string;
  linkedinJobId: string;
  description: string;
  skills: string[];
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
