function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

function isBlockedLocalOrigin(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "[::1]";
  } catch {
    return false;
  }
}

/**
 * Canonical public origin for server-built absolute URLs (verification emails, Stripe return URLs, etc.).
 *
 * Priority:
 * 1. `APP_BASE_URL` — preferred in production (exact canonical URL).
 * 2. `NEXT_PUBLIC_APP_URL` — must match the live site when used for emails.
 * 3. `VERCEL_URL` — set automatically on Vercel deployments (HTTPS assumed).
 * 4. `http://localhost:3000` — development only (`NODE_ENV !== "production"`).
 */
export function getAppBaseUrl(): string {
  let explicit = process.env.APP_BASE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit && process.env.NODE_ENV === "production" && isBlockedLocalOrigin(explicit)) {
    console.warn(
      "[getAppBaseUrl] APP_BASE_URL / NEXT_PUBLIC_APP_URL points at localhost in production; ignoring so a public origin can be used (e.g. VERCEL_URL)."
    );
    explicit = undefined;
  }
  if (explicit) {
    return stripTrailingSlashes(explicit);
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "");
    return stripTrailingSlashes(`https://${host}`);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "APP_BASE_URL or NEXT_PUBLIC_APP_URL must be set to your public HTTPS URL in production so verification emails and redirects work. On Vercel, VERCEL_URL is usually available automatically; otherwise set APP_BASE_URL (e.g. https://app.example.com)."
    );
  }

  return stripTrailingSlashes("http://localhost:3000");
}
