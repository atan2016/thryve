import { addDays, addHours, addMinutes, startOfDay } from "date-fns";

import type {
  AdminContactInquiry,
  AppUser,
  AvailabilitySlot,
  Badge,
  Booking,
  CreditTransaction,
  CreditWallet,
  EventHost,
  UserEventHostFollow,
  UserTeacherFollow,
  UserTeacherHeart,
  Teacher,
  TeacherBadge,
  TeacherEarningsLedger,
  TeacherOffering,
  TeacherCalendarSession,
  TeacherPayoutAccount,
  CommunityDiscussion,
  TeacherStory,
  TeacherStyle,
  TeachingHourCounter,
  YogaStyle
} from "@/lib/types";

const today = startOfDay(new Date());

const makeSlot = (id: string, teacherId: string, dayOffset: number, hour: number, durationHours = 1): AvailabilitySlot => {
  const startsAt = addHours(addDays(today, dayOffset), hour);
  const endsAt = addMinutes(startsAt, durationHours * 60);

  return {
    id,
    teacherId,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    timezone: "America/Los_Angeles",
    isBooked: false
  };
};

export const serviceCategoryLabels = {
  studio: "Studio",
  private: "Private",
  "corporate-events": "Corporate / events",
  kids: "Kids",
  older: "Older"
} as const;

export const demoUsers: AppUser[] = [
  { id: "user-customer-1", email: "student@yoga.local", password: "password123", role: "customer", name: "Maya Student", emailVerifiedAt: today.toISOString() },
  { id: "user-teacher-1", email: "teacher@yoga.local", password: "password123", role: "teacher", name: "Ashley Tan", emailVerifiedAt: today.toISOString() },
  { id: "user-teacher-2", email: "teacher2@yoga.local", password: "password123", role: "teacher", name: "Kelly Heinrich", emailVerifiedAt: today.toISOString() },
  { id: "user-teacher-3", email: "kj.landis@yoga.local", password: "password123", role: "teacher", name: "KJ Landis", emailVerifiedAt: today.toISOString() },
  { id: "user-teacher-4", email: "robinjaffe@yoga.local", password: "password123", role: "teacher", name: "Robin Jaffe", emailVerifiedAt: today.toISOString() },
  { id: "user-teacher-5", email: "denayadailey@gmail.com", password: "password123", role: "teacher", name: "Denaya Dailey", emailVerifiedAt: today.toISOString() },
  { id: "user-teacher-6", email: "blu.high@yoga.local", password: "password123", role: "teacher", name: "Blu High", emailVerifiedAt: today.toISOString() },
  { id: "user-admin-1", email: "admin@yoga.local", password: "password123", role: "admin", name: "Jordan Admin", emailVerifiedAt: today.toISOString() }
];

export const demoEventHosts: EventHost[] = [
  {
    id: "host-j8-hot-pilates-yoga",
    name: "J8 Hot Pilates & Yoga",
    slug: "j8-hot-pilates-yoga",
    websiteUrl: "https://www.j8hotpilatesyoga.com/"
  },
  {
    id: "host-hot-yoga-plus-daly-city",
    name: "Hot Yoga Plus Daly City",
    slug: "hot-yoga-plus-daly-city",
    websiteUrl: "https://hotyogaplus-dc.com/"
  },
  {
    id: "host-good-living-health",
    name: "Good Living Health",
    slug: "good-living-health",
    websiteUrl: "https://www.robinjaffe.love/public-classes"
  },
  {
    id: "host-sunporch-yoga",
    name: "SunPorch Yoga",
    slug: "sunporch-yoga",
    websiteUrl: "https://fitlocalfit.com/Services/Sunporch-Yoga"
  },
  {
    id: "host-vennu-yoga",
    name: "Vennu Yoga",
    slug: "vennu-yoga",
    websiteUrl: "https://vennu-studio.com/book-a-class"
  },
  {
    id: "host-peacebank-yoga-studio",
    name: "Peacebank Yoga Studio",
    slug: "peacebank-yoga-studio",
    websiteUrl: "https://www.peacebankyoga.com/"
  },
  {
    id: "host-yoga-source-palo-alto",
    name: "Yoga Source Palo Alto",
    slug: "yoga-source-palo-alto",
    websiteUrl: "https://yogasource.com/"
  }
];

