import nodemailer from "nodemailer";

type MailOptions = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendMailResult =
  | { delivered: false }
  | { delivered: true; messageId?: string };

function extractEmailAddress(from: string) {
  const angle = from.match(/<([^>]+)>/);
  const raw = (angle?.[1] ?? from).trim().toLowerCase();
  return raw || undefined;
}

function domainOf(email: string) {
  const at = email.lastIndexOf("@");
  return at > 0 ? email.slice(at + 1) : undefined;
}

function buildFromHeader(fromEnv: string) {
  const trimmed = fromEnv.trim();
  const bareEmail = extractEmailAddress(trimmed) ?? trimmed;
  const displayName = getEnvValue("SMTP_FROM_NAME")?.trim();
  if (displayName) {
    const safeName = displayName.replace(/["\\]/g, "").trim();
    return safeName ? `"${safeName}" <${bareEmail}>` : trimmed;
  }
  return trimmed.includes("<") && trimmed.includes(">") ? trimmed : bareEmail;
}

function warnIfFromMisaligned(smtpUser: string, fromHeader: string) {
  const authEmail = smtpUser.trim().toLowerCase();
  const fromEmail = extractEmailAddress(fromHeader);
  if (!fromEmail || !authEmail) return;
  const authDomain = domainOf(authEmail);
  const fromDomain = domainOf(fromEmail);
  if (!authDomain || !fromDomain || authDomain === fromDomain) return;
  console.warn(
    "[mail] SMTP_FROM_EMAIL is on a different domain than SMTP_USER. Recipients such as Yahoo often silently drop or delay these messages. Use the same address as SMTP_USER, a verified Gmail alias, or a transactional provider with DKIM for your domain."
  );
}

let cachedLocalEnv: Record<string, string> | null = null;

function getEnvValue(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  const localEnv = getLocalEnv();
  for (const key of keys) {
    const value = localEnv[key]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

function getLocalEnv() {
  if (cachedLocalEnv) {
    return cachedLocalEnv;
  }

  if (process.env.NODE_ENV === "production") {
    cachedLocalEnv = {};
    return cachedLocalEnv;
  }

  const { existsSync, readFileSync } = require("fs") as typeof import("fs");
  const path = require("path") as typeof import("path");
  const candidates = [
    path.join(/* turbopackIgnore: true */ process.cwd(), ".env.local"),
    path.join(/* turbopackIgnore: true */ process.cwd(), ".env")
  ];
  const values: Record<string, string> = {};

  for (const filePath of candidates) {
    if (!existsSync(filePath)) {
      continue;
    }

    const content = readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, equalsIndex).trim();
      let value = trimmed.slice(equalsIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      values[key] = value;
    }
  }

  cachedLocalEnv = values;
  return values;
}

function getMailerConfig() {
  const host = getEnvValue("SMTP_HOST");
  const port = Number(getEnvValue("SMTP_PORT") ?? 587);
  const user = getEnvValue("SMTP_USER");
  const password = getEnvValue("SMTP_PASSWORD", "SMTP_PASS");
  const from = getEnvValue("SMTP_FROM_EMAIL", "SMTP_FROM");

  if (!host || !user || !password || !from) {
    return null;
  }

  const fromHeader = buildFromHeader(from);

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password
    },
    from: fromHeader
  };
}

export async function sendMail(options: MailOptions): Promise<SendMailResult> {
  const config = getMailerConfig();

  if (!config) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[mail:dev-fallback]", JSON.stringify(options, null, 2));
      return { delivered: false as const };
    }

    throw new Error("SMTP is not configured.");
  }

  warnIfFromMisaligned(config.auth.user, config.from);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  });

  const replyTo = getEnvValue("SMTP_REPLY_TO")?.trim();

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: options.to,
      replyTo: replyTo || undefined,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
    return { delivered: true as const, messageId: info.messageId };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[mail:dev-error]", error);
      console.log("[mail:dev-fallback]", JSON.stringify(options, null, 2));
      return { delivered: false as const };
    }

    throw error;
  }
}
