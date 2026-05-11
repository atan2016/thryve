const path = require("path");
const dotenv = require("dotenv");

const rootDir = path.join(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(rootDir, ".env.local"), override: true });

const { PrismaClient, Role, DiscussionAuthorRole, StoryMediaType } = require("@prisma/client");

const prisma = new PrismaClient();

const demoUsers = [
  { id: "user-customer-1", email: "student@yoga.local", password: "password123", role: Role.CUSTOMER, name: "Maya Student" },
  { id: "user-teacher-1", email: "teacher@yoga.local", password: "password123", role: Role.TEACHER, name: "Ashley Tan" },
  { id: "user-teacher-2", email: "teacher2@yoga.local", password: "password123", role: Role.TEACHER, name: "Kelly Heinrich" },
  { id: "user-teacher-3", email: "kj.landis@yoga.local", password: "password123", role: Role.TEACHER, name: "KJ Landis" },
  { id: "user-teacher-4", email: "robinjaffe@yoga.local", password: "password123", role: Role.TEACHER, name: "Robin Jaffe" },
  { id: "user-admin-1", email: "admin@yoga.local", password: "password123", role: Role.ADMIN, name: "Jordan Admin" }
];

const demoEventHosts = [
  {
    id: "host-j8-hot-pilates-yoga",
    name: "J8 Hot Pilates & Yoga",
    slug: "j8-hot-pilates-yoga",
    websiteUrl: "https://www.j8hotpilatesyoga.com/",
    imageUrl: null
  },
  {
    id: "host-hot-yoga-plus-daly-city",
    name: "Hot Yoga Plus Daly City",
    slug: "hot-yoga-plus-daly-city",
    websiteUrl: "https://hotyogaplus-dc.com/",
    imageUrl: null
  },
  {
    id: "host-good-living-health",
    name: "Good Living Health",
    slug: "good-living-health",
    websiteUrl: "https://www.robinjaffe.love/public-classes",
    imageUrl: null
  },
  {
    id: "host-sunporch-yoga",
    name: "SunPorch Yoga",
    slug: "sunporch-yoga",
    websiteUrl: "https://fitlocalfit.com/Services/Sunporch-Yoga",
    imageUrl: null
  },
  {
    id: "host-vennu-yoga",
    name: "Vennu Yoga",
    slug: "vennu-yoga",
    websiteUrl: "https://vennu-studio.com/book-a-class",
    imageUrl: null
  }
];