export const demoUserTeacherFollows: UserTeacherFollow[] = [
  {
    id: "follow-teacher-user-customer-1-teacher-1",
    userId: "user-customer-1",
    teacherId: "teacher-1",
    createdAt: today.toISOString()
  }
];

/** In-memory teacher hearts when DB table or Prisma client lacks `UserTeacherHeart`. */
export const demoUserTeacherHearts: UserTeacherHeart[] = [];

export const demoUserEventHostFollows: UserEventHostFollow[] = [
  {
    id: "follow-host-user-customer-1-host-hot-yoga-plus-daly-city",
    userId: "user-customer-1",
    hostId: "host-hot-yoga-plus-daly-city",
    createdAt: today.toISOString()
  }
];

export const demoAdminContactInquiries: AdminContactInquiry[] = [];

export const demoTeachers: Teacher[] = [
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
    facebookUrl: "https://www.facebook.com/xtan1",
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
    published: true,
    upcomingEvents: [
      {
        id: "event-kj-hot-yoga-plus",
        teacherId: "teacher-3",
        hostId: "host-hot-yoga-plus-daly-city",
        title: "Weekly teaching schedule",
        eventType: "Workshop",
        hostName: "Hot Yoga Plus Daly City",
        eventUrl: "https://www.hotyogaplus-dc.com/bikram-hot-yoga-daly-city-class-schedule/"
      }
    ]
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
    published: true,
    upcomingEvents: [
      {
        id: "event-robin-good-living",
        teacherId: "teacher-4",
        hostId: "host-good-living-health",
        title: "Embodied Yoga, Pilates and Meditation",
        eventType: "Workshop",
        hostName: "Good Living Health",
        eventUrl: "https://www.robinjaffe.love/_files/ugd/79180e_5c5798a1722d4638b9e44c0e1094d254.pdf",
        eventDate: makeSlot("event-robin-good-living-slot", "teacher-4", 3, 12, 0.75).startsAt
      },
      {
        id: "event-robin-sunporch",
        teacherId: "teacher-4",
        hostId: "host-sunporch-yoga",
        title: "Candlelight Yin Yoga",
        eventType: "Somatic Healing",
        hostName: "SunPorch Yoga",
        eventUrl: "https://fitlocalfit.com/Services/Sunporch-Yoga",
        eventDate: makeSlot("event-robin-sunporch-slot", "teacher-4", 3, 18).startsAt
      },
      {
        id: "event-robin-vennu",
        teacherId: "teacher-4",
        hostId: "host-vennu-yoga",
        title: "Trio3: Gentle Yoga Pilates and Meditation",
        eventType: "Workshop",
        hostName: "Vennu Yoga",
        eventUrl: "https://vennu-studio.com/book-a-class",
        eventDate: makeSlot("event-robin-vennu-slot", "teacher-4", 1, 11).startsAt
      }
    ]
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
    published: true,
    upcomingEvents: [
      {
        id: "event-denaya-vinyasa",
        teacherId: "teacher-5",
        title: "Vinyasa Flow Yoga at College of San Mateo",
        eventType: "Workshop",
        hostName: "College of San Mateo",
        eventUrl: "https://collegeofsanmateo.edu/yoga/faculty.asp"
      },
      {
        id: "event-denaya-training",
        teacherId: "teacher-5",
        title: "200-Hour Yoga Teacher Training Program",
        eventType: "Workshop",
        hostName: "College of San Mateo",
        eventUrl: "https://collegeofsanmateo.edu/yoga/"
      }
    ]
  },
  {
    id: "teacher-6",
    userId: "user-teacher-6",
    slug: "blu-high",
    fullName: "Blu High",
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
    published: true,
    upcomingEvents: [
      {
        id: "event-blu-peacebank-evening",
        teacherId: "teacher-6",
        hostId: "host-peacebank-yoga-studio",
        title: "4BEAT Vinyasa",
        eventType: "Workshop",
        hostName: "Peacebank Yoga Studio",
        eventUrl: "https://peacebank-yoga.recess.tv/embed/checkout/explore?displayClass=list&hideMenu=true&splitLiveClassInSeparateTabs=false&class_type=LIVE&displayDays=5",
        eventDate: makeSlot("event-blu-peacebank-evening-slot", "teacher-6", 2, 17).startsAt
      },
      {
        id: "event-blu-peacebank-morning",
        teacherId: "teacher-6",
        hostId: "host-peacebank-yoga-studio",
        title: "4BEAT Vinyasa",
        eventType: "Workshop",
        hostName: "Peacebank Yoga Studio",
        eventUrl: "https://peacebank-yoga.recess.tv/embed/checkout/explore?displayClass=list&hideMenu=true&splitLiveClassInSeparateTabs=false&class_type=LIVE&displayDays=5",
        eventDate: makeSlot("event-blu-peacebank-morning-slot", "teacher-6", 3, 9).startsAt
      },
      {
        id: "event-blu-yogasource-heated",
        teacherId: "teacher-6",
        hostId: "host-yoga-source-palo-alto",
        title: "Heated Vinyasa",
        eventType: "Workshop",
        hostName: "Yoga Source Palo Alto",
        eventUrl: "https://yogasource.com/schedule/",
        eventDate: makeSlot("event-blu-yogasource-heated-slot", "teacher-6", 6, 7).startsAt
      }
    ]
  }
];

