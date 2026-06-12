export type PendingTeacherHeartOp = {
  teacherId: string;
  teacherSlug: string;
  intent: "heart" | "unheart";
  queuedAt: string;
};

const STORAGE_PREFIX = "thryve:teacher-heart-queue:";
const MAX_QUEUE = 40;

export const TEACHER_HEART_QUEUE_EVENT = "thryve-teacher-heart-queue";

export function teacherHeartQueueStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function parsePendingTeacherHeartPayload(json: string): PendingTeacherHeartOp[] {
  try {
    const raw = JSON.parse(json) as unknown;
    if (!Array.isArray(raw)) return [];
    const out: PendingTeacherHeartOp[] = [];
    for (const entry of raw) {
      if (!entry || typeof entry !== "object") continue;
      const o = entry as Record<string, unknown>;
      const teacherId = typeof o.teacherId === "string" ? o.teacherId : "";
      const teacherSlug = typeof o.teacherSlug === "string" ? o.teacherSlug : "";
      const intent = o.intent === "unheart" ? "unheart" : o.intent === "heart" ? "heart" : "";
      const queuedAt = typeof o.queuedAt === "string" ? o.queuedAt : new Date().toISOString();
      if (!teacherId || !teacherSlug || !intent) continue;
      out.push({ teacherId, teacherSlug, intent: intent as "heart" | "unheart", queuedAt });
    }
    return out.slice(0, MAX_QUEUE);
  } catch {
    return [];
  }
}

export function readPendingTeacherHeartQueue(userId: string): PendingTeacherHeartOp[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(teacherHeartQueueStorageKey(userId));
    if (!raw) return [];
    return parsePendingTeacherHeartPayload(raw);
  } catch {
    return [];
  }
}

export function writePendingTeacherHeartQueue(userId: string, items: PendingTeacherHeartOp[]) {
  if (typeof window === "undefined") return;
  const trimmed = items.slice(-MAX_QUEUE);
  localStorage.setItem(teacherHeartQueueStorageKey(userId), JSON.stringify(trimmed));
}

export function dispatchTeacherHeartQueueUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TEACHER_HEART_QUEUE_EVENT));
}

export function enqueuePendingTeacherHeart(userId: string, op: Pick<PendingTeacherHeartOp, "teacherId" | "teacherSlug" | "intent">) {
  const q = readPendingTeacherHeartQueue(userId);
  q.push({ ...op, queuedAt: new Date().toISOString() });
  writePendingTeacherHeartQueue(userId, q);
  dispatchTeacherHeartQueueUpdated();
}

export function clearPendingTeacherHeartOpsForTeacher(userId: string, teacherId: string) {
  const q = readPendingTeacherHeartQueue(userId).filter((op) => op.teacherId !== teacherId);
  writePendingTeacherHeartQueue(userId, q);
  dispatchTeacherHeartQueueUpdated();
}

export function pendingHeartCountDeltaForTeacher(userId: string | null | undefined, teacherId: string): number {
  if (!userId || typeof window === "undefined") return 0;
  let d = 0;
  for (const op of readPendingTeacherHeartQueue(userId)) {
    if (op.teacherId !== teacherId) continue;
    d += op.intent === "heart" ? 1 : -1;
  }
  return d;
}

export function effectiveViewerHasHeartedTeacher(
  userId: string | null | undefined,
  teacherId: string,
  serverHasHearted: boolean
): boolean {
  if (!userId || typeof window === "undefined") return serverHasHearted;
  let h = serverHasHearted;
  for (const op of readPendingTeacherHeartQueue(userId)) {
    if (op.teacherId !== teacherId) continue;
    h = op.intent === "heart";
  }
  return h;
}
