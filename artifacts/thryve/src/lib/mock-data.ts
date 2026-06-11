import { addDays, addHours, addMinutes, startOfDay } from "date-fns";
import type { Teacher, TeacherOffering, Badge, TeacherBadge, HomepageEventCard, HomepageJobCard } from "./types";

const today = startOfDay(new Date());

const makeSlotDate = (dayOffset: number, hour: number, durationHours = 1) => {
  const startsAt = addHours(addDays(today, dayOffset), hour);
  addMinutes(startsAt, durationHours * 60);
  return startsAt.toISOString();
};

export const serviceCategoryLabels: Record<string, string> = {
  studio: "Studio",
  private: "Private",
  "corporate-events": "Corporate / events",
  kids: "Kids",
  older: "Older"
};

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
    bio: `Hi, I'm Ashley Tan. I've been practicing yoga for over 25 years, but my journey really began in Chengdu, China, where I spent most of my childhood.

Growing up drinking green tea every day, it feels natural for me to bring together all the things I love—yoga, tea, and movement. This blend is at the heart of my practice, creating a space that is calming, accessible, and thoughtfully designed for every individual.

Whether you need support in a seat, depth in stillness, or rhythm in movement, sessions are built around your needs and energy—so practice stays grounded, approachable, and truly yours.`,
    gender: "female",
    certificationStatus: "certified",
    published: true,
    styles: ["Vinyasa", "Restorative", "Yin", "Hatha", "Chair"]
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
    published: true,
    styles: ["Hatha", "Yin"]
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
    styles: ["26&2 Hot Yoga", "Classic Pilates", "Inferno Pilates", "Yin", "Meditation"],
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
    training: "E-RYT 500 and YACEP through Yoga Alliance, Mat Pilates training through College of San Mateo, 50-hour Yin Yoga with Bernie Clark.",
    experienceYears: 27,
    bio: `Robin Jaffe is a Bay Area yoga, Pilates, and meditation instructor whose teaching blends regulation, resilience, and accessible movement for all bodies and all levels.

For more than 27 years, Robin has studied practices that balance strength and relaxation, effort and ease. Her classes focus on managing stress and anxiety while offering just the right amount of challenge to build confidence, mobility, and steadiness.`,
    gender: "female",
    certificationStatus: "certified",
    published: true,
    styles: ["Somatic Yoga", "Classic Pilates", "Yin", "Meditation", "Restorative"],
    upcomingEvents: [
      {
        id: "event-robin-good-living",
        teacherId: "teacher-4",
        hostId: "host-good-living-health",
        title: "Embodied Yoga, Pilates and Meditation",
        eventType: "Workshop",
        hostName: "Good Living Health",
        eventUrl: "https://www.robinjaffe.love/_files/ugd/79180e_5c5798a1722d4638b9e44c0e1094d254.pdf",
        eventDate: makeSlotDate(3, 12)
      }
    ]
  },
  {
    id: "teacher-5",
    userId: "user-teacher-5",
    slug: "denaya-dailey",
    fullName: "Denaya Dailey",
    avatarUrl: "https://yaprofileimages.blob.core.windows.net/profileimage/10349/8733152B-FD34-4F19-BAEA-830422E39A1E.jpg",
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
    training: "RYT-500 yoga instructor, MFA in Dance from Mills College, BFA from UCLA.",
    experienceYears: 20,
    bio: `Denaya Dailey is a San Mateo-based yoga, dance, Pilates, and group fitness educator who has been teaching movement since 2006.

An Associate Professor in Kinesiology, Athletics and Dance at College of San Mateo, Denaya leads Vinyasa Flow classes with anatomical mindfulness and a playful spirit.`,
    gender: "female",
    certificationStatus: "certified",
    published: true,
    styles: ["Vinyasa", "Classic Pilates", "Meditation"]
  },
  {
    id: "teacher-6",
    userId: "user-teacher-6",
    slug: "blu-high",
    fullName: "Blu High",
    studioName: "Peacebank Yoga Studio",
    studioWebsiteUrl: "https://www.peacebankyoga.com/",
    studioScheduleUrl: "https://peacebank-yoga.recess.tv/embed/checkout/explore",
    websiteUrl: "https://www.blubayu.com/yoga",
    platformHoursBooked: 168,
    city: "Redwood City",
    serviceRadiusMiles: 25,
    training: "200-hour yoga teacher training at College of San Mateo in 2017, 300-hour training in India.",
    experienceYears: 9,
    bio: `Blu High is a Peninsula-based yoga instructor teaching at Peacebank Yoga Studio in Redwood City and Yoga Source in Palo Alto.

Blu's practice began at age 15 and grew into a breath-centered teaching style shaped by Vinyasa, Rocket-inspired sequencing, and long holds that help students feel steady progress over time.`,
    gender: "male",
    certificationStatus: "certified",
    published: true,
    styles: ["Vinyasa", "Hatha"]
  },
  {
    id: "teacher-7",
    userId: "user-teacher-7",
    slug: "michelle-li",
    fullName: "Michelle Li",
    studioName: "Peninsula Mindful Movement",
    studioWebsiteUrl: "https://collegeofsanmateo.edu/yoga/",
    websiteUrl: "https://collegeofsanmateo.edu/yoga/",
    platformHoursBooked: 120,
    city: "San Mateo",
    serviceRadiusMiles: 20,
    training: "200-hour Yoga Teacher Training (YTT) with advanced study in Yin Yoga, plus ongoing training in Tai Chi.",
    experienceYears: 8,
    bio: "Michelle Li offers gentle Yin yoga, Tai Chi–informed flow, and breath-centered practices that build mobility, calm, and steady energy for everyday life.",
    gender: "female",
    certificationStatus: "certified",
    published: true,
    styles: ["Tai Chi", "Yin"],
    certificationSubmissions: [
      {
        id: "cert-mock-michelle-red-cross-cpr",
        teacherId: "teacher-7",
        credentialName: "Red Cross CPR",
        fileUrl: "/api/teacher-certification-submissions/cert-mock-michelle-red-cross-cpr/file",
        fileName: "cpr-certificate.pdf",
        mimeType: "application/pdf",
        status: "approved",
        reviewedAt: addDays(today, -14).toISOString(),
        createdAt: addDays(today, -20).toISOString()
      },
      {
        id: "cert-mock-michelle-200-ryt",
        teacherId: "teacher-7",
        credentialName: "200 RYT",
        fileUrl: "/api/teacher-certification-submissions/cert-mock-michelle-200-ryt/file",
        fileName: "ryt-certificate.pdf",
        mimeType: "application/pdf",
        status: "approved",
        reviewedAt: addDays(today, -12).toISOString(),
        createdAt: addDays(today, -18).toISOString()
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
    description: "Accessible chair-supported movement.",
    deliveryMode: "online",
    sessionLengthMin: 45,
    creditPrice: 18,
    active: true
  },
  {
    id: "offering-3",
    teacherId: "teacher-3",
    category: "studio",
    title: "26&2 Hot Yoga",
    description: "Traditional Bikram-style heated yoga sequence.",
    deliveryMode: "in_person",
    sessionLengthMin: 90,
    creditPrice: 12,
    active: true
  },
  {
    id: "offering-4",
    teacherId: "teacher-4",
    category: "private",
    title: "Private Yoga & Meditation",
    description: "Personalized yoga, Pilates, and meditation session.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 20,
    active: true
  },
  {
    id: "offering-5",
    teacherId: "teacher-6",
    category: "studio",
    title: "4BEAT Vinyasa",
    description: "Breath-synchronized Vinyasa flow set to music.",
    deliveryMode: "in_person",
    sessionLengthMin: 60,
    creditPrice: 10,
    active: true
  }
];

export const demoHomepageEvents: HomepageEventCard[] = [
  {
    id: "event-1",
    title: "Embodied Yoga, Pilates and Meditation",
    host: "Robin Jaffe",
    hostId: "host-good-living-health",
    category: "Workshop",
    imageSrc: "/assets/images/pilates-studio-v-sit.png",
    imageAlt: "Yoga and Pilates workshop",
    dateRange: "Multiple dates",
    detail: "Peninsula & San Francisco",
    location: "Bay Area, CA",
    href: "https://www.robinjaffe.love/public-classes",
    external: true,
    featuredLabel: "Featured"
  },
  {
    id: "event-2",
    title: "4BEAT Vinyasa at Peacebank",
    host: "Blu High",
    hostId: "host-peacebank-yoga-studio",
    category: "Workshop",
    imageSrc: "/assets/images/pilates-group-class.png",
    imageAlt: "Vinyasa yoga class",
    dateRange: "Weekly",
    detail: "Evenings & mornings",
    location: "Redwood City, CA",
    href: "https://peacebank-yoga.recess.tv",
    external: true
  },
  {
    id: "event-3",
    title: "200-Hour Yoga Teacher Training",
    host: "Denaya Dailey",
    category: "Workshop",
    imageSrc: "/assets/images/csm-ytt-graduation-card.png",
    imageAlt: "Yoga teacher training",
    dateRange: "Ongoing enrollment",
    detail: "College of San Mateo",
    location: "San Mateo, CA",
    href: "https://collegeofsanmateo.edu/yoga/",
    external: true,
    featuredLabel: "Training"
  }
];

export const demoHomepageJobs: HomepageJobCard[] = [];

export function getTeacherWithDetails(teacher: Teacher) {
  const badges = demoTeacherBadges
    .filter((tb) => tb.teacherId === teacher.id)
    .map((tb) => {
      const badge = demoBadges.find((b) => b.id === tb.badgeId);
      return badge ? { name: badge.name, verified: tb.verified, imageUrl: badge.imageUrl } : null;
    })
    .filter(Boolean) as Array<{ name: string; verified: boolean; imageUrl?: string }>;

  const offerings = demoOfferings.filter((o) => o.teacherId === teacher.id && o.active);

  return { ...teacher, badges, offerings };
}

export function searchTeachers(filters: {
  category?: string;
  style?: string;
  certified?: string;
  gender?: string;
  deliveryMode?: string;
  city?: string;
}) {
  let teachers = demoTeachers.filter((t) => t.published);

  if (filters.category) {
    const offeringsForCategory = demoOfferings.filter((o) => o.category === filters.category && o.active);
    const teacherIds = new Set(offeringsForCategory.map((o) => o.teacherId));
    teachers = teachers.filter((t) => teacherIds.has(t.id));
  }

  if (filters.style) {
    const styleLower = filters.style.toLowerCase();
    teachers = teachers.filter((t) => t.styles?.some((s) => s.toLowerCase().includes(styleLower)));
  }

  if (filters.certified) {
    teachers = teachers.filter((t) => t.certificationStatus === filters.certified);
  }

  if (filters.gender) {
    teachers = teachers.filter((t) => t.gender === filters.gender);
  }

  if (filters.city) {
    const cityLower = filters.city.toLowerCase();
    teachers = teachers.filter((t) => t.city.toLowerCase().includes(cityLower));
  }

  return teachers.map((t) => getTeacherWithDetails(t));
}
