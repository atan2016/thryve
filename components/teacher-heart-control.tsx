"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { toggleTeacherHeartAction } from "@/lib/actions";
import {
  TEACHER_HEART_QUEUE_EVENT,
  clearPendingTeacherHeartOpsForTeacher,
  effectiveViewerHasHeartedTeacher,
  enqueuePendingTeacherHeart,
  pendingHeartCountDeltaForTeacher
} from "@/lib/teacher-heart-offline-queue";

function IconHeart({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      aria-hidden
      className={`h-4 w-4 shrink-0 ${filled ? "fill-[#EF6B7B] text-[#EF6B7B]" : "fill-none text-[#9CB1C4]"} ${className ?? ""}`}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.435 6.582a5.373 5.373 0 00-7.6 0L12 8.418l-1.836-1.836a5.374 5.374 0 10-7.6 7.6l1.836 1.835L12 21.616l7.6-7.6 1.835-1.834a5.373 5.373 0 000-7.6Z"
      />
    </svg>
  );
}

function useTeacherHeartQueueTick(viewerUserId: string | null | undefined) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!viewerUserId) return;
    const fn = () => setTick((t) => t + 1);
    window.addEventListener(TEACHER_HEART_QUEUE_EVENT, fn);
    return () => window.removeEventListener(TEACHER_HEART_QUEUE_EVENT, fn);
  }, [viewerUserId]);
}

export function TeacherHeartCountLabel({
  viewerUserId,
  teacherId,
  serverHeartCount,
  className
}: {
  viewerUserId: string | null;
  teacherId: string;
  serverHeartCount: number;
  className?: string;
}) {
  useTeacherHeartQueueTick(viewerUserId);
  const delta = pendingHeartCountDeltaForTeacher(viewerUserId, teacherId);
  const n = Math.max(0, serverHeartCount + delta);
  const noun = n === 1 ? "heart" : "hearts";
  return (
    <span className={className ?? ""}>
      {n} {noun}
    </span>
  );
}

export type TeacherHeartControlProps = {
  variant: "compact" | "profile";
  teacherId: string;
  teacherSlug: string;
  teacherFullName?: string;
  serverHeartCount: number;
  serverViewerHasHearted: boolean;
  heartInteraction: "toggle" | "signin" | "none";
  viewerUserId: string | null;
  /** Profile page button classes (teal outline). */
  profileButtonClassName?: string;
};

export function TeacherHeartControl({
  variant,
  teacherId,
  teacherSlug,
  teacherFullName,
  serverHeartCount,
  serverViewerHasHearted,
  heartInteraction,
  viewerUserId,
  profileButtonClassName
}: TeacherHeartControlProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useTeacherHeartQueueTick(viewerUserId);

  const delta = pendingHeartCountDeltaForTeacher(viewerUserId, teacherId);
  const displayCount = Math.max(0, serverHeartCount + delta);
  const effectiveHearted = effectiveViewerHasHeartedTeacher(viewerUserId, teacherId, serverViewerHasHearted);

  if (heartInteraction === "signin") {
    return (
      <Link
        className={
          variant === "compact"
            ? "rounded-full px-2 py-1 text-[11px] font-semibold text-[#4AA6AB] hover:underline"
            : "rounded-full px-2 py-1 text-sm font-semibold text-[#0f766e] hover:underline"
        }
        href={`/sign-in?next=${encodeURIComponent("/")}`}
      >
        Sign in
      </Link>
    );
  }

  if (heartInteraction === "none") {
    if (variant === "profile") {
      const label = displayCount === 1 ? "heart" : "hearts";
      return (
        <span className={`${profileButtonClassName ?? ""} inline-flex cursor-default items-center gap-2 opacity-90`}>
          <span aria-hidden>♡</span>
          {displayCount} {label}
        </span>
      );
    }
    return <span className="w-8 shrink-0" aria-hidden />;
  }

  const nextIntent = effectiveHearted ? "unheart" : "heart";

  function runToggle() {
    if (!viewerUserId) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("teacherId", teacherId);
      formData.set("teacherSlug", teacherSlug);
      formData.set("intent", nextIntent);
      try {
        await toggleTeacherHeartAction(formData);
        clearPendingTeacherHeartOpsForTeacher(viewerUserId, teacherId);
        router.refresh();
      } catch {
        enqueuePendingTeacherHeart(viewerUserId, {
          teacherId,
          teacherSlug,
          intent: nextIntent
        });
      }
    });
  }

  if (variant === "compact") {
    return (
      <button
        aria-label={effectiveHearted ? `Remove heart for ${teacherFullName ?? "instructor"}` : `Heart ${teacherFullName ?? "instructor"}`}
        className="rounded-full p-1.5 transition hover:bg-[#F6FAFC] disabled:opacity-50"
        disabled={pending}
        onClick={(e) => {
          e.preventDefault();
          runToggle();
        }}
        type="button"
      >
        <IconHeart filled={effectiveHearted} />
      </button>
    );
  }

  const label = displayCount === 1 ? "heart" : "hearts";
  const btnClass = profileButtonClassName ?? "";

  return (
    <button
      className={`${btnClass} inline-flex items-center gap-2 disabled:opacity-50`}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        runToggle();
      }}
      type="button"
    >
      <span aria-hidden>{effectiveHearted ? "❤" : "♡"}</span>
      {displayCount} {label}
    </button>
  );
}
