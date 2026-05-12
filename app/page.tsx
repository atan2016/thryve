import Image from "next/image";
import Link from "next/link";

import { ConnectWithPeers } from "@/components/connect-with-peers";
import { buildConnectPeers } from "@/lib/connect-peers";
import { FeaturedEventsCarousel } from "@/components/featured-events-carousel";
import { FeaturedLocalGigsCarousel } from "@/components/featured-local-gigs-carousel";
import { FeaturedTeachersCarousel } from "@/components/featured-teachers-carousel";
import { toggleEventHostFollowAction } from "@/lib/actions";
import { getSession } from "@/lib/auth/session";
import { listHomepageFeaturedEvents, listHomepageLocalGigs, listTeachers } from "@/lib/persistence";

export default async function HomePage() {
  const session = await getSession();
  const teachers = await listTeachers();
  const homepageEvents = await listHomepageFeaturedEvents(session?.userId);
  const homepageJobs = await listHomepageLocalGigs();
  const connectPeers = session ? buildConnectPeers(teachers, { excludeUserId: session.userId }) : [];

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
          <Link
            className="pointer-events-auto inline-flex min-w-[128px] items-center justify-center rounded-full bg-[#A6B2A3] px-5 py-2.5 text-[15px] font-semibold tracking-[-0.01em] shadow-[0_12px_24px_-16px_rgba(97,111,96,0.65)] transition hover:bg-[#98a594]"
            href="/community"
            style={{ color: "#EEF6EE" }}
          >
            Watch Video
          </Link>
        </div>
      </section>

      <FeaturedEventsCarousel
        events={homepageEvents}
        isSignedIn={Boolean(session)}
        toggleEventHostFollowAction={toggleEventHostFollowAction}
      />

      <FeaturedLocalGigsCarousel gigs={homepageJobs} isSignedIn={Boolean(session)} />

      <FeaturedTeachersCarousel teachers={teachers} />

      {session ? <ConnectWithPeers key={session.userId} peers={connectPeers} /> : null}
    </div>
  );
}
