export type ConnectPeerCard = {
  slug: string;
  fullName: string;
  avatarUrl?: string;
  /** Optional subtitle (e.g. specialty) — only shown when set. */
  specialty?: string;
  isDemo?: boolean;
  /** Present for real teachers from the directory (not demo filler). */
  teacherId?: string;
  heartCount?: number;
  viewerHasHearted?: boolean;
  heartInteraction?: "toggle" | "signin" | "none";
};

const DEMO_PEERS: ConnectPeerCard[] = [
  { slug: "_demo-maya", fullName: "Maya Chen", isDemo: true },
  { slug: "_demo-james", fullName: "James Rivera", isDemo: true },
  { slug: "_demo-priya", fullName: "Priya Sharma", isDemo: true },
  { slug: "_demo-marcus", fullName: "Marcus Johnson", isDemo: true },
  { slug: "_demo-luna", fullName: "Luna Park", isDemo: true },
  { slug: "_demo-david", fullName: "David Kim", isDemo: true },
];

export type BuildConnectPeersOptions = {
  excludeSlug?: string;
  /** Omit the signed-in user’s teacher profile from the row (matches `Teacher.userId`). */
  excludeUserId?: string;
};

/** Up to six peer cards from published teachers; optional exclusions; padded with demo peers. */
export function buildConnectPeers(
  teachers: Array<{ id: string; slug: string; userId?: string; fullName: string; avatarUrl?: string }>,
  options?: BuildConnectPeersOptions,
): ConnectPeerCard[] {
  const excludeSlug = options?.excludeSlug;
  const excludeUserId = options?.excludeUserId;

  const fromDb: ConnectPeerCard[] = teachers
    .filter((t) => {
      if (excludeSlug && t.slug === excludeSlug) return false;
      if (excludeUserId && t.userId === excludeUserId) return false;
      return true;
    })
    .slice(0, 6)
    .map((t) => {
      const card: ConnectPeerCard = {
        slug: t.slug,
        teacherId: t.id,
        fullName: t.fullName,
        avatarUrl: t.avatarUrl
      };
      if (t.slug === "michelle-li") {
        card.specialty = "Tai Chi";
      }
      return card;
    });

  if (fromDb.length >= 6) {
    return fromDb;
  }

  const used = new Set(fromDb.map((p) => p.slug));
  for (const d of DEMO_PEERS) {
    if (fromDb.length >= 6) break;
    if ((!excludeSlug || d.slug !== excludeSlug) && !used.has(d.slug)) {
      fromDb.push(d);
      used.add(d.slug);
    }
  }

  return fromDb;
}
