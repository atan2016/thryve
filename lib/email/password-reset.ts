import { sendMail, type SendMailResult } from "@/lib/email/mailer";

type PasswordResetEmailInput = {
  email: string;
  name: string;
  resetUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<SendMailResult> {
  const subject = "Reset your Thryve password";
  const text = [
    `Hi ${input.name || "there"},`,
    "",
    "We received a request to reset the password on your Thryve account.",
    "",
    input.resetUrl,
    "",
    "This link expires in 24 hours. If you did not request a reset, you can ignore this email."
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #292524;">
      <p>Hi ${escapeHtml(input.name || "there")},</p>
      <p>We received a request to reset the password on your Thryve account.</p>
      <p>
        <a href="${input.resetUrl}" style="display: inline-block; padding: 12px 20px; border-radius: 9999px; background: #111827; color: #ffffff; text-decoration: none;">
          Reset password
        </a>
      </p>
      <p>If the button does not work, use this link:</p>
      <p><a href="${input.resetUrl}">${input.resetUrl}</a></p>
      <p>This link expires in 24 hours. If you did not request a reset, you can ignore this email.</p>
    </div>
  `;

  return await sendMail({
    to: input.email,
    subject,
    html,
    text
  });
}
