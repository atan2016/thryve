"use client";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

/**
 * Loads reCAPTCHA v3 (invisible). Safe to call multiple times.
 * @see https://developers.google.com/recaptcha/docs/v3
 */
export function loadRecaptchaV3Script(siteKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("reCAPTCHA v3 can only run in the browser."));
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      window.grecaptcha?.ready(() => resolve());
    };

    const existing = document.querySelector<HTMLScriptElement>('script[src^="https://www.google.com/recaptcha/api.js"]');
    if (existing) {
      if (window.grecaptcha?.execute) {
        finish();
        return;
      }
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("reCAPTCHA script failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error("reCAPTCHA script failed to load."));
    document.head.appendChild(script);
  });
}

export async function executeRecaptchaV3(siteKey: string, action: string): Promise<string> {
  await loadRecaptchaV3Script(siteKey);
  const client = window.grecaptcha;
  if (!client?.execute) {
    throw new Error("reCAPTCHA is not ready.");
  }
  return client.execute(siteKey, { action });
}
