"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { toggleTeacherHeartAction } from "@/lib/actions";
import { TeacherAvatar } from "@/components/teacher-avatar";
import type { ConnectPeerCard } from "@/lib/connect-peers";

export type { ConnectPeerCard } from "@/lib/connect-peers";

function IconUserPlus({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className ?? ""}`} aria-hidden>
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" d="M12 5v14M5 12h14" />
      </svg>
    </span>
  );
}

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden
      className={`h-4 w-4 shrink-0 ${filled ? "fill-rose-500 text-rose-500" : "fill-none text-stone-400"}`}
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

type ConnectWithPeersProps = {
  peers: ConnectPeerCard[];
};

export function ConnectWithPeers({ peers }: ConnectWithPeersProps) {
  const initialConnected = useMemo(() => {
    const s = new Set<string>();
    peers.forEach((p, i) => {
      if (i % 3 === 1) s.add(p.slug);
    });
    return s;
  }, [peers]);

  const [connected, setConnected] = useState(() => initialConnected);

  if (peers.length === 0) {
    return null;
  }

  function toggle(slug: string) {
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <section className="space-y-4" aria-labelledby="connect-peers-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="connect-peers-heading" className="text-2xl font-semibold text-stone-900">
            Connect with Peers
          </h2>
          <p className="text-sm text-stone-500">Grow your wellness network</p>
        </div>
        <Link className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 sm:shrink-0" href="/teachers">
          See all
        </Link>
      </div>

      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {peers.map((peer) => {
          const isConnected = connected.has(peer.slug);
          const profileHref = peer.isDemo ? undefined : `/teachers/${peer.slug}`;
          const heartCount = peer.heartCount ?? 0;
          const heartInteraction = peer.heartInteraction ?? "none";
          const viewerHasHearted = peer.viewerHasHearted ?? false;

          return (
            <article
              key={peer.slug}
              className="flex w-[min(100%,11.5rem)] shrink-0 flex-col items-center rounded-xl border border-stone-200 bg-white px-5 py-6 text-center shadow-sm sm:w-44"
            >
              {profileHref ? (
                <Link href={profileHref} className="flex flex-col items-center">
                  <TeacherAvatar className="h-20 w-20 rounded-full" height={80} name={peer.fullName} src={peer.avatarUrl} width={80} />
                  <p className="mt-4 font-semibold text-stone-900">{peer.fullName}</p>
                </Link>
              ) : (
                <>
                  <TeacherAvatar className="h-20 w-20 rounded-full" height={80} name={peer.fullName} src={peer.avatarUrl} width={80} />
                  <p className="mt-4 font-semibold text-stone-900">{peer.fullName}</p>
                </>
              )}
              <p className="mt-1 text-sm text-stone-500">{peer.specialty}</p>
              {peer.teacherId && !peer.isDemo ? (
                <div className="mt-3 flex w-full items-center justify-between gap-2 text-xs text-stone-600">
                  <span className="tabular-nums">{heartCount} hearts</span>
                  {heartInteraction === "toggle" && peer.teacherId ? (
                    <form action={toggleTeacherHeartAction}>
                      <input name="teacherId" type="hidden" value={peer.teacherId} />
                      <input name="teacherSlug" type="hidden" value={peer.slug} />
                      <input name="intent" type="hidden" value={viewerHasHearted ? "unheart" : "heart"} />
                      <button
                        aria-label={viewerHasHearted ? `Remove heart for ${peer.fullName}` : `Heart ${peer.fullName}`}
                        className="rounded-full p-1.5 transition hover:bg-stone-100"
                        type="submit"
                      >
                        <IconHeart filled={viewerHasHearted} />
                      </button>
                    </form>
                  ) : heartInteraction === "signin" ? (
                    <Link className="font-semibold text-emerald-700 hover:underline" href={`/sign-in?next=${encodeURIComponent("/")}`}>
                      Sign in
                    </Link>
                  ) : (
                    <span className="w-6 shrink-0" aria-hidden />
                  )}
                </div>
              ) : null}
              {isConnected ? (
                <button
                  type="button"
                  className="mt-5 w-full rounded-lg bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  onClick={() => toggle(peer.slug)}
                >
                  Connected
                </button>
              ) : (
                <button
                  type="button"
                  className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                  onClick={() => toggle(peer.slug)}
                >
                  <IconUserPlus className="h-4 w-4" />
                  Connect
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