export const demoBadges: Badge[] = [
  { id: "badge-1", name: "RYT-500", description: "Advanced 500-hour teacher training" },
  { id: "badge-2", name: "Kids Yoga", description: "Registered children's yoga school certification", imageUrl: "/assets/images/yoga_kids_certification.png" },
  { id: "badge-3", name: "Corporate Wellness", description: "Experienced in workplace and event facilitation" },
  { id: "badge-4", name: "Red Cross", description: "Red Cross verified credential", imageUrl: "/assets/images/red_cross_CPR.png" },
  { id: "badge-5", name: "200RYT", description: "Registered Yoga Teacher 200-hour certification", imageUrl: "/assets/images/200RYT_certification.jpeg" },
  { id: "badge-6", name: "Yin Yoga", description: "Yin Yoga certification", imageUrl: "/assets/images/Yin_Yoga_Certification_badge.jpeg" },
  { id: "badge-7", name: "Background Checked", description: "Background check verified", imageUrl: "/assets/images/background_checked.png" }
];

export const demoTeacherBadges: TeacherBadge[] = [
  { teacherId: "teacher-1", badgeId: "badge-4", verified: true },
  { teacherId: "teacher-1", badgeId: "badge-5", verified: true },
  { teacherId: "teacher-1", badgeId: "badge-7", verified: true },
  { teacherId: "teacher-1", badgeId: "badge-6", verified: true },
  { teacherId: "teacher-2", badgeId: "badge-2", verified: true },
  { teacherId: "teacher-2", badgeId: "badge-5", verified: true },
  { teacherId: "teacher-2", badgeId: "badge-6", verified: true },
  { teacherId: "teacher-3", badgeId: "badge-5", verified: true },
  { teacherId: "teacher-3", badgeId: "badge-6", verified: true },
  { teacherId: "teacher-4", badgeId: "badge-1", verified: true },
  { teacherId: "teacher-4", badgeId: "badge-2", verified: true },
  { teacherId: "teacher-4", badgeId: "badge-3", verified: true },
  { teacherId: "teacher-4", badgeId: "badge-6", verified: true },
  { teacherId: "teacher-5", badgeId: "badge-1", verified: true },
  { teacherId: "teacher-5", badgeId: "badge-3", verified: true },
  { teacherId: "teacher-6", badgeId: "badge-5", verified: true }
];

