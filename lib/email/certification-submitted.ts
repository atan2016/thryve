import { getAppBaseUrl } from "@/lib/app-base-url";
import { sendMail } from "@/lib/email/mailer";

const DEFAULT_NOTIFY_EMAIL = "ashleyt@gmail.com";

function getCertificationNotifyRecipient(): string {
  const raw = process.env.CERTIFICATION_NOTIFY_EMAIL?.trim();
  return raw || DEFAULT_NOTIFY_EMAIL;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendCertificationSubmittedNotificationEmail(input: {
  teacherName: string;
  teacherSlug: string;
  credentialName: string;
  submissionId: string;
  notes?: string;
}): Promise<void> {
  const to = getCertificationNotifyRecipient();
  const base = getAppBaseUrl();
  const adminTeachersUrl = `${base}/admin/teachers`;
  const publicProfileUrl = `${base}/teachers/${encodeURIComponent(input.teacherSlug)}`;

  const credential = input.credentialName.trim() || "(no credential name provided)";
  const notesLine = input.notes?.trim() ? `Notes: ${input.notes.trim()}` : "";

  const text = [
    `A teacher submitted a certification file for review.`,
    "",
    `Teacher: ${input.teacherName}`,
    `Submission ID: ${input.submissionId}`,
    `Credential name: ${credential}`,
    notesLine,
    "",
    `Review in admin: ${adminTeachersUrl}`,
    `Public profile: ${publicProfileUrl}`
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #292524;">
      <p>A teacher submitted a certification file for review.</p>
      <ul style="margin: 0; padding-left: 1.25rem;">
        <li><strong>Teacher:</strong> ${escapeHtml(input.teacherName)}</li>
        <li><strong>Submission ID:</strong> ${escapeHtml(input.submissionId)}</li>
        <li><strong>Credential:</strong> ${escapeHtml(credential)}</li>
        ${input.notes?.trim() ? `<li><strong>Notes:</strong> ${escapeHtml(input.notes.trim())}</li>` : ""}
      </ul>
      <p style="margin-top: 1rem;">
        <a href="${escapeHtml(adminTeachersUrl)}" style="display: inline-block; padding: 10px 18px; border-radius: 9999px; background: #111827; color: #ffffff; text-decoration: none;">
          Open admin · Teachers
        </a>
      </p>
      <p style="font-size: 13px; color: #78716c;">
        <a href="${escapeHtml(publicProfileUrl)}">View public profile</a>
      </p>
    </div>
  `;

  await sendMail({
    to,
    subject: `New certification submission · ${input.teacherName}`,
    html,
    text
  });
}
