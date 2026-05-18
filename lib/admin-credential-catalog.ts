/** Canonical labels admins can bulk-grant (must match `credentialImageHint` patterns where images exist). */
export const ADMIN_GRANTABLE_CREDENTIALS = [
  { id: "200-ryt", label: "200 RYT" },
  { id: "yin-yoga", label: "Yin Yoga" },
  { id: "red-cross-cpr", label: "Red Cross CPR" },
  { id: "kids-yoga", label: "Kids Yoga" },
  { id: "background-checked", label: "Background Checked" },
  { id: "ryt-500", label: "RYT-500" },
  { id: "corporate-wellness", label: "Corporate Wellness" }
] as const;

export type AdminGrantableCredentialId = (typeof ADMIN_GRANTABLE_CREDENTIALS)[number]["id"];

const labelByNorm = new Map(
  ADMIN_GRANTABLE_CREDENTIALS.map((entry) => [entry.label.trim().toLowerCase(), entry.label])
);

/** Resolve user/catalog input to the canonical display label, or undefined if not grantable. */
export function normalizeAdminGrantableCredentialLabel(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }
  const byNorm = labelByNorm.get(trimmed.toLowerCase());
  if (byNorm) {
    return byNorm;
  }
  const byId = ADMIN_GRANTABLE_CREDENTIALS.find((entry) => entry.id === trimmed)?.label;
  return byId;
}

export function normalizeAdminGrantableCredentialLabels(rawLabels: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of rawLabels) {
    const label = normalizeAdminGrantableCredentialLabel(raw);
    if (!label) {
      continue;
    }
    const norm = label.toLowerCase();
    if (seen.has(norm)) {
      continue;
    }
    seen.add(norm);
    out.push(label);
  }
  return out;
}