export const demoYogaStyles: YogaStyle[] = [
  { id: "style-1", name: "Vinyasa" },
  { id: "style-2", name: "Restorative" },
  { id: "style-3", name: "Hatha" },
  { id: "style-4", name: "Yin" },
  { id: "style-5", name: "Chair" },
  { id: "style-6", name: "26&2 Hot Yoga" },
  { id: "style-7", name: "Classic Pilates" },
  { id: "style-8", name: "Inferno Pilates" },
  { id: "style-9", name: "Meditation" },
  { id: "style-10", name: "Somatic Yoga" }
];

export const demoTeacherStyles: TeacherStyle[] = [
  { teacherId: "teacher-1", styleId: "style-1" },
  { teacherId: "teacher-1", styleId: "style-2" },
  { teacherId: "teacher-1", styleId: "style-4" },
  { teacherId: "teacher-1", styleId: "style-3" },
  { teacherId: "teacher-1", styleId: "style-5" },
  { teacherId: "teacher-2", styleId: "style-3" },
  { teacherId: "teacher-2", styleId: "style-4" },
  { teacherId: "teacher-3", styleId: "style-6" },
  { teacherId: "teacher-3", styleId: "style-7" },
  { teacherId: "teacher-3", styleId: "style-8" },
  { teacherId: "teacher-3", styleId: "style-4" },
  { teacherId: "teacher-3", styleId: "style-9" },
  { teacherId: "teacher-4", styleId: "style-10" },
  { teacherId: "teacher-4", styleId: "style-7" },
  { teacherId: "teacher-4", styleId: "style-4" },
  { teacherId: "teacher-4", styleId: "style-9" },
  { teacherId: "teacher-4", styleId: "style-2" },
  { teacherId: "teacher-5", styleId: "style-1" },
  { teacherId: "teacher-5", styleId: "style-7" },
  { teacherId: "teacher-5", styleId: "style-9" },
  { teacherId: "teacher-6", styleId: "style-1" },
  { teacherId: "teacher-6", styleId: "style-3" }
];

