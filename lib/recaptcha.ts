const DEV_RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
const DEV_RECAPTCHA_SECRET_KEY = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";

export function getRecaptchaSiteKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? (process.env.NODE_ENV !== "production" ? DEV_RECAPTCHA_SITE_KEY : undefined);
}

function getRecaptchaSecretKey() {
  return process.env.RECAPTCHA_SECRET_KEY ?? (process.env.NODE_ENV !== "production" ? DEV_RECAPTCHA_SECRET_KEY : undefined);
}

export async function verifyRecaptchaToken(token: string) {
  const secret = getRecaptchaSecretKey();

  if (!secret) {
    return {
      success: false,
      reason: "missing_secret" as const
    };
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      secret,
      response: token
    })
  });

  const payload = (await response.json()) as {
    success?: boolean;
  };

  return {
    success: Boolean(payload.success),
    reason: payload.success ? ("ok" as const) : ("invalid_token" as const)
  };
}
