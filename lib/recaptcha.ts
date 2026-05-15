import {
  RECAPTCHA_ACTION_CONTACT_ADMIN,
  RECAPTCHA_ACTION_CONTACT_TEACHER
} from "@/lib/recaptcha-constants";

export { RECAPTCHA_ACTION_CONTACT_ADMIN, RECAPTCHA_ACTION_CONTACT_TEACHER };

const DEFAULT_MIN_SCORE = 0.5;

function getMinScore(): number {
  const raw = process.env.RECAPTCHA_MIN_SCORE;
  if (raw == null || raw === "") {
    return DEFAULT_MIN_SCORE;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : DEFAULT_MIN_SCORE;
}

/**
 * reCAPTCHA **v3** site key. Must match a v3 registration in Google Admin (not v2 checkbox keys).
 */
export function getRecaptchaSiteKey() {
  const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();
  return key || undefined;
}

function getRecaptchaSecretKey() {
  const key = process.env.RECAPTCHA_SECRET_KEY?.trim();
  return key || undefined;
}

export type VerifyRecaptchaOptions = {
  expectedAction?: string;
};

export type VerifyRecaptchaFailureReason = "missing_secret" | "invalid_token" | "low_score";

export async function verifyRecaptchaToken(token: string, options?: VerifyRecaptchaOptions) {
  const secret = getRecaptchaSecretKey();

  if (!secret) {
    return {
      success: false,
      reason: "missing_secret" as const
    };
  }

  const trimmed = token.trim();
  if (!trimmed) {
    return { success: false, reason: "invalid_token" as const };
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      secret,
      response: trimmed
    })
  });

  const payload = (await response.json()) as {
    success?: boolean;
    score?: number;
    action?: string;
    challenge_ts?: string;
    hostname?: string;
    "error-codes"?: string[];
  };

  if (!payload.success) {
    return {
      success: false,
      reason: "invalid_token" as const
    };
  }

  const expectedAction = options?.expectedAction?.trim();
  if (expectedAction && payload.action && payload.action !== expectedAction) {
    return {
      success: false,
      reason: "invalid_token" as const
    };
  }

  const score = typeof payload.score === "number" ? payload.score : 0;
  const minScore = getMinScore();
  if (score < minScore) {
    return {
      success: false,
      reason: "low_score" as const
    };
  }

  return {
    success: true,
    reason: "ok" as const
  };
}