export const demoOfferings: TeacherOffering[] = [
  {
    id: "offering-1",
    teacherId: "teacher-1",
    category: "private",
    title: "Private flow session",
    description: "1:1 customized flow focused on mobility and strength.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 14,
    active: true
  },
  {
    id: "offering-2",
    teacherId: "teacher-1",
    category: "corporate-events",
    title: "Chair Yoga",
    description: "Accessible chair-supported movement focused on mobility, breath, and gentle strength.",
    deliveryMode: "online",
    sessionLengthMin: 45,
    creditPrice: 18,
    active: true
  },
  {
    id: "offering-3",
    teacherId: "teacher-1",
    category: "private",
    title: "Sensory Awakening",
    description: "A grounded in-person session designed to awaken the senses through movement, breath, and mindful presence.",
    deliveryMode: "in_person",
    sessionLengthMin: 90,
    creditPrice: 30,
    active: true
  },
  {
    id: "offering-4",
    teacherId: "teacher-2",
    category: "older",
    title: "Older adults mobility",
    description: "Gentle session tailored for stability and confidence.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 12,
    active: true
  },
  {
    id: "offering-5",
    teacherId: "teacher-2",
    category: "kids",
    title: "Kids storytelling yoga",
    description: "Creative movement and breath work for ages 6-10.",
    deliveryMode: "online",
    sessionLengthMin: 30,
    creditPrice: 10,
    active: true
  },
  {
    id: "offering-6",
    teacherId: "teacher-3",
    category: "studio",
    title: "26&2 Bikram Yoga",
    description: "Classic heated 26-posture Hatha series focused on alignment, focus, and full-body conditioning.",
    deliveryMode: "in_person",
    sessionLengthMin: 90,
    creditPrice: 18,
    active: true
  },
  {
    id: "offering-7",
    teacherId: "teacher-3",
    category: "studio",
    title: "Classic Hot Pilates",
    description: "Mat-based Pilates principles taught in a heated room for core strength and stamina.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 16,
    active: true
  },
  {
    id: "offering-8",
    teacherId: "teacher-3",
    category: "studio",
    title: "Restorative Yin Yoga",
    description: "Gentle, steady holds in a moderately heated room to restore the body and settle the mind.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 16,
    active: true
  },
  {
    id: "offering-9",
    teacherId: "teacher-3",
    category: "studio",
    title: "Meditation",
    description: "Guided stillness and breath awareness for grounding and self-reflection.",
    deliveryMode: "in_person",
    sessionLengthMin: 45,
    creditPrice: 12,
    active: true
  },
  {
    id: "offering-10",
    teacherId: "teacher-4",
    category: "studio",
    title: "Embodied Yoga, Pilates and Meditation",
    description: "A beginner-friendly somatic yoga and gentle Pilates class with optional breathwork and guided meditation to close.",
    deliveryMode: "in_person",
    sessionLengthMin: 45,
    creditPrice: 12,
    active: true
  },
  {
    id: "offering-11",
    teacherId: "teacher-4",
    category: "studio",
    title: "Candlelight Yin Yoga",
    description: "Grounding long-held floor postures using props to support deeper range of motion and a calm, meditative experience.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 14,
    active: true
  },
  {
    id: "offering-12",
    teacherId: "teacher-4",
    category: "studio",
    title: "Trio3: Gentle Yoga Pilates and Meditation",
    description: "A gentle strength-building class that blends yoga, Pilates-based core work, and guided meditation.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 14,
    active: true
  },
  {
    id: "offering-13",
    teacherId: "teacher-4",
    category: "corporate-events",
    title: "Workplace yoga, Pilates and meditation",
    description: "Stress regulation and resilience-building classes for schools, teams, community groups, and corporate wellness programs.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 18,
    active: true
  },
  {
    id: "offering-14",
    teacherId: "teacher-4",
    category: "private",
    title: "Private customized practice",
    description: "One-to-one sessions tailored to stress management, mobility, strength, and meditation for your individual needs.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 16,
    active: true
  },
  {
    id: "offering-15",
    teacherId: "teacher-5",
    category: "studio",
    title: "Vinyasa Flow Yoga",
    description: "A graceful, anatomically mindful Vinyasa Flow class that balances challenge, playfulness, and body awareness.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 14,
    active: true
  },
  {
    id: "offering-16",
    teacherId: "teacher-5",
    category: "studio",
    title: "200-Hour Yoga Teacher Training",
    description: "Foundational teacher training covering techniques, methodology, anatomy, philosophy, ethics, and practicum.",
    deliveryMode: "in_person",
    sessionLengthMin: 180,
    creditPrice: 30,
    active: true
  },
  {
    id: "offering-17",
    teacherId: "teacher-5",
    category: "private",
    title: "Private yoga and Pilates coaching",
    description: "Individualized sessions that blend yoga, Pilates, and mindful movement for strength, mobility, and confidence.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 16,
    active: true
  },
  {
    id: "offering-18",
    teacherId: "teacher-5",
    category: "corporate-events",
    title: "Group fitness and mindful movement",
    description: "Group classes for schools, studios, and wellness programs combining yoga, Pilates, and movement education.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 18,
    active: true
  },
  {
    id: "offering-19",
    teacherId: "teacher-6",
    category: "studio",
    title: "4BEAT Vinyasa",
    description: "Rocket-inspired Vinyasa that syncs a steady four-count breath with music and movement for an energizing, meditative flow.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 14,
    active: true
  },
  {
    id: "offering-20",
    teacherId: "teacher-6",
    category: "studio",
    title: "Heated Vinyasa",
    description: "A strong all-levels heated flow focused on breath rhythm, longer holds, and steady progression through set sequences.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 14,
    active: true
  },
  {
    id: "offering-21",
    teacherId: "teacher-6",
    category: "private",
    title: "Private breath-led Vinyasa",
    description: "One-to-one coaching centered on breath, mobility, and strength with a grounded Vinyasa and Hatha approach.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 16,
    active: true
  },
  {
    id: "offering-22",
    teacherId: "teacher-6",
    category: "corporate-events",
    title: "Community and studio pop-up flow",
    description: "Breath-centered group classes for studio communities, special events, and wellness gatherings.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 18,
    active: true
  }
];

