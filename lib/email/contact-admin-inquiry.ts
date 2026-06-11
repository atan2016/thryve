import { getAdminNotifyRecipient } from "@/lib/email/admin-notify-recipient";
import { sendMail } from "@/lib/email/mailer";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactAdminInquiryEmail(input: {
  name: string;
  email: string;
  message: string;
  inquiryId: string;
}) {
  const to = getAdminNotifyRecipient();
  const name = input.name.trim() || "(no name provided)";
  const email = input.email.trim().toLowerCase() || "(no email provided)";
  const message = input.message.trim() || "(no message provided)";

  const text = [
    "New message from the Thryve Contact us form.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Inquiry ID: ${input.inquiryId}`,
    "",
    "Message:",
    message
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #292524;">
      <p>New message from the <strong>Thryve Contact us</strong> form.</p>
      <ul style="margin: 0; padding-left: 1.25rem;">
        <li><strong>Name:</strong> ${escapeHtml(name)}</li>
        <li><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></li>
        <li><strong>Inquiry ID:</strong> ${escapeHtml(input.inquiryId)}</li>
      </ul>
      <p style="margin-top: 1rem;"><strong>Message</strong></p>
      <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</p>
    </div>
  `;

  const replyTo = input.email.trim();

  return sendMail({
    to,
    replyTo: replyTo || undefined,
    subject: `Thryve contact · ${name}`,
    html,
    text
  });
}
