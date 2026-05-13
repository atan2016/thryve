/**
 * Restores demo teacher profiles KJ Landis (teacher-3) and Robin Jaffe (teacher-4)
 * after they were removed by migration remove_not_certified_teacher_accounts
 * (if they were still not_certified) or any accidental delete.
 *
 * Safe to re-run: upserts by id. Does not reset password if the user row already exists.
 *
 * Usage: npm run db:restore:k-j-robin
 * Requires DATABASE_URL (e.g. via .env / .env.local — use same pattern as prisma-with-env).
 */

const path = require("path");
const { config } = require("dotenv");
const bcrypt = require("bcryptjs");
const { PrismaClient, Role, StoryMediaType } = require("@prisma/client");

const root = path.join(__dirname, "..");

if (require("fs").existsSync(path.join(root, ".env"))) {
  config({ path: path.join(root, ".env") });
}
if (require("fs").existsSync(path.join(root, ".env.local"))) {
  config({ path: path.join(root, ".env.local"), override: true });
}

const prisma = new PrismaClient();

const users = [
  {
    id: "user-teacher-3",
    email: "kj.landis@yoga.local",
    password: "password123",
    role: Role.TEACHER,
    name: "KJ Landis",
    emailVerifiedAt: new Date()
  },
  {
    id: "user-teacher-4",
    email: "robinjaffe@yoga.local",
    password: "password123",
    role: Role.TEACHER,
    name: "Robin Jaffe",
    emailVerifiedAt: new Date()
  }
];

const teachers = [
  {
    id: "teacher-3",
    userId: "user-teacher-3",
    slug: "kj-landis",
    fullName: "KJ Landis",
    avatarUrl: "/assets/images/kj-landis.jpg",
    studioName: "Hot Yoga Plus Daly City",
    studioWebsiteUrl: "https://hotyogaplus-dc.com/",
    studioScheduleUrl: "https://www.hotyogaplus-dc.com/bikram-hot-yoga-daly-city-class-schedule/",
    websiteUrl: "https://hotyogaplus-dc.com/",
    platformHoursBooked: 320,
    city: "Daly City",
    serviceRadiusMiles: 10,
    training:
      "Author, educator, wellness coach, and certified fitness instructor teaching heated yoga, Pilates, Yin, and meditation practices.",
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
    websiteUrl: "https://www.robinjaffe.love/",
    linkedinUrl: "https://www.linkedin.com/in/robin-jaffe-014b8010/",
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

const hostsNeeded = [
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

const stories = [
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
    caption:
      "A gentle evening practice with props, breath, and long-held shapes designed to soften stress and build resilience.",
    mediaUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    mediaType: StoryMediaType.IMAGE,
    sortOrder: 2,
    published: true
  }
];

function makeDate(dayOffset, hour, durationMinutes) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startsAt = new Date(today);
  startsAt.setDate(today.getDate() + dayOffset);
  startsAt.setHours(hour, 0, 0, 0);
  const endsAt = new Date(startsAt);
  endsAt.setMinutes(startsAt.getMinutes() + durationMinutes);
  return { startsAt, endsAt };
}

const upcomingEvents = [
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

const calendarSessions = [
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
    description:
      "Beginner-friendly somatic yoga and gentle Pilates, ending with optional breathwork and guided meditation.",
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

const teachingHours = [
  { id: "hours-teacher-3-studio", teacherId: "teacher-3", category: "studio", totalHours: 320 },
  { id: "hours-teacher-4-studio", teacherId: "teacher-4", category: "studio", totalHours: 186 },
  { id: "hours-teacher-4-private", teacherId: "teacher-4", category: "private", totalHours: 54 },
  { id: "hours-teacher-4-corporate-events", teacherId: "teacher-4", category: "corporate-events", totalHours: 42 },
  { id: "hours-teacher-4-kids", teacherId: "teacher-4", category: "kids", totalHours: 18 }
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env or .env.local.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  for (const host of hostsNeeded) {
    await prisma.eventHost.upsert({
      where: { id: host.id },
      update: host,
      create: host
    });
  }

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        password: passwordHash,
        role: user.role,
        name: user.name,
        emailVerifiedAt: user.emailVerifiedAt
      },
      update: {
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt
      }
    });
  }

  for (const teacher of teachers) {
    await prisma.teacher.upsert({
      where: { id: teacher.id },
      update: teacher,
      create: teacher
    });
  }

  for (const story of stories) {
    await prisma.teacherStory.upsert({
      where: { id: story.id },
      update: story,
      create: story
    });
  }

  for (const event of upcomingEvents) {
    await prisma.teacherUpcomingEvent.upsert({
      where: { id: event.id },
      update: event,
      create: event
    });
  }

  for (const session of calendarSessions) {
    await prisma.teacherCalendarSession.upsert({
      where: { id: session.id },
      update: session,
      create: session
    });
  }

  for (const counter of teachingHours) {
    await prisma.teachingHourCounter.upsert({
      where: {
        teacherId_category: {
          teacherId: counter.teacherId,
          category: counter.category
        }
      },
      update: { totalHours: counter.totalHours },
      create: counter
    });
  }

  await prisma.teacher.update({
    where: { id: "teacher-3" },
    data: { platformHoursBooked: 320 }
  });
  await prisma.teacher.update({
    where: { id: "teacher-4" },
    data: { platformHoursBooked: 294 }
  });

  console.log("Restored KJ Landis (teacher-3 / kj-landis) and Robin Jaffe (teacher-4 / robin-jaffe) with related hosts, stories, events, calendar sessions, and teaching hours.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