export const demoStories: TeacherStory[] = [
  {
    id: "story-1",
    teacherId: "teacher-1",
    title: "Moonlit rooftop flow",
    caption: "A storytelling series built around breath, music, and sunset city views.",
    mediaUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    sortOrder: 1,
    published: true
  },
  {
    id: "story-2",
    teacherId: "teacher-1",
    title: "Founder story",
    caption: "Video intro explaining Ashley's teaching philosophy and training journey.",
    mediaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    mediaType: "video",
    sortOrder: 2,
    published: true
  },
  {
    id: "story-3",
    teacherId: "teacher-2",
    title: "Community chair yoga",
    caption: "A gentle series from a weekly community center class.",
    mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    sortOrder: 1,
    published: true
  },
  {
    id: "story-4",
    teacherId: "teacher-4",
    title: "The practice starts now",
    caption: "Robin’s teaching begins with regulation, choice, and meeting students exactly where they are.",
    mediaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    sortOrder: 1,
    published: true
  },
  {
    id: "story-5",
    teacherId: "teacher-4",
    title: "Candlelight Yin in San Francisco",
    caption: "A gentle evening practice with props, breath, and long-held shapes designed to soften stress and build resilience.",
    mediaUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    sortOrder: 2,
    published: true
  },
  {
    id: "story-6",
    teacherId: "teacher-5",
    title: "Anatomically mindful flow",
    caption: "Denaya teaches Vinyasa Flow with a balance of precision, playfulness, and stress-relieving movement.",
    mediaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    sortOrder: 1,
    published: true
  },
  {
    id: "story-7",
    teacherId: "teacher-5",
    title: "Movement education at CSM",
    caption: "Her teaching spans yoga, Pilates, dance, and group fitness while helping students find their own voice through movement.",
    mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    sortOrder: 2,
    published: true
  },
  {
    id: "story-8",
    teacherId: "teacher-6",
    title: "4BEAT Vinyasa at Peacebank",
    caption: "Blu's Peacebank classes pair music and movement with a steady four-count breath for a grounded, energetic flow.",
    mediaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    sortOrder: 1,
    published: true
  },
  {
    id: "story-9",
    teacherId: "teacher-6",
    title: "Rocket-inspired progression",
    caption: "Set sequences and longer holds help students track their growth while staying connected to breath over performance.",
    mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    sortOrder: 2,
    published: true
  }
];

export const demoAvailability: AvailabilitySlot[] = [
  makeSlot("slot-1", "teacher-1", 1, 9),
  makeSlot("slot-2", "teacher-1", 2, 13),
  makeSlot("slot-3", "teacher-1", 4, 17),
  makeSlot("slot-4", "teacher-2", 1, 11),
  makeSlot("slot-5", "teacher-2", 3, 15),
  makeSlot("slot-6", "teacher-2", 5, 10),
  makeSlot("slot-7", "teacher-3", 1, 9, 1.5),
  makeSlot("slot-8", "teacher-3", 2, 12),
  makeSlot("slot-9", "teacher-3", 3, 18),
  makeSlot("slot-10", "teacher-3", 5, 10, 0.75),
  makeSlot("slot-11", "teacher-3", 6, 16, 1.5),
  makeSlot("slot-12", "teacher-3", 7, 18),
  makeSlot("slot-13", "teacher-4", 1, 11),
  makeSlot("slot-14", "teacher-4", 3, 12, 0.75),
  makeSlot("slot-15", "teacher-4", 4, 15),
  makeSlot("slot-16", "teacher-5", 2, 10),
  makeSlot("slot-17", "teacher-5", 4, 14, 3),
  makeSlot("slot-18", "teacher-5", 6, 17),
  makeSlot("slot-19", "teacher-6", 2, 17),
  makeSlot("slot-20", "teacher-6", 3, 9),
  makeSlot("slot-21", "teacher-6", 6, 7),
  makeSlot("slot-22", "teacher-6", 5, 13)
];