const demoTeachers = [
  {
    id: "teacher-1",
    userId: "user-teacher-1",
    slug: "ashley-tan",
    fullName: "Ashley Tan",
    avatarUrl: "/assets/images/ashley-tan.png",
    studioName: "J8 Hot Pilates & Yoga",
    studioWebsiteUrl: "https://www.j8hotpilatesyoga.com/",
    studioScheduleUrl: "https://calendly.com/ashleyt-_z90/1-hour-meeting",
    platformHoursBooked: 14,
    city: "San Francisco",
    serviceRadiusMiles: 20,
    training: "500-hour Vinyasa certification with advanced pre/postnatal and restorative training in Bali and California.",
    experienceYears: 9,
    bio: `Hi, I'm Ashley Tan. I've been practicing yoga for over 25 years, but my journey really began in Chengdu, China, where I spent most of my childhood. Some of my most meaningful memories are from Qingcheng Mountain—the home of Taoism—where I developed a deep appreciation for balance, nature, and inner stillness.

Growing up drinking green tea every day, it feels natural for me to bring together all the things I love—yoga, tea, and movement. This blend is at the heart of my practice, creating a space that is calming, accessible, and thoughtfully designed for every individual.

That same spirit is how I approach teaching: yoga isn't one shape or pace—it's meeting yourself where you are. As a certified instructor, I offer Chair, Yin, and Flow so that people of all ages can find steadiness, softness, and strength in a way that fits their body and their day.

Whether you need support in a seat, depth in stillness, or rhythm in movement, sessions are built around your needs and energy—so practice stays grounded, approachable, and truly yours.`,
    gender: "female",
    certificationStatus: "certified",
    published: true
  },
  {
    id: "teacher-2",
    userId: "user-teacher-2",
    slug: "kai-raman",
    fullName: "Kelly Heinrich",
    avatarUrl: null,
    platformHoursBooked: 264,
    city: "Oakland",
    serviceRadiusMiles: 15,
    training: "RYT-300 in Hatha and trauma-informed yoga with a specialization in seniors and kids classes.",
    experienceYears: 12,
    bio: "Kai focuses on inclusive movement for schools, older adults, and corporate wellness sessions.",
    gender: "male",
    certificationStatus: "certified",
    published: true
  },
  {
    id: "teacher-3",
    userId: "user-teacher-3",
    slug: "kj-landis",
    fullName: "KJ Landis",
    avatarUrl: "/assets/images/kj-landis.jpg",
    studioName: "Hot Yoga Plus Daly City",
    studioWebsiteUrl: "https://hotyogaplus-dc.com/",
    studioScheduleUrl: "https://www.hotyogaplus-dc.com/bikram-hot-yoga-daly-city-class-schedule/",
    platformHoursBooked: 320,
    city: "Daly City",
    serviceRadiusMiles: 10,
    training: "Author, educator, wellness coach, and certified fitness instructor teaching heated yoga, Pilates, Yin, and meditation practices.",
    experienceYears: 15,
    bio: "KJ Landis teaches public wellness classes in the San Francisco Bay Area with an emphasis on strong alignment, encouragement, mindful effort, and accessible self-development.",
    gender: "female",
    certificationStatus: "certified",
    published: true
  },
  {
    id: "teacher-4",
    userId: "user-teacher-4",
    slug: "robin-jaffe",
    fullName: "Robin Jaffe",
    avatarUrl: "/assets/images/robin-jaffe-headshot.jpeg",
    studioName: "Robin Jaffe Yoga",
    studioWebsiteUrl: "https://www.robinjaffe.love/",
    studioScheduleUrl: "https://www.robinjaffe.love/public-classes",
    platformHoursBooked: 294,
    city: "Redwood City",
    serviceRadiusMiles: 35,
    training:
      "E-RYT 500 and YACEP through Yoga Alliance, Mat Pilates training through College of San Mateo, 50-hour Yin Yoga with Bernie Clark, Restorative Yoga, Reiki I, Yoga for Children, Yoga for Teens, and Yoga for First Responders.",
    experienceYears: 27,
    bio: `Robin Jaffe is a Bay Area yoga, Pilates, and meditation instructor whose teaching blends regulation, resilience, and accessible movement for all bodies and all levels.

For more than 27 years, Robin has studied practices that balance strength and relaxation, effort and ease. Her classes focus on managing stress and anxiety while offering just the right amount of challenge to build confidence, mobility, and steadiness.

Robin teaches in homes, studios, schools, Fortune 500 workplaces, and community spaces across the Peninsula and San Francisco. She emphasizes choice and customization so students can adapt each practice to their unique needs and anatomy.`,
    gender: "female",
    certificationStatus: "certified",
    published: true
  }
];

const demoStories = [
  {
    id: "story-1",
    teacherId: "teacher-1",
    title: "Moonlit rooftop flow",
    caption: "A storytelling series built around breath, music, and sunset city views.",
    mediaUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    mediaType: StoryMediaType.IMAGE,
    sortOrder: 1,
    published: true
  },
  {
    id: "story-2",
    teacherId: "teacher-1",
    title: "Founder story",
    caption: "Video intro explaining Ashley's teaching philosophy and training journey.",
    mediaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    mediaType: StoryMediaType.VIDEO,
    sortOrder: 2,
    published: true
  },
  {
    id: "story-3",
    teacherId: "teacher-2",
    title: "Community chair yoga",
    caption: "A gentle series from a weekly community center class.",
    mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    mediaType: StoryMediaType.IMAGE,
    sortOrder: 1,
    published: true
  },
  {
    id: "story-4",
    teacherId: "teacher-4",
    title: "The practice starts now",
    caption: "Robin’s teaching begins with regulation, choice, and meeting students exactly where they are.",
    mediaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    mediaType: StoryMediaType.IMAGE,
    sortOrder: 1,
    published: true
  },
  {
    id: "story-5",
    teacherId: "teacher-4",
    title: "Candlelight Yin in San Francisco",
    caption: "A gentle evening practice with props, breath, and long-held shapes designed to soften stress and build resilience.",
    mediaUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    mediaType: StoryMediaType.IMAGE,
    sortOrder: 2,
    published: true
  }
];

