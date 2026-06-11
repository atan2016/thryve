/**
 * Resend signup verification email for a pending account.
 *
 * Usage (from repo root):
 *   npx tsx scripts/resend-verification-email.ts <to-email> [cc-email] [https://public-site-origin]
 *
 * Loads .env then .env.local (override) like Next/Prisma scripts.
 */
import { existsSync } from "fs";
import path from "path";
import { config } from "dotenv";

import { resendPendingSignupVerificationEmail } from "../lib/auth/sign-up-verification";

const root = path.join(__dirname, "..");
if (existsSync(path.join(root, ".env"))) {
  config({ path: path.join(root, ".env") });
}
if (existsSync(path.join(root, ".env.local"))) {
  config({ path: path.join(root, ".env.local"), override: true });
}

function requirePublicBaseUrlForVerificationLinks() {
  const raw = process.env.APP_BASE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) {
    console.error(
      "Set APP_BASE_URL or NEXT_PUBLIC_APP_URL to your live HTTPS origin before running this script (verification links are built from it)."
    );
    process.exit(1);
  }
  try {
    const u = new URL(raw);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "[::1]") {
      console.error("Refusing to send: base URL still points at localhost. Set APP_BASE_URL to your production domain.");
      process.exit(1);
    }
  } catch {
    console.error("APP_BASE_URL / NEXT_PUBLIC_APP_URL must be a valid absolute URL.");
    process.exit(1);
  }
}

async function main() {
  const to = process.argv[2]?.trim();
  let cc = process.argv[3]?.trim();
  const baseArg = process.argv[4]?.trim();

  if (baseArg) {
    process.env.APP_BASE_URL = baseArg;
  }

  if (!to) {
    console.error(
      "Usage: npx tsx scripts/resend-verification-email.ts <to-email> [cc-email] [https://your-public-site]\n" +
        "  The public site URL can be passed as the 3rd argument if APP_BASE_URL is not in .env."
    );
    process.exit(1);
  }

  requirePublicBaseUrlForVerificationLinks();
  const result = await resendPendingSignupVerificationEmail({ email: to, cc: cc || undefined });

  if (!result.ok) {
    console.error("No PENDING signup found for that email (user may already be verified or never started signup).");
    process.exit(1);
  }

  console.log(
    result.delivered
      ? `Sent verification email (messageId: ${result.messageId ?? "n/a"})`
      : "SMTP not configured in this environment — printed dev fallback only; check [mail:dev-fallback] logs."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
