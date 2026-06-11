export type AdminCredentialCategory =
  | "yoga"
  | "pilates"
  | "fitness"
  | "movement"
  | "mindfulness"
  | "coaching"
  | "massage"
  | "safety"
  | "energetic";

export type AdminGrantableCredential = {
  id: string;
  label: string;
  category: AdminCredentialCategory;
};

/** Canonical labels admins can bulk-grant (must match `credentialImageHint` patterns where images exist). */
export const ADMIN_GRANTABLE_CREDENTIALS = [
  // Yoga Alliance & yoga modalities
  { id: "e-ryt-200", label: "E-RYT 200", category: "yoga" },
  { id: "e-ryt-500", label: "E-RYT 500", category: "yoga" },
  { id: "200-ryt", label: "200 RYT", category: "yoga" },
  { id: "ryt-500", label: "RYT-500", category: "yoga" },
  { id: "rcyt", label: "RCYT (Children's Yoga)", category: "yoga" },
  { id: "rpyt", label: "RPYT (Prenatal Yoga)", category: "yoga" },
  { id: "yacep", label: "YACEP (Continuing Education Provider)", category: "yoga" },
  { id: "yin-yoga", label: "Yin Yoga", category: "yoga" },
  { id: "restorative-yoga", label: "Restorative Yoga", category: "yoga" },
  { id: "chair-yoga", label: "Chair Yoga", category: "yoga" },
  { id: "trauma-informed-yoga", label: "Trauma-Informed Yoga", category: "yoga" },
  { id: "adaptive-yoga", label: "Adaptive Yoga", category: "yoga" },
  { id: "yoga-therapy", label: "Yoga Therapy", category: "yoga" },
  { id: "aerial-yoga", label: "Aerial Yoga", category: "yoga" },
  { id: "sup-yoga", label: "SUP Yoga", category: "yoga" },
  { id: "kids-yoga", label: "Kids Yoga", category: "yoga" },
  { id: "senior-yoga", label: "Senior Yoga", category: "yoga" },
  { id: "corporate-yoga", label: "Corporate Yoga", category: "yoga" },
  { id: "corporate-wellness", label: "Corporate Wellness", category: "yoga" },
  // Pilates
  { id: "comprehensive-pilates", label: "Comprehensive Pilates Certification", category: "pilates" },
  { id: "mat-pilates", label: "Mat Pilates", category: "pilates" },
  { id: "reformer-pilates", label: "Reformer Pilates", category: "pilates" },
  { id: "classical-pilates", label: "Classical Pilates", category: "pilates" },
  { id: "contemporary-pilates", label: "Contemporary Pilates", category: "pilates" },
  { id: "stott-pilates", label: "STOTT Pilates", category: "pilates" },
  { id: "basi-pilates", label: "BASI Pilates", category: "pilates" },
  { id: "balanced-body", label: "Balanced Body", category: "pilates" },
  // Personal training & fitness
  { id: "nasm-cpt", label: "NASM CPT", category: "fitness" },
  { id: "ace-cpt", label: "ACE CPT", category: "fitness" },
  { id: "issa-cpt", label: "ISSA CPT", category: "fitness" },
  { id: "acsm-cpt", label: "ACSM CPT", category: "fitness" },
  { id: "nsca-cpt-cscs", label: "NSCA CPT / CSCS", category: "fitness" },
  { id: "gfi", label: "Group Fitness Instructor (GFI)", category: "fitness" },
  { id: "functional-movement-specialist", label: "Functional Movement Specialist", category: "fitness" },
  { id: "corrective-exercise-specialist", label: "Corrective Exercise Specialist", category: "fitness" },
  { id: "mobility-specialist", label: "Mobility Specialist", category: "fitness" },
  { id: "strength-conditioning-coach", label: "Strength & Conditioning Coach", category: "fitness" },
  // Movement & somatic
  { id: "barre", label: "Barre Certification", category: "movement" },
  { id: "zumba", label: "Zumba Instructor", category: "movement" },
  { id: "dance-fitness", label: "Dance Fitness", category: "movement" },
  { id: "nia", label: "Nia", category: "movement" },
  { id: "gyrotonic", label: "Gyrotonic", category: "movement" },
  { id: "feldenkrais", label: "Feldenkrais Practitioner", category: "movement" },
  { id: "alexander-technique", label: "Alexander Technique", category: "movement" },
  { id: "somatic-experiencing", label: "Somatic Experiencing", category: "movement" },
  // Mindfulness & breath
  { id: "meditation-teacher", label: "Meditation Teacher Certification", category: "mindfulness" },
  { id: "mindfulness-teacher", label: "Mindfulness Teacher Certification", category: "mindfulness" },
  { id: "mbsr", label: "MBSR (Mindfulness-Based Stress Reduction)", category: "mindfulness" },
  { id: "breathwork-facilitator", label: "Breathwork Facilitator", category: "mindfulness" },
  { id: "pranayama", label: "Pranayama Certification", category: "mindfulness" },
  { id: "sound-healing", label: "Sound Healing Certification", category: "mindfulness" },
  // Coaching
  { id: "health-coach", label: "Health Coach", category: "coaching" },
  { id: "wellness-coach", label: "Wellness Coach", category: "coaching" },
  { id: "life-coach", label: "Life Coach", category: "coaching" },
  { id: "executive-wellness-coach", label: "Executive Wellness Coach", category: "coaching" },
  { id: "mindset-coach", label: "Mindset Coach", category: "coaching" },
  { id: "habit-coach", label: "Habit Coach", category: "coaching" },
  // Massage & bodywork
  { id: "lmt", label: "Licensed Massage Therapist (LMT)", category: "massage" },
  { id: "cmt", label: "Certified Massage Therapist (CMT)", category: "massage" },
  { id: "sports-massage", label: "Sports Massage", category: "massage" },
  { id: "thai-massage", label: "Thai Massage", category: "massage" },
  { id: "shiatsu", label: "Shiatsu", category: "massage" },
  { id: "myofascial-release", label: "Myofascial Release", category: "massage" },
  { id: "lymphatic-drainage", label: "Lymphatic Drainage", category: "massage" },
  { id: "craniosacral", label: "Craniosacral Therapy", category: "massage" },
  { id: "trigger-point", label: "Trigger Point Therapy", category: "massage" },
  // Safety & compliance
  { id: "cpr", label: "CPR", category: "safety" },
  { id: "first-aid", label: "First Aid", category: "safety" },
  { id: "aed", label: "AED Certification", category: "safety" },
  { id: "red-cross-cpr", label: "Red Cross CPR", category: "safety" },
  { id: "background-check-verified", label: "Background Check Verified", category: "safety" },
  { id: "background-checked", label: "Background Checked", category: "safety" },
  { id: "safesport", label: "SafeSport", category: "safety" },
  { id: "mandated-reporter", label: "Mandated Reporter Training", category: "safety" },
  { id: "liability-insurance", label: "Liability Insurance Verified", category: "safety" },
  { id: "business-license", label: "Business License Verified", category: "safety" },
  // Traditional & energetic practices
  { id: "reiki", label: "Reiki Level I/II/Master", category: "energetic" },
  { id: "ayurveda", label: "Ayurveda Practitioner", category: "energetic" },
  { id: "tcm", label: "Traditional Chinese Medicine (TCM)", category: "energetic" },
  { id: "acupuncturist", label: "Acupuncturist (Licensed)", category: "energetic" },
  { id: "herbalist", label: "Herbalist", category: "energetic" },
  { id: "qigong", label: "Qi Gong Instructor", category: "energetic" },
  { id: "tai-chi", label: "Tai Chi Instructor", category: "energetic" },
  { id: "chakra-healing", label: "Chakra Healing", category: "energetic" },
  { id: "energy-healing", label: "Energy Healing", category: "energetic" }
] as const satisfies readonly AdminGrantableCredential[];

export type AdminGrantableCredentialId = (typeof ADMIN_GRANTABLE_CREDENTIALS)[number]["id"];

export const ADMIN_CREDENTIAL_CATEGORY_LABELS: Record<AdminCredentialCategory, string> = {
  yoga: "Yoga Alliance & yoga",
  pilates: "Pilates",
  fitness: "Personal training & fitness",
  movement: "Movement & somatic",
  mindfulness: "Mindfulness & breath",
  coaching: "Coaching",
  massage: "Massage & bodywork",
  safety: "Safety & compliance",
  energetic: "Traditional & energetic practices"
};

const CATEGORY_ORDER: AdminCredentialCategory[] = [
  "yoga",
  "pilates",
  "fitness",
  "movement",
  "mindfulness",
  "coaching",
  "massage",
  "safety",
  "energetic"
];

export const ADMIN_GRANTABLE_CREDENTIAL_GROUPS = CATEGORY_ORDER.map((category) => ({
  category,
  title: ADMIN_CREDENTIAL_CATEGORY_LABELS[category],
  credentials: ADMIN_GRANTABLE_CREDENTIALS.filter((entry) => entry.category === category)
}));

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
