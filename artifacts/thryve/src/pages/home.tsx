import { Link } from "wouter";
import { FeaturedTeachersCarousel } from "@/components/featured-teachers-carousel";
import { FeaturedEventsCarousel } from "@/components/featured-events-carousel";
import { FeaturedLocalGigsCarousel } from "@/components/featured-local-gigs-carousel";
import { demoTeachers, demoHomepageEvents, demoHomepageJobs } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";

export function HomePage() {
  const { user } = useAuth();

  const featuredTeachers = demoTeachers.filter((t) => t.published).map((t) => ({
    id: t.id,
    slug: t.slug,
    fullName: t.fullName,
    avatarUrl: t.avatarUrl,
    city: t.city,
    styles: t.styles ?? [],
    platformHoursBooked: t.platformHoursBooked,
    heartCount: 0,
    viewerHasHearted: false,
    heartInteraction: user ? ("toggle" as const) : ("signin" as const)
  }));

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#EEF8F7] via-[#F5F9F8] to-[#F0F4F8] px-6 py-10 sm:px-10 sm:py-14">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#4AA6AB]">Bay Area Wellness Platform</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-[#1D3B5C] sm:text-5xl">
              Find Your Perfect
              <br />
              <span className="text-[#4AA6AB]">Yoga Teacher</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-[#4E6A83]">
              Connect with certified yoga teachers and wellness practitioners across the San Francisco Bay Area.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-[#1D3B5C] px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-[#173050]"
                href="/teachers"
              >
                Browse Teachers
              </Link>
              {!user ? (
                <Link
                  className="rounded-full border border-[#B6D4DC] bg-white px-6 py-3 text-base font-semibold text-[#1D3B5C] transition hover:bg-[#F3FBFB]"
                  href="/sign-up"
                >
                  Get Started
                </Link>
              ) : null}
            </div>
          </div>
          <div className="relative flex-shrink-0">
            <img
              alt="Yoga wellness"
              className="h-auto w-full max-w-sm rounded-[1.5rem] object-cover shadow-xl lg:w-[340px]"
              src="/assets/images/home-hero-wellbeing-v2.png"
            />
          </div>
        </div>
      </section>

      <FeaturedTeachersCarousel teachers={featuredTeachers} viewerUserId={user?.id ?? null} />

      <FeaturedEventsCarousel events={demoHomepageEvents} isSignedIn={!!user} />

      <FeaturedLocalGigsCarousel gigs={demoHomepageJobs} isSignedIn={!!user} />
    </div>
  );
}