const demoUpcomingEvents = [
  {
    id: "event-1",
    teacherId: "teacher-1",
    hostId: "host-j8-hot-pilates-yoga",
    title: "Hot Pilates Flow",
    hostName: "J8 Hot Pilates & Yoga",
    eventUrl: "https://www.j8hotpilatesyoga.com/about/classes/",
    eventDate: new Date(Date.UTC(2026, 4, 8, 1, 0, 0))
  },
  {
    id: "event-kj-hot-yoga-plus",
    teacherId: "teacher-3",
    hostId: "host-hot-yoga-plus-daly-city",
    title: "Weekly teaching schedule",
    hostName: "Hot Yoga Plus Daly City",
    eventUrl: "https://www.hotyogaplus-dc.com/bikram-hot-yoga-daly-city-class-schedule/",
    eventDate: null
  },
  {
    id: "event-robin-good-living",
    teacherId: "teacher-4",
    hostId: "host-good-living-health",
    title: "Embodied Yoga, Pilates and Meditation",
    hostName: "Good Living Health",
    eventUrl: "https://www.robinjaffe.love/_files/ugd/79180e_5c5798a1722d4638b9e44c0e1094d254.pdf",
    eventDate: makeDate(3, 12, 45).startsAt
  },
  {
    id: "event-robin-sunporch",
    teacherId: "teacher-4",
    hostId: "host-sunporch-yoga",
    title: "Candlelight Yin Yoga",
    hostName: "SunPorch Yoga",
    eventUrl: "https://fitlocalfit.com/Services/Sunporch-Yoga",
    eventDate: makeDate(3, 18, 60).startsAt
  },
  {
    id: "event-robin-vennu",
    teacherId: "teacher-4",
    hostId: "host-vennu-yoga",
    title: "Trio3: Gentle Yoga Pilates and Meditation",
    hostName: "Vennu Yoga",
    eventUrl: "https://vennu-studio.com/book-a-class",
    eventDate: makeDate(1, 11, 60).startsAt
  }
];

const demoTeacherFollows = [
  {
    id: "follow-teacher-user-customer-1-teacher-1",
    userId: "user-customer-1",
    teacherId: "teacher-1"
  }
];

const demoEventHostFollows = [
  {
    id: "follow-host-user-customer-1-host-hot-yoga-plus-daly-city",
    userId: "user-customer-1",
    hostId: "host-hot-yoga-plus-daly-city"
  }
];

const demoTeachingHours = [
  { id: "hours-teacher-1-private", teacherId: "teacher-1", category: "private", totalHours: 8 },
  { id: "hours-teacher-1-older", teacherId: "teacher-1", category: "older", totalHours: 5 },
  { id: "hours-teacher-1-kids", teacherId: "teacher-1", category: "kids", totalHours: 1 },
  { id: "hours-teacher-2-studio", teacherId: "teacher-2", category: "studio", totalHours: 18 },
  { id: "hours-teacher-2-private", teacherId: "teacher-2", category: "private", totalHours: 44 },
  { id: "hours-teacher-2-corporate-events", teacherId: "teacher-2", category: "corporate-events", totalHours: 8 },
  { id: "hours-teacher-2-kids", teacherId: "teacher-2", category: "kids", totalHours: 84 },
  { id: "hours-teacher-2-older", teacherId: "teacher-2", category: "older", totalHours: 110 },
  { id: "hours-teacher-3-studio", teacherId: "teacher-3", category: "studio", totalHours: 320 },
  { id: "hours-teacher-4-studio", teacherId: "teacher-4", category: "studio", totalHours: 186 },
  { id: "hours-teacher-4-private", teacherId: "teacher-4", category: "private", totalHours: 54 },
  { id: "hours-teacher-4-corporate-events", teacherId: "teacher-4", category: "corporate-events", totalHours: 42 },
  { id: "hours-teacher-4-kids", teacherId: "teacher-4", category: "kids", totalHours: 18 }
];

