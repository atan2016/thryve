const { PrismaClient, Role, DiscussionAuthorRole, StoryMediaType } = require("@prisma/client");

const prisma = new PrismaClient();

const demoUsers = [
  { id: "user-customer-1", email: "student@yoga.local", password: "password123", role: Role.CUSTOMER, name: "Maya Student" },
  { id: "user-teacher-1", email: "teacher@yoga.local", password: "password123", role: Role.TEACHER, name: "Ashley Tan" },
  { id: "user-teacher-2", email: "teacher2@yoga.local", password: "password123", role: Role.TEACHER, name: "Kelly Heinrich" },
  { id: "user-admin-1", email: "admin@yoga.local", password: "password123", role: Role.ADMIN, name: "Jordan Admin" }
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
    studioScheduleUrl: "https://www.j8hotpilatesyoga.com/about/classes/",
    platformHoursBooked: 236,
    city: "San Francisco",
    serviceRadiusMiles: 20,
    training: "500-hour Vinyasa certification with advanced pre/postnatal and restorative training in Bali and California.",
    experienceYears: 9,
    bio: "Ashley blends strong alignment-driven flow with mindful storytelling for studios, private clients, and community events.",
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
  }
];

const demoUpcomingEvents = [
  {
    id: "event-1",
    teacherId: "teacher-1",
    title: "Hot Pilates Flow",
    hostName: "J8 Hot Pilates & Yoga",
    eventUrl: "https://www.j8hotpilatesyoga.com/about/classes/",
    eventDate: new Date(Date.UTC(2026, 4, 8, 1, 0, 0))
  }
];

const demoTeachingHours = [
  { id: "hours-teacher-1-studio", teacherId: "teacher-1", category: "studio", totalHours: 48 },
  { id: "hours-teacher-1-private", teacherId: "teacher-1", category: "private", totalHours: 122 },
  { id: "hours-teacher-1-corporate-events", teacherId: "teacher-1", category: "corporate-events", totalHours: 36 },
  { id: "hours-teacher-1-kids", teacherId: "teacher-1", category: "kids", totalHours: 12 },
  { id: "hours-teacher-1-older", teacherId: "teacher-1", category: "older", totalHours: 18 },
  { id: "hours-teacher-2-studio", teacherId: "teacher-2", category: "studio", totalHours: 18 },
  { id: "hours-teacher-2-private", teacherId: "teacher-2", category: "private", totalHours: 44 },
  { id: "hours-teacher-2-corporate-events", teacherId: "teacher-2", category: "corporate-events", totalHours: 8 },
  { id: "hours-teacher-2-kids", teacherId: "teacher-2", category: "kids", totalHours: 84 },
  { id: "hours-teacher-2-older", teacherId: "teacher-2", category: "older", totalHours: 110 }
];

const now = new Date();
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
    data: { platformHoursBooked: 236 }
  });

  await prisma.teacher.update({
    where: { id: "teacher-2" },
    data: { platformHoursBooked: 264 }
  });

  for (const discussion of demoDiscussions) {
    await prisma.communityDiscussion.upsert({
      where: { id: discussion.id },
      update: discussion,
      create: discussion
    });
  }

  console.log("Seeded demo users, teachers, stories, upcoming events, teaching hours, and community discussions.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
