import { serviceCategoryLabels } from "@/lib/mock-data";

export const schemaNotes = {
  users: "Shared auth identity for customers, teachers, and admins.",
  teachers: "Public teacher profile records with marketing and discovery fields.",
  teacherOfferings: "Bookable offerings with category, delivery mode, session length, and credit price.",
  availabilitySlots: "Live calendar slots used for search filtering and booking.",
  bookings: "Confirmed sessions with credits spent and payment status.",
  creditWallets: "Customer balances backed by immutable transactions.",
  teacherEarningsLedger: "Per-booking gross, commission, net earnings, and payout status.",
  teacherPayoutAccounts: "Future payout-provider onboarding details for automated payouts."
} as const;

export const roles = ["customer", "teacher", "admin"] as const;
export const deliveryModes = ["online", "in_person"] as const;
export const bookingStatuses = ["pending", "confirmed", "completed", "cancelled"] as const;
export const payoutStatuses = ["pending", "scheduled", "paid", "failed"] as const;
export const serviceCategoryValues = ["studio", "private", "corporate-events", "kids", "older"] as const;
export const serviceCategoryOptions = Object.entries(serviceCategoryLabels).map(([value, label]) => ({
  value,
  label
}));

export type Role = (typeof roles)[number];
export type DeliveryMode = (typeof deliveryModes)[number];
export type BookingStatus = (typeof bookingStatuses)[number];
export type PayoutStatus = (typeof payoutStatuses)[number];
export type ServiceCategory = (typeof serviceCategoryValues)[number];
