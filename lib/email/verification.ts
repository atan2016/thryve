import { sendMail } from "@/lib/email/mailer";

type VerificationEmailInput = {
  email: string;
  name: string;
  verificationUrl: string;
  cc?: string;
};

type EmailChangeVerificationInput = {
  email: string;
  name: string;
  verificationUrl: string;
};

export async function sendVerificationEmail(input: VerificationEmailInput) {
  const subject = "Verify your Thryve email";
  const text = [
    `Hi ${input.name || "there"},`,
    "",
    "Please verify your email to finish setting up your Thryve account.",
    "",
    input.verificationUrl,
    "",
    "If you did not request this email, you can ignore it."
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #292524;">
      <p>Hi ${escapeHtml(input.name || "there")},</p>
      <p>Please verify your email to finish setting up your Thryve account.</p>
      <p>
        <a href="${input.verificationUrl}" style="display: inline-block; padding: 12px 20px; border-radius: 9999px; background: #111827; color: #ffffff; text-decoration: none;">
          Verify email
        </a>
      </p>
      <p>If the button does not work, use this link:</p>
      <p><a href="${input.verificationUrl}">${input.verificationUrl}</a></p>
      <p>If you did not request this email, you can ignore it.</p>
    </div>
  `;

  return sendMail({
    to: input.email,
    cc: input.cc,
    subject,
    html,
    text
  });
}

export async function sendEmailChangeVerificationEmail(input: EmailChangeVerificationInput) {
  const subject = "Confirm your updated Thryve email";
  const text = [
    `Hi ${input.name || "there"},`,
    "",
    "An admin requested to update the email address on your Thryve account.",
    "Please confirm this new email address to finish the change.",
    "",
    input.verificationUrl,
    "",
    "If you did not expect this change, you can ignore this email and your current address will stay the same."
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #292524;">
      <p>Hi ${escapeHtml(input.name || "there")},</p>
      <p>An admin requested to update the email address on your Thryve account.</p>
      <p>Please confirm this new email address to finish the change.</p>
      <p>
        <a href="${input.verificationUrl}" style="display: inline-block; padding: 12px 20px; border-radius: 9999px; background: #111827; color: #ffffff; text-decoration: none;">
          Confirm new email
        </a>
      </p>
      <p>If the button does not work, use this link:</p>
      <p><a href="${input.verificationUrl}">${input.verificationUrl}</a></p>
      <p>If you did not expect this change, you can ignore this email and your current address will stay the same.</p>
    </div>
  `;

  return sendMail({
    to: input.email,
    subject,
    html,
    text
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