const now = new Date();
const today = new Date(now);
today.setHours(0, 0, 0, 0);

function makeDate(dayOffset, hour, durationMinutes) {
  const startsAt = new Date(today);
  startsAt.setDate(today.getDate() + dayOffset);
  startsAt.setHours(hour, 0, 0, 0);
  const endsAt = new Date(startsAt);
  endsAt.setMinutes(startsAt.getMinutes() + durationMinutes);
  return { startsAt, endsAt };
}

const demoCalendarSessions = [
  {
    id: "calendar-kj-1",
    teacherId: "teacher-3",
    offeringId: "offering-6",
    title: "26&2 Bikram Yoga",
    description: "Classic heated 26-posture Hatha series focused on alignment, focus, and full-body conditioning.",
    location: "Hot Yoga Plus Daly City",
    ...makeDate(1, 9, 90),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://www.hotyogaplus-dc.com/bikram-hot-yoga-daly-city-class-schedule/",
    isBooked: false
  },
  {
    id: "calendar-kj-2",
    teacherId: "teacher-3",
    offeringId: "offering-7",
    title: "Classic Hot Pilates",
    description: "Mat-based Pilates principles taught in a heated room for core strength and stamina.",
    location: "Hot Yoga Plus Daly City",
    ...makeDate(2, 12, 60),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://www.hotyogaplus-dc.com/bikram-hot-yoga-daly-city-class-schedule/",
    isBooked: false
  },
  {
    id: "calendar-kj-3",
    teacherId: "teacher-3",
    offeringId: "offering-8",
    title: "Restorative Yin Yoga",
    description: "Gentle, steady holds in a moderately heated room to restore the body and settle the mind.",
    location: "Hot Yoga Plus Daly City",
    ...makeDate(3, 18, 60),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://www.hotyogaplus-dc.com/bikram-hot-yoga-daly-city-class-schedule/",
    isBooked: false
  },
  {
    id: "calendar-kj-4",
    teacherId: "teacher-3",
    offeringId: "offering-9",
    title: "Meditation",
    description: "Guided stillness and breath awareness for grounding and self-reflection.",
    location: "Hot Yoga Plus Daly City",
    ...makeDate(5, 10, 45),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://www.hotyogaplus-dc.com/bikram-hot-yoga-daly-city-class-schedule/",
    isBooked: false
  },
  {
    id: "calendar-kj-5",
    teacherId: "teacher-3",
    offeringId: "offering-6",
    title: "26&2 Bikram Yoga",
    description: "Classic heated 26-posture Hatha series focused on alignment, focus, and full-body conditioning.",
    location: "Hot Yoga Plus Daly City",
    ...makeDate(6, 16, 90),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://www.hotyogaplus-dc.com/bikram-hot-yoga-daly-city-class-schedule/",
    isBooked: false
  },
  {
    id: "calendar-robin-1",
    teacherId: "teacher-4",
    offeringId: "offering-10",
    title: "Embodied Yoga, Pilates and Meditation",
    description: "Beginner-friendly somatic yoga and gentle Pilates, ending with optional breathwork and guided meditation.",
    location: "Good Living Health · Redwood City",
    ...makeDate(3, 12, 45),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://www.robinjaffe.love/_files/ugd/79180e_5c5798a1722d4638b9e44c0e1094d254.pdf",
    isBooked: false
  },
  {
    id: "calendar-robin-2",
    teacherId: "teacher-4",
    offeringId: "offering-11",
    title: "Candlelight Yin Yoga",
    description: "Grounding floor-based Yin postures with props, soft pacing, and a gentle candlelight atmosphere.",
    location: "SunPorch Yoga · San Francisco",
    ...makeDate(3, 18, 60),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://fitlocalfit.com/Services/Sunporch-Yoga",
    isBooked: false
  },
  {
    id: "calendar-robin-3",
    teacherId: "teacher-4",
    offeringId: "offering-12",
    title: "Trio3: Gentle Yoga Pilates and Meditation",
    description: "Gentle yoga, Pilates-based core awareness, and guided meditation in a welcoming all-levels format.",
    location: "Vennu Yoga · Millbrae",
    ...makeDate(1, 11, 60),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://vennu-studio.com/book-a-class",
    isBooked: false
  }
];