export const demoCalendarSessions: TeacherCalendarSession[] = [
  {
    id: "calendar-kj-1",
    teacherId: "teacher-3",
    offeringId: "offering-6",
    title: "26&2 Bikram Yoga",
    description: "Classic heated 26-posture Hatha series focused on alignment, focus, and full-body conditioning.",
    location: "Hot Yoga Plus Daly City",
    startsAt: makeSlot("calendar-kj-1-slot", "teacher-3", 1, 9, 1.5).startsAt,
    endsAt: makeSlot("calendar-kj-1-slot", "teacher-3", 1, 9, 1.5).endsAt,
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
    startsAt: makeSlot("calendar-kj-2-slot", "teacher-3", 2, 12).startsAt,
    endsAt: makeSlot("calendar-kj-2-slot", "teacher-3", 2, 12).endsAt,
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
    startsAt: makeSlot("calendar-kj-3-slot", "teacher-3", 3, 18).startsAt,
    endsAt: makeSlot("calendar-kj-3-slot", "teacher-3", 3, 18).endsAt,
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
    startsAt: makeSlot("calendar-kj-4-slot", "teacher-3", 5, 10, 0.75).startsAt,
    endsAt: makeSlot("calendar-kj-4-slot", "teacher-3", 5, 10, 0.75).endsAt,
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
    startsAt: makeSlot("calendar-kj-5-slot", "teacher-3", 6, 16, 1.5).startsAt,
    endsAt: makeSlot("calendar-kj-5-slot", "teacher-3", 6, 16, 1.5).endsAt,
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
    startsAt: makeSlot("calendar-robin-1-slot", "teacher-4", 3, 12, 0.75).startsAt,
    endsAt: makeSlot("calendar-robin-1-slot", "teacher-4", 3, 12, 0.75).endsAt,
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
    startsAt: makeSlot("calendar-robin-2-slot", "teacher-4", 3, 18).startsAt,
    endsAt: makeSlot("calendar-robin-2-slot", "teacher-4", 3, 18).endsAt,
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
    startsAt: makeSlot("calendar-robin-3-slot", "teacher-4", 1, 11).startsAt,
    endsAt: makeSlot("calendar-robin-3-slot", "teacher-4", 1, 11).endsAt,
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
    startsAt: makeSlot("calendar-denaya-1-slot", "teacher-5", 2, 10).startsAt,
    endsAt: makeSlot("calendar-denaya-1-slot", "teacher-5", 2, 10).endsAt,
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
    startsAt: makeSlot("calendar-denaya-2-slot", "teacher-5", 4, 14, 3).startsAt,
    endsAt: makeSlot("calendar-denaya-2-slot", "teacher-5", 4, 14, 3).endsAt,
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
    startsAt: makeSlot("calendar-denaya-3-slot", "teacher-5", 6, 17).startsAt,
    endsAt: makeSlot("calendar-denaya-3-slot", "teacher-5", 6, 17).endsAt,
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
    startsAt: makeSlot("calendar-blu-1-slot", "teacher-6", 2, 17).startsAt,
    endsAt: makeSlot("calendar-blu-1-slot", "teacher-6", 2, 17).endsAt,
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
    startsAt: makeSlot("calendar-blu-2-slot", "teacher-6", 3, 9).startsAt,
    endsAt: makeSlot("calendar-blu-2-slot", "teacher-6", 3, 9).endsAt,
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
    startsAt: makeSlot("calendar-blu-3-slot", "teacher-6", 6, 7).startsAt,
    endsAt: makeSlot("calendar-blu-3-slot", "teacher-6", 6, 7).endsAt,
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
    startsAt: makeSlot("calendar-blu-4-slot", "teacher-6", 5, 13).startsAt,
    endsAt: makeSlot("calendar-blu-4-slot", "teacher-6", 5, 13).endsAt,
    timezone: "America/Los_Angeles",
    sourceUrl: "https://www.peacebankyoga.com/instructors",
    isBooked: false
  }
];

export const demoBookings: Booking[] = [
  {
    id: "booking-1",
    customerId: "user-customer-1",
    teacherId: "teacher-1",
    offeringId: "offering-1",
    slotId: "slot-history-1",
    notes: "Focus on posture after long desk days.",
    status: "completed",
    paymentStatus: "paid",
    startsAt: addHours(addDays(today, -4), 10).toISOString(),
    endsAt: addHours(addDays(today, -4), 11).toISOString(),
    creditsSpent: 14
  }
];

