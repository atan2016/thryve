const path = require("path");
const dotenv = require("dotenv");

const rootDir = path.join(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(rootDir, ".env.local"), override: true });

const { PrismaClient, Role, DiscussionAuthorRole, StoryMediaType } = require("@prisma/client");

const prisma = new PrismaClient();

const demoUsers = [
  { id: "user-customer-1", email: "student@yoga.local", password: "password123", role: Role.CUSTOMER, name: "Maya Student", emailVerifiedAt: new Date() },
  { id: "user-teacher-1", email: "teacher@yoga.local", password: "password123", role: Role.TEACHER, name: "Ashley Tan", emailVerifiedAt: new Date() },
  { id: "user-teacher-2", email: "teacher2@yoga.local", password: "password123", role: Role.TEACHER, name: "Kelly Heinrich", emailVerifiedAt: new Date() },
  { id: "user-teacher-3", email: "kj.landis@yoga.local", password: "password123", role: Role.TEACHER, name: "KJ Landis", emailVerifiedAt: new Date() },
  { id: "user-teacher-4", email: "robinjaffe@yoga.local", password: "password123", role: Role.TEACHER, name: "Robin Jaffe", emailVerifiedAt: new Date() },
  { id: "user-teacher-5", email: "denayadailey@gmail.com", password: "password123", role: Role.TEACHER, name: "Denaya Dailey", emailVerifiedAt: new Date() },
  { id: "user-teacher-6", email: "blu.high@yoga.local", password: "password123", role: Role.TEACHER, name: "Blu High", emailVerifiedAt: new Date() },
  { id: "user-admin-1", email: "admin@yoga.local", password: "password123", role: Role.ADMIN, name: "Jordan Admin", emailVerifiedAt: new Date() }
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
  },
  {
    id: "host-peacebank-yoga-studio",
    name: "Peacebank Yoga Studio",
    slug: "peacebank-yoga-studio",
    websiteUrl: "https://www.peacebankyoga.com/",
    imageUrl: null
  },
  {
    id: "host-yoga-source-palo-alto",
    name: "Yoga Source Palo Alto",
    slug: "yoga-source-palo-alto",
    websiteUrl: "https://yogasource.com/",
    imageUrl: null
  }
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
    websiteUrl: "https://yogabyashleytan.com/",
    instagramUrl: "https://www.instagram.com/ashleytan2017/",
    facebookUrl: "https://www.facebook.com/xtan1/",
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
    websiteUrl: "https://hotyogaplus-dc.com/",
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
  },
  {
    id: "teacher-5",
    userId: "user-teacher-5",
    slug: "denaya-dailey",
    fullName: "Denaya Dailey",
    avatarUrl: "https://yaprofileimages.blob.core.windows.net/profileimage/10349/8733152B-FD34-4F19-BAEA-830422E39A1E.jpg",
    showPublicCalendar: false,
    studioName: "College of San Mateo Yoga",
    studioWebsiteUrl: "https://collegeofsanmateo.edu/yoga/",
    studioScheduleUrl: "https://collegeofsanmateo.edu/yoga/",
    websiteUrl: "https://collegeofsanmateo.edu/yoga/",
    linkedinUrl: "https://www.linkedin.com/in/denaya-dailey-30b39b29/",
    instagramUrl: "https://www.instagram.com/denayadailey/",
    facebookUrl: "https://www.facebook.com/denayadoesyoga/",
    platformHoursBooked: 226,
    city: "San Mateo",
    serviceRadiusMiles: 25,
    training:
      "RYT-500 yoga instructor, MFA in Dance from Mills College, BFA from UCLA, and lead teacher for the Yoga Alliance 200-Hour Teacher Training Program at College of San Mateo.",
    experienceYears: 20,
    bio: `Denaya Dailey is a San Mateo-based yoga, dance, Pilates, and group fitness educator who has been teaching movement since 2006.

An Associate Professor in Kinesiology, Athletics and Dance at College of San Mateo, Denaya leads Vinyasa Flow classes with anatomical mindfulness and a playful spirit, encouraging students to challenge their edge while listening closely to what their bodies need.

She helped create both the Group Fitness and Yoga Teacher Training certificates at CSM and is known for classes that leave students feeling stress-free, body-aware, and invigorated while helping them find their own voice through movement.`,
    gender: "female",
    certificationStatus: "certified",
    published: true
  },
  {
    id: "teacher-6",
    userId: "user-teacher-6",
    slug: "blu-high",
    fullName: "Blu High",
    avatarUrl: null,
    studioName: "Peacebank Yoga Studio",
    studioWebsiteUrl: "https://www.peacebankyoga.com/",
    studioScheduleUrl: "https://peacebank-yoga.recess.tv/embed/checkout/explore?displayClass=list&hideMenu=true&splitLiveClassInSeparateTabs=false&class_type=LIVE&displayDays=5",
    websiteUrl: "https://www.blubayu.com/yoga",
    platformHoursBooked: 168,
    city: "Redwood City",
    serviceRadiusMiles: 25,
    training:
      "200-hour yoga teacher training at College of San Mateo in 2017, 300-hour training in India, with training in Vinyasa, Ashtanga, Hatha Yoga, Thai Massage, Reiki Level 2, and Ayurvedic Wellness Counseling.",
    experienceYears: 9,
    bio: `Blu High is a Peninsula-based yoga instructor teaching at Peacebank Yoga Studio in Redwood City and Yoga Source in Palo Alto.

Blu's practice began at age 15 and grew into a breath-centered teaching style shaped by Vinyasa, Rocket-inspired sequencing, and long holds that help students feel steady progress over time. Classes sync breath with music and movement, using a steady four-count rhythm that makes the practice feel both meditative and energizing.

Beyond weekly studio classes, Blu is involved with the College of San Mateo yoga community as a Yoga Teacher Training graduate and advisory-council member, bringing a grounded, holistic perspective informed by yoga, Thai massage, Reiki, and Ayurveda.`,
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
  },
  {
    id: "story-6",
    teacherId: "teacher-5",
    title: "Anatomically mindful flow",
    caption: "Denaya teaches Vinyasa Flow with a balance of precision, playfulness, and stress-relieving movement.",
    mediaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    mediaType: StoryMediaType.IMAGE,
    sortOrder: 1,
    published: true
  },
  {
    id: "story-7",
    teacherId: "teacher-5",
    title: "Movement education at CSM",
    caption: "Her teaching spans yoga, Pilates, dance, and group fitness while helping students find their own voice through movement.",
    mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    mediaType: StoryMediaType.IMAGE,
    sortOrder: 2,
    published: true
  },
  {
    id: "story-8",
    teacherId: "teacher-6",
    title: "4BEAT Vinyasa at Peacebank",
    caption: "Blu's Peacebank classes pair music and movement with a steady four-count breath for a grounded, energetic flow.",
    mediaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    mediaType: StoryMediaType.IMAGE,
    sortOrder: 1,
    published: true
  },
  {
    id: "story-9",
    teacherId: "teacher-6",
    title: "Rocket-inspired progression",
    caption: "Set sequences and longer holds help students track their growth while staying connected to breath over performance.",
    mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
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
    address: "300 Broadway, San Francisco, CA",
    eventTime: "6:30 PM",
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
  },
  {
    id: "event-denaya-vinyasa",
    teacherId: "teacher-5",
    hostId: null,
    title: "Vinyasa Flow Yoga at College of San Mateo",
    hostName: "College of San Mateo",
    eventUrl: "https://collegeofsanmateo.edu/yoga/faculty.asp",
    eventDate: makeDate(2, 10, 60).startsAt
  },
  {
    id: "event-denaya-training",
    teacherId: "teacher-5",
    hostId: null,
    title: "200-Hour Yoga Teacher Training Program",
    hostName: "College of San Mateo",
    eventUrl: "https://collegeofsanmateo.edu/yoga/",
    eventDate: makeDate(4, 14, 180).startsAt
  },
  {
    id: "event-blu-peacebank-evening",
    teacherId: "teacher-6",
    hostId: "host-peacebank-yoga-studio",
    title: "4BEAT Vinyasa",
    hostName: "Peacebank Yoga Studio",
    eventUrl: "https://peacebank-yoga.recess.tv/embed/checkout/explore?displayClass=list&hideMenu=true&splitLiveClassInSeparateTabs=false&class_type=LIVE&displayDays=5",
    eventDate: makeDate(2, 17, 60).startsAt
  },
  {
    id: "event-blu-peacebank-morning",
    teacherId: "teacher-6",
    hostId: "host-peacebank-yoga-studio",
    title: "4BEAT Vinyasa",
    hostName: "Peacebank Yoga Studio",
    eventUrl: "https://peacebank-yoga.recess.tv/embed/checkout/explore?displayClass=list&hideMenu=true&splitLiveClassInSeparateTabs=false&class_type=LIVE&displayDays=5",
    eventDate: makeDate(3, 9, 60).startsAt
  },
  {
    id: "event-blu-yogasource-heated",
    teacherId: "teacher-6",
    hostId: "host-yoga-source-palo-alto",
    title: "Heated Vinyasa",
    hostName: "Yoga Source Palo Alto",
    eventUrl: "https://yogasource.com/schedule/",
    eventDate: makeDate(6, 7, 60).startsAt
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
  { id: "hours-teacher-4-kids", teacherId: "teacher-4", category: "kids", totalHours: 18 },
  { id: "hours-teacher-5-studio", teacherId: "teacher-5", category: "studio", totalHours: 148 },
  { id: "hours-teacher-5-private", teacherId: "teacher-5", category: "private", totalHours: 38 },
  { id: "hours-teacher-5-corporate-events", teacherId: "teacher-5", category: "corporate-events", totalHours: 40 },
  { id: "hours-teacher-6-studio", teacherId: "teacher-6", category: "studio", totalHours: 124 },
  { id: "hours-teacher-6-private", teacherId: "teacher-6", category: "private", totalHours: 22 },
  { id: "hours-teacher-6-corporate-events", teacherId: "teacher-6", category: "corporate-events", totalHours: 14 }
];

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
  },
  {
    id: "calendar-denaya-1",
    teacherId: "teacher-5",
    offeringId: "offering-15",
    title: "Vinyasa Flow Yoga",
    description: "A fluid, anatomically mindful Vinyasa practice that encourages students to test their edge while honoring what their bodies need.",
    location: "College of San Mateo · San Mateo",
    ...makeDate(2, 10, 60),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://collegeofsanmateo.edu/yoga/faculty.asp",
    isBooked: false
  },
  {
    id: "calendar-denaya-2",
    teacherId: "teacher-5",
    offeringId: "offering-16",
    title: "200-Hour Yoga Teacher Training",
    description: "Comprehensive yoga teacher training at College of San Mateo covering practice, teaching methodology, anatomy, philosophy, and practicum.",
    location: "College of San Mateo · San Mateo",
    ...makeDate(4, 14, 180),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://collegeofsanmateo.edu/yoga/",
    isBooked: false
  },
  {
    id: "calendar-denaya-3",
    teacherId: "teacher-5",
    offeringId: "offering-17",
    title: "Private Yoga and Pilates Coaching",
    description: "Customized mindful movement sessions that blend yoga and Pilates with clear anatomical cues and supportive coaching.",
    location: "San Mateo / Peninsula",
    ...makeDate(6, 17, 60),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://directory.smccd.edu/directory_details.php?username=daileyd",
    isBooked: false
  },
  {
    id: "calendar-blu-1",
    teacherId: "teacher-6",
    offeringId: "offering-19",
    title: "4BEAT Vinyasa",
    description: "Breath-synced Vinyasa at Peacebank influenced by Rocket yoga, steady rhythm, and longer holds.",
    location: "Peacebank Yoga Studio · Redwood City",
    ...makeDate(2, 17, 60),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://peacebank-yoga.recess.tv/embed/checkout/explore?displayClass=list&hideMenu=true&splitLiveClassInSeparateTabs=false&class_type=LIVE&displayDays=5",
    isBooked: false
  },
  {
    id: "calendar-blu-2",
    teacherId: "teacher-6",
    offeringId: "offering-19",
    title: "4BEAT Vinyasa",
    description: "A morning Peacebank flow that uses music and breath pacing to create a meditative, all-levels Vinyasa practice.",
    location: "Peacebank Yoga Studio · Redwood City",
    ...makeDate(3, 9, 60),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://peacebank-yoga.recess.tv/embed/checkout/explore?displayClass=list&hideMenu=true&splitLiveClassInSeparateTabs=false&class_type=LIVE&displayDays=5",
    isBooked: false
  },
  {
    id: "calendar-blu-3",
    teacherId: "teacher-6",
    offeringId: "offering-20",
    title: "Heated Vinyasa",
    description: "Blu's Sunday Yoga Source class builds strength, flexibility, and balance through breath-led movement in a warm room.",
    location: "Yoga Source Palo Alto · Palo Alto",
    ...makeDate(6, 7, 60),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://yogasource.com/schedule/",
    isBooked: false
  },
  {
    id: "calendar-blu-4",
    teacherId: "teacher-6",
    offeringId: "offering-21",
    title: "Private Breath-Led Vinyasa",
    description: "Private sessions that blend Vinyasa and Hatha principles with breath awareness and incremental progression.",
    location: "Redwood City / Peninsula",
    ...makeDate(5, 13, 60),
    timezone: "America/Los_Angeles",
    sourceUrl: "https://www.peacebankyoga.com/instructors",
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