const demoDiscussions = [
  {
    id: "discussion-1",
    authorName: "Ashley Tan",
    authorRole: DiscussionAuthorRole.TEACHER,
    title: "What helps you stay consistent with your practice?",
    body: "I would love to hear how people keep a rhythm with movement and breath when life gets busy. Do short daily sessions help more than longer weekend practices?",
    tags: ["practice", "habits"],
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    replyCount: 6
  },
  {
    id: "discussion-2",
    authorName: "Maya Student",
    authorRole: DiscussionAuthorRole.MEMBER,
    title: "Favorite restorative props for home sessions",
    body: "I am building a cozy home setup and would love recommendations for bolsters, blocks, blankets, or other props that make restorative sessions feel more supportive.",
    tags: ["restorative", "home-practice"],
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    replyCount: 4
  },
  {
    id: "discussion-3",
    authorName: "Jordan Admin",
    authorRole: DiscussionAuthorRole.ADMIN,
    title: "Welcome to the Thryve community forum",
    body: "Use this space to ask questions, swap wellness ideas, share resources, and connect with teachers and members across the platform.",
    tags: ["welcome", "community"],
    createdAt: now,
    replyCount: 2
  }
];

async function main() {
  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user
    });
  }

  for (const teacher of demoTeachers) {
    await prisma.teacher.upsert({
      where: { id: teacher.id },
      update: teacher,
      create: teacher
    });
  }

  for (const host of demoEventHosts) {
    await prisma.eventHost.upsert({
      where: { id: host.id },
      update: host,
      create: host
    });
  }

  for (const story of demoStories) {
    await prisma.teacherStory.upsert({
      where: { id: story.id },
      update: story,
      create: story
    });
  }

  for (const event of demoUpcomingEvents) {
    await prisma.teacherUpcomingEvent.upsert({
      where: { id: event.id },
      update: event,
      create: event
    });
  }

  for (const session of demoCalendarSessions) {
    await prisma.teacherCalendarSession.upsert({
      where: { id: session.id },
      update: session,
      create: session
    });
  }

  await prisma.teachingHourCounter.deleteMany({ where: { teacherId: "teacher-1" } });

  for (const counter of demoTeachingHours) {
    await prisma.teachingHourCounter.upsert({
      where: {
        teacherId_category: {
          teacherId: counter.teacherId,
          category: counter.category
        }
      },
      update: {
        totalHours: counter.totalHours
      },
      create: counter
    });
  }

  await prisma.teacher.update({
    where: { id: "teacher-1" },
    data: { platformHoursBooked: 14 }
  });

  await prisma.teacher.update({
    where: { id: "teacher-2" },
    data: { platformHoursBooked: 264 }
  });

  await prisma.teacher.update({
    where: { id: "teacher-3" },
    data: { platformHoursBooked: 320 }
  });

  for (const discussion of demoDiscussions) {
    await prisma.communityDiscussion.upsert({
      where: { id: discussion.id },
      update: discussion,
      create: discussion
    });
  }

  for (const follow of demoTeacherFollows) {
    await prisma.userTeacherFollow.upsert({
      where: {
        userId_teacherId: {
          userId: follow.userId,
          teacherId: follow.teacherId
        }
      },
      update: {},
      create: follow
    });
  }

  for (const follow of demoEventHostFollows) {
    await prisma.userEventHostFollow.upsert({
      where: {
        userId_hostId: {
          userId: follow.userId,
          hostId: follow.hostId
        }
      },
      update: {},
      create: follow
    });
  }

  console.log("Seeded demo users, teachers, hosts, follow relationships, stories, calendar sessions, upcoming events, teaching hours, and community discussions.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