export const demoWallets: CreditWallet[] = [
  { userId: "user-customer-1", balance: 48 }
];

export const demoTransactions: CreditTransaction[] = [
  {
    id: "txn-1",
    userId: "user-customer-1",
    amount: 50,
    type: "purchase",
    createdAt: addDays(today, -6).toISOString(),
    reference: "initial-top-up"
  },
  {
    id: "txn-2",
    userId: "user-customer-1",
    amount: -14,
    type: "spend",
    createdAt: addDays(today, -4).toISOString(),
    reference: "booking-1"
  }
];

export const demoEarnings: TeacherEarningsLedger[] = [
  {
    id: "earn-1",
    teacherId: "teacher-1",
    bookingId: "booking-1",
    grossCredits: 14,
    platformCommission: 3,
    netCredits: 11,
    payoutStatus: "paid",
    payoutBatchRef: "manual-payout-apr-week1"
  }
];

export const demoPayoutAccounts: TeacherPayoutAccount[] = [
  {
    teacherId: "teacher-1",
    provider: "stripe-connect",
    providerAccountId: "",
    onboardingComplete: false
  }
];

export const demoTeachingHours: TeachingHourCounter[] = [
  { teacherId: "teacher-1", category: "private", totalHours: 8 },
  { teacherId: "teacher-1", category: "older", totalHours: 5 },
  { teacherId: "teacher-1", category: "kids", totalHours: 1 },
  { teacherId: "teacher-2", category: "studio", totalHours: 18 },
  { teacherId: "teacher-2", category: "private", totalHours: 44 },
  { teacherId: "teacher-2", category: "corporate-events", totalHours: 8 },
  { teacherId: "teacher-2", category: "kids", totalHours: 84 },
  { teacherId: "teacher-2", category: "older", totalHours: 110 },
  { teacherId: "teacher-4", category: "studio", totalHours: 186 },
  { teacherId: "teacher-4", category: "private", totalHours: 54 },
  { teacherId: "teacher-4", category: "corporate-events", totalHours: 42 },
  { teacherId: "teacher-4", category: "kids", totalHours: 18 },
  { teacherId: "teacher-5", category: "studio", totalHours: 148 },
  { teacherId: "teacher-5", category: "private", totalHours: 38 },
  { teacherId: "teacher-5", category: "corporate-events", totalHours: 40 },
  { teacherId: "teacher-6", category: "studio", totalHours: 124 },
  { teacherId: "teacher-6", category: "private", totalHours: 22 },
  { teacherId: "teacher-6", category: "corporate-events", totalHours: 14 }
];

export const demoCommunityDiscussions: CommunityDiscussion[] = [
  {
    id: "discussion-1",
    authorName: "Ashley Tan",
    authorRole: "teacher",
    title: "What helps you stay consistent with your practice?",
    body:
      "I would love to hear how people keep a rhythm with movement and breath when life gets busy. Do short daily sessions help more than longer weekend practices?",
    tags: ["practice", "habits"],
    createdAt: addDays(today, -2).toISOString(),
    replyCount: 6
  },
  {
    id: "discussion-2",
    authorName: "Maya Student",
    authorRole: "member",
    title: "Favorite restorative props for home sessions",
    body:
      "I am building a cozy home setup and would love recommendations for bolsters, blocks, blankets, or other props that make restorative sessions feel more supportive.",
    tags: ["restorative", "home-practice"],
    createdAt: addDays(today, -1).toISOString(),
    replyCount: 4
  },
  {
    id: "discussion-3",
    authorName: "Jordan Admin",
    authorRole: "admin",
    title: "Welcome to the Thryve community forum",
    body:
      "Use this space to ask questions, swap wellness ideas, share resources, and connect with teachers and members across the platform.",
    tags: ["welcome", "community"],
    createdAt: today.toISOString(),
    replyCount: 2
  }
];
