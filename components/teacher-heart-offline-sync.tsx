"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { syncPendingTeacherHeartsAction } from "@/lib/actions";
import {
  readPendingTeacherHeartQueue,
  TEACHER_HEART_QUEUE_EVENT,
  writePendingTeacherHeartQueue
} from "@/lib/teacher-heart-offline-queue";

type TeacherHeartOfflineSyncProps = {
  userId: string | null;
};

/**
 * Flushes queued heart mutations from localStorage when the user is signed in
 * (initial mount, tab visible again, or user id change after login).
 */
export function TeacherHeartOfflineSync({ userId }: TeacherHeartOfflineSyncProps) {
  const router = useRouter();
  const flushing = useRef(false);

  useEffect(() => {
    if (!userId) return;
    const uid = userId;

    async function flush() {
      if (flushing.current) return;
      const queue = readPendingTeacherHeartQueue(uid);
      if (!queue.length) return;
      flushing.current = true;
      try {
        const formData = new FormData();
        formData.set("queueUserId", uid);
        formData.set("payload", JSON.stringify(queue));
        const remaining = await syncPendingTeacherHeartsAction(formData);
        writePendingTeacherHeartQueue(uid, remaining);
        if (remaining.length < queue.length) {
          router.refresh();
        }
      } catch {
        /* keep queue for a later attempt */
      } finally {
        flushing.current = false;
      }
    }

    void flush();

    let queueDebounce: ReturnType<typeof setTimeout> | undefined;
    function onQueueUpdated() {
      clearTimeout(queueDebounce);
      queueDebounce = setTimeout(() => {
        void flush();
      }, 800);
    }
    window.addEventListener(TEACHER_HEART_QUEUE_EVENT, onQueueUpdated);

    function onVisible() {
      if (document.visibilityState === "visible") {
        void flush();
      }
    }

    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(queueDebounce);
      window.removeEventListener(TEACHER_HEART_QUEUE_EVENT, onQueueUpdated);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, router]);

  return null;
}
