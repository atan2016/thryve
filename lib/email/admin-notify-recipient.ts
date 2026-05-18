/** Default inbox for admin-facing alerts (contact form, certification submissions). */
export const DEFAULT_ADMIN_NOTIFY_EMAIL = "ashleyt@gmail.com";

/**
 * Recipient for site → admin notification emails.
 * Override with `ADMIN_NOTIFY_EMAIL`, `CERTIFICATION_NOTIFY_EMAIL`, or `CONTACT_NOTIFY_EMAIL`.
 */
export function getAdminNotifyRecipient(): string {
  const raw =
    process.env.ADMIN_NOTIFY_EMAIL?.trim() ||
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    process.env.CERTIFICATION_NOTIFY_EMAIL?.trim();
  return raw || DEFAULT_ADMIN_NOTIFY_EMAIL;
}
