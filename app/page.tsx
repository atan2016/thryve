import Image from "next/image";
import Link from "next/link";

import { ConnectWithPeers } from "@/components/connect-with-peers";
import { buildConnectPeers } from "@/lib/connect-peers";
import { FeaturedEventsCarousel } from "@/components/featured-events-carousel";
import { FeaturedLocalGigsCarousel } from "@/components/featured-local-gigs-carousel";
import { FeaturedTeachersCarousel } from "@/components/featured-teachers-carousel";
import { toggleEventHostFollowAction } from "@/lib/actions";
import { getSession } from "@/lib/auth/session";
import { isProdBuild } from "@/lib/is-production";
import {
  countTeacherHeartsForTeachers,
  listHomepageFeaturedEvents,
  listHomepageLocalGigs,
  listTeacherIdsHeartedByUser,
  listTeachers
} from "@/lib/persistence";

export default async function HomePage() {
  const session = await getSession();
  const teachers = await listTeachers();
  const homepageEvents = await listHomepageFeaturedEvents(session?.userId);
  const homepageJobs = isProdBuild ? [] : await listHomepageLocalGigs();

  const carouselSlice = teachers.slice(0, 6);
  const carouselIds = carouselSlice.map((t) => t.id);
  const carouselHeartCounts = await countTeacherHeartsForTeachers(carouselIds);
  const carouselHeartedByViewer = session
    ? await listTeacherIdsHeartedByUser(session.userId, carouselIds)
    : new Set<string>();
  const featuredTeachersForCarousel = carouselSlice.map((t) => ({
    id: t.id,
    slug: t.slug,
    fullName: t.fullName,
    avatarUrl: t.avatarUrl,
    city: t.city,
    styles: t.styles,
    platformHoursBooked: t.platformHoursBooked,
    heartCount: carouselHeartCounts.get(t.id) ?? 0,
    viewerHasHearted: session ? carouselHeartedByViewer.has(t.id) : false,
    heartInteraction: (session && t.userId !== session.userId ? "toggle" : session ? "none" : "signin") as
      | "toggle"
      | "signin"
      | "none"
  }));

  const connectPeersRaw = session ? buildConnectPeers(teachers, { excludeUserId: session.userId }) : [];
  const peerTeacherIds = connectPeersRaw.map((p) => p.teacherId).filter((id): id is string => Boolean(id));
  const peerHeartCounts = await countTeacherHeartsForTeachers(peerTeacherIds);
  const peerHeartedByViewer = session
    ? await listTeacherIdsHeartedByUser(session.userId, peerTeacherIds)
    : new Set<string>();
  const teacherById = new Map(teachers.map((t) => [t.id, t]));
  const connectPeers = connectPeersRaw.map((p) => {
    const owner = p.teacherId ? teacherById.get(p.teacherId) : undefined;
    const heartInteraction = (
      !p.teacherId || p.isDemo ? "none" : !session ? "signin" : !owner ? "none" : owner.userId === session.userId ? "none" : "toggle"
    ) as "toggle" | "signin" | "none";
    return {
      ...p,
      heartCount: p.teacherId && !p.isDemo ? peerHeartCounts.get(p.teacherId) ?? 0 : 0,
      viewerHasHearted: Boolean(session && p.teacherId && !p.isDemo && peerHeartedByViewer.has(p.teacherId)),
      heartInteraction
    };
  });

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl shadow-sm">
        <Image
          src="/assets/images/home-hero-wellbeing-v2.png"
          alt="Your path to whole wellbeing. Discover trusted professionals, services and experiences. Person meditating at sunrise above a misty valley."
          width={919}
          height={294}
          className="h-auto w-full scale-[1.01] object-cover object-center"
          priority
          sizes="(max-width: 1280px) 100vw, 1152px"
        />
        <div className="pointer-events-none absolute left-[5.2%] bottom-[12%] flex justify-start gap-3 sm:bottom-[12.5%] sm:gap-4">
          <Link
            className="pointer-events-auto inline-flex min-w-[108px] items-center justify-center rounded-full bg-[#0E4E72] px-5 py-2.5 text-[15px] font-semibold tracking-[-0.01em] shadow-[0_12px_24px_-16px_rgba(14,78,114,0.75)] transition hover:bg-[#0a4566]"
            href="/teachers"
            style={{ color: "#EEF6EE" }}
          >
            Explore
          </Link>
          {isProdBuild ? null : (
            <Link
              className="pointer-events-auto inline-flex min-w-[128px] items-center justify-center rounded-full bg-[#A6B2A3] px-5 py-2.5 text-[15px] font-semibold tracking-[-0.01em] shadow-[0_12px_24px_-16px_rgba(97,111,96,0.65)] transition hover:bg-[#98a594]"
              href="/community"
              style={{ color: "#EEF6EE" }}
            >
              Watch Video
            </Link>
          )}
        </div>
      </section>

      <FeaturedEventsCarousel
        events={homepageEvents}
        isSignedIn={Boolean(session)}
        toggleEventHostFollowAction={toggleEventHostFollowAction}
      />

      {isProdBuild ? null : <FeaturedLocalGigsCarousel gigs={homepageJobs} isSignedIn={Boolean(session)} />}

      <FeaturedTeachersCarousel teachers={featuredTeachersForCarousel} viewerUserId={session?.userId ?? null} />

      {session ? <ConnectWithPeers key={session.userId} peers={connectPeers} viewerUserId={session.userId} /> : null}
    </div>
  );
}
