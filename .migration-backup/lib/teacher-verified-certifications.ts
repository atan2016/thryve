import type { TeacherCertificationSubmission } from "@/lib/types";

export type VerifiedCertificationChip = {
  key: string;
  label: string;
  imageUrl?: string;
};

function credentialImageHint(name: string): string | undefined {
  const n = name.toLowerCase();
  if (/\b(cpr|first aid|red cross|aed|bls|basic life support)\b/.test(n)) {
    return "/assets/images/red_cross_CPR.png";
  }
  if (/\b(e-?ryt\s*-?\s*200|200\s*-?\s*ryt|ryt\s*-?\s*200|200\s*hour|200\s*hr)\b/.test(n)) {
    return "/assets/images/200RYT_certification.jpeg";
  }
  if (/\b(e-?ryt\s*-?\s*500|ryt\s*-?\s*500|500\s*-?\s*hour|500\s*hr)\b/.test(n)) {
    return "/assets/images/200RYT_certification.jpeg";
  }
  if (/\byin\b/.test(n) && /\b(yoga|ytt|teacher)\b/.test(n)) {
    return "/assets/images/Yin_Yoga_Certification_badge.jpeg";
  }
  if (/\b(rcyt|children'?s?\s+yoga|kids\s+yoga)\b/.test(n)) {
    return "/assets/images/yoga_kids_certification.png";
  }
  if (/\bbackground\b/.test(n) && /\b(check|checked|cleared|screened|verified)\b/.test(n)) {
    return "/assets/images/background_checked.png";
  }
  return undefined;
}

/**
 * Approved (admin-verified) certification submissions for public profile chips.
 * Dedupes by credential name (case-insensitive), preferring the most recently reviewed/created row.
 */
export function listApprovedCertificationChips(
  submissions: TeacherCertificationSubmission[] | undefined
): VerifiedCertificationChip[] {
  if (!submissions?.length) {
    return [];
  }

  const approved = submissions.filter((s) => s.status === "approved");
  if (!approved.length) {
    return [];
  }

  const scored = approved.map((s) => {
    const reviewedMs = s.reviewedAt ? new Date(s.reviewedAt).getTime() : 0;
    const createdMs = new Date(s.createdAt).getTime();
    return { submission: s, sortKey: Math.max(reviewedMs, createdMs) };
  });

  scored.sort((a, b) => b.sortKey - a.sortKey);

  const byNorm = new Map<string, VerifiedCertificationChip>();
  for (const { submission } of scored) {
    const label = submission.credentialName.trim() || "Verified credential";
    const norm = label.toLowerCase();
    if (byNorm.has(norm)) {
      continue;
    }
    byNorm.set(norm, {
      key: submission.id,
      label,
      imageUrl: credentialImageHint(label)
    });
  }

  return Array.from(byNorm.values()).sort((a, b) => a.label.localeCompare(b.label));
}
