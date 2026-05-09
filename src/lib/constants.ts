import type { EndangermentLevel, UserRole } from '@/generated/prisma'

// ─── Communities ──────────────────────────────────────────────────────────────

export interface CommunityConstant {
  id: string
  name: string
  slug: string
  description: string
  colorPrimary: string
  colorSecondary: string
  region: string
  totalSpeakers: number
  preservationScore: number
  icon: string
  endangermentLevel: EndangermentLevel
  languages: string[]
}

export const COMMUNITIES: CommunityConstant[] = [
  {
    id: 'lepcha',
    name: 'Lepcha',
    slug: 'lepcha',
    description:
      'The Lepcha (Róng) are the earliest known inhabitants of Sikkim. Their unique script, Róng script, is one of the few indigenous writing systems of the Himalayan region. The Lepcha people maintain a deep spiritual connection with their natural surroundings, embodied in their concept of Mayel Lyang — the hidden paradise.',
    colorPrimary: '#16A34A',
    colorSecondary: '#15803D',
    region: 'North & West Sikkim',
    totalSpeakers: 50000,
    preservationScore: 35,
    icon: '🌿',
    endangermentLevel: 'ENDANGERED',
    languages: ['Lepcha (Róng)', 'Róng script'],
  },
  {
    id: 'bhutia',
    name: 'Bhutia',
    slug: 'bhutia',
    description:
      'The Bhutia (Lhopos) are Tibetan-origin people who migrated to Sikkim between the 13th and 16th centuries. They brought with them Tibetan Buddhism, the Tibetan script (now used for the Sikkimese Bhutia language), and a rich tradition of monastery arts, thangka painting, and ritual dance known as Cham.',
    colorPrimary: '#DC2626',
    colorSecondary: '#B91C1C',
    region: 'East & North Sikkim',
    totalSpeakers: 70000,
    preservationScore: 48,
    icon: '🏔️',
    endangermentLevel: 'VULNERABLE',
    languages: ['Sikkimese (Drenjongke)', 'Tibetan script'],
  },
  {
    id: 'limbu',
    name: 'Limbu',
    slug: 'limbu',
    description:
      'The Limbu (Yakthung) people are one of the indigenous nationalities of eastern Nepal and Sikkim, known as Kirat. They possess the Sirijonga script, developed in the 18th century. Their Mundhum oral scripture is a vast body of cosmological and ritual knowledge passed down through generations of Phedangma priests.',
    colorPrimary: '#D97706',
    colorSecondary: '#B45309',
    region: 'East Sikkim & Kalimpong',
    totalSpeakers: 400000,
    preservationScore: 52,
    icon: '🌄',
    endangermentLevel: 'VULNERABLE',
    languages: ['Limbu (Yakthung Pan)', 'Sirijonga script'],
  },
  {
    id: 'tamang',
    name: 'Tamang',
    slug: 'tamang',
    description:
      'The Tamang are one of the largest indigenous communities in the eastern Himalayan region. Deeply rooted in Bon-Buddhist traditions, they are known for their distinctive Tamang Selo folk music, traditional dance, and their role as traders and farmers across the mountain passes. Their oral literature preserves ancient cosmological narratives.',
    colorPrimary: '#7C3AED',
    colorSecondary: '#6D28D9',
    region: 'West & South Sikkim',
    totalSpeakers: 1500000,
    preservationScore: 61,
    icon: '🥁',
    endangermentLevel: 'VULNERABLE',
    languages: ['Tamang', 'Tibetan script (adapted)'],
  },
  {
    id: 'rai',
    name: 'Rai (Kirati)',
    slug: 'rai',
    description:
      'The Rai people are a group of Kirati peoples indigenous to eastern Nepal and Sikkim. They speak numerous mutually unintelligible languages collectively called Rai languages, each an independent linguistic system. The Rai Mundhum, transmitted orally by Bijuwa shamans, contains detailed accounts of creation, nature spirits, and ancestral memory.',
    colorPrimary: '#0891B2',
    colorSecondary: '#0E7490',
    region: 'East Sikkim',
    totalSpeakers: 650000,
    preservationScore: 44,
    icon: '🌾',
    endangermentLevel: 'VULNERABLE',
    languages: ['Bantawa', 'Chamling', 'Kulung', 'Thulung', 'Yamphu'],
  },
  {
    id: 'gurung',
    name: 'Gurung',
    slug: 'gurung',
    description:
      'The Gurung (Tamu) people trace their origins to the Annapurna and Manaslu regions. Their Pye-ta Lhu-ta oral tradition is a 100,000-verse narrative epic recited during Ghyabre death rituals, making it one of the longest oral traditions still actively performed. The Tamu Pye script is being revived by dedicated scholars.',
    colorPrimary: '#BE185D',
    colorSecondary: '#9D174D',
    region: 'West Sikkim',
    totalSpeakers: 500000,
    preservationScore: 41,
    icon: '🏞️',
    endangermentLevel: 'VULNERABLE',
    languages: ['Gurung (Tamu Kyui)', 'Tamu Pye script'],
  },
  {
    id: 'sherpa',
    name: 'Sherpa',
    slug: 'sherpa',
    description:
      'The Sherpa people originally migrated from the Kham region of Tibet to the Himalayas around the 15th century. Renowned for their intimate knowledge of high-altitude mountain terrain, the Sherpa also maintain rich Buddhist traditions, elaborate monastic festivals like Mani Rimdu, and a distinct dialect of Tibetan with its own literary heritage.',
    colorPrimary: '#2563EB',
    colorSecondary: '#1D4ED8',
    region: 'North Sikkim',
    totalSpeakers: 150000,
    preservationScore: 55,
    icon: '⛰️',
    endangermentLevel: 'VULNERABLE',
    languages: ['Sherpa (Sherpali)', 'Tibetan script'],
  },
  {
    id: 'mangar',
    name: 'Mangar',
    slug: 'mangar',
    description:
      'The Mangar (Magar) people are among the oldest documented inhabitants of the Himalayan foothills. Their Dhami-Jhankri shamanic tradition interweaves ancestor veneration, nature spirits, and healing rituals. The Magar language, part of the Tibeto-Burman family, exists in two mutually unintelligible dialect clusters — Eastern and Western — each preserving distinct vocabulary and phonology.',
    colorPrimary: '#059669',
    colorSecondary: '#047857',
    region: 'West & South Sikkim',
    totalSpeakers: 700000,
    preservationScore: 39,
    icon: '🌺',
    endangermentLevel: 'ENDANGERED',
    languages: ['Eastern Magar', 'Western Magar'],
  },
  {
    id: 'newar',
    name: 'Newar',
    slug: 'newar',
    description:
      'The Newar are the indigenous inhabitants of the Kathmandu Valley and have established trading communities across the Himalayan belt including Sikkim. They bear one of the most elaborate living cultural traditions in Asia — the Nepal Bhasa language has a written history spanning over a millennium, with classical texts in poetry, drama, and medicine. Their Newa:  calendar and 64+ annual festivals form an unbroken civilizational thread.',
    colorPrimary: '#EA580C',
    colorSecondary: '#C2410C',
    region: 'Gangtok & Urban Sikkim',
    totalSpeakers: 1300000,
    preservationScore: 67,
    icon: '🏛️',
    endangermentLevel: 'VULNERABLE',
    languages: ['Nepal Bhasa (Newari)', 'Pracalit script', 'Ranjana script'],
  },
  {
    id: 'sunwar',
    name: 'Sunwar',
    slug: 'sunwar',
    description:
      'The Sunwar (Koĩts) people inhabit the Sunkoshi river valley and surrounding areas of eastern Nepal and Sikkim. Their Koĩts language belongs to the Mahakiranti group of Tibeto-Burman languages. Sunwar oral literature includes elaborate ritual narratives transmitted by Nakcong priests, and their distinctive copper and brasswork tradition represents centuries of craft heritage.',
    colorPrimary: '#CA8A04',
    colorSecondary: '#A16207',
    region: 'East Sikkim',
    totalSpeakers: 40000,
    preservationScore: 28,
    icon: '⚒️',
    endangermentLevel: 'ENDANGERED',
    languages: ['Sunwar (Koĩts-Sunwar)'],
  },
]

// ─── Roles ────────────────────────────────────────────────────────────────────

export const ROLES: Record<UserRole, string> = {
  PUBLIC_USER: 'Public User',
  CONTRIBUTOR: 'Contributor',
  MODERATOR: 'Moderator',
  COMMUNITY_PRESIDENT: 'Community President',
  GOVERNMENT_OFFICER: 'Government Officer',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  PUBLIC_USER: 'Browse and learn from community content',
  CONTRIBUTOR: 'Submit words, stories, songs, and recordings',
  MODERATOR: 'Review and approve community submissions',
  COMMUNITY_PRESIDENT: 'Manage community settings and members',
  GOVERNMENT_OFFICER: 'Access preservation reports and analytics',
  ADMIN: 'Platform-wide administration',
  SUPER_ADMIN: 'Full system access and configuration',
}

// ─── Lesson Types ─────────────────────────────────────────────────────────────

export const LESSON_TYPES = {
  VOCABULARY: {
    label: 'Vocabulary',
    description: 'Learn words and their meanings',
    icon: '📖',
    color: 'bg-blue-100 text-blue-800',
  },
  GRAMMAR: {
    label: 'Grammar',
    description: 'Understand sentence structure and rules',
    icon: '✏️',
    color: 'bg-purple-100 text-purple-800',
  },
  PRONUNCIATION: {
    label: 'Pronunciation',
    description: 'Practice speaking and listening',
    icon: '🎙️',
    color: 'bg-green-100 text-green-800',
  },
  SCRIPT: {
    label: 'Script',
    description: 'Learn the indigenous writing system',
    icon: '🖊️',
    color: 'bg-orange-100 text-orange-800',
  },
  CULTURE: {
    label: 'Culture',
    description: 'Explore traditions, festivals, and heritage',
    icon: '🎭',
    color: 'bg-red-100 text-red-800',
  },
} as const

// ─── Achievement Types ────────────────────────────────────────────────────────

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  xpRequired: number
  type: string
}

export const ACHIEVEMENT_TYPES: AchievementDefinition[] = [
  {
    id: 'first-word',
    name: 'First Word',
    description: 'Learned your very first word in an indigenous language. Every great journey begins with a single word.',
    icon: '🌱',
    xpRequired: 10,
    type: 'MILESTONE',
  },
  {
    id: 'story-collector',
    name: 'Story Collector',
    description: 'Contributed 5 traditional stories to the cultural archive. You are keeping the oral tradition alive.',
    icon: '📚',
    xpRequired: 500,
    type: 'CONTRIBUTION',
  },
  {
    id: 'voice-master',
    name: 'Voice Master',
    description: 'Recorded 50 pronunciation samples with a score above 80%. Your voice carries the language forward.',
    icon: '🎙️',
    xpRequired: 800,
    type: 'SKILL',
  },
  {
    id: 'script-scholar',
    name: 'Script Scholar',
    description: 'Completed all handwriting exercises for an indigenous script. You have mastered the art of ancestral writing.',
    icon: '✍️',
    xpRequired: 1200,
    type: 'SKILL',
  },
  {
    id: 'cultural-guide',
    name: 'Cultural Guide',
    description: 'Shared knowledge about 10 festivals or cultural practices. You are a living bridge to heritage.',
    icon: '🏮',
    xpRequired: 1500,
    type: 'CONTRIBUTION',
  },
  {
    id: 'streak-champion',
    name: 'Streak Champion',
    description: 'Maintained a 30-day learning streak without interruption. Consistency is the hallmark of dedication.',
    icon: '🔥',
    xpRequired: 300,
    type: 'STREAK',
  },
  {
    id: 'community-builder',
    name: 'Community Builder',
    description: 'Actively participated across 3 different indigenous communities. You build bridges between peoples.',
    icon: '🤝',
    xpRequired: 2000,
    type: 'SOCIAL',
  },
  {
    id: 'heritage-guardian',
    name: 'Heritage Guardian',
    description: 'Contributed over 100 approved items to the cultural archive. You are a guardian of living heritage.',
    icon: '🛡️',
    xpRequired: 5000,
    type: 'CONTRIBUTION',
  },
  {
    id: 'language-hero',
    name: 'Language Hero',
    description: 'Completed an entire language course from beginner to advanced. A true champion of linguistic diversity.',
    icon: '🏆',
    xpRequired: 10000,
    type: 'MILESTONE',
  },
  {
    id: 'elders-blessing',
    name: "Elder's Blessing",
    description: 'Recognized by a community elder for outstanding contribution to cultural preservation. The highest honour.',
    icon: '🙏',
    xpRequired: 25000,
    type: 'SPECIAL',
  },
]

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon: string
  activeIcon: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: 'Home',
    activeIcon: 'HomeIcon',
  },
  {
    label: 'Learn',
    href: '/learn',
    icon: 'BookOpen',
    activeIcon: 'BookOpenIcon',
  },
  {
    label: 'Communities',
    href: '/communities',
    icon: 'Users',
    activeIcon: 'UsersIcon',
  },
  {
    label: 'Archive',
    href: '/archive',
    icon: 'Archive',
    activeIcon: 'ArchiveIcon',
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: 'User',
    activeIcon: 'UserIcon',
  },
]

// ─── Endangerment Levels ──────────────────────────────────────────────────────

export const ENDANGERMENT_LEVELS: Record<EndangermentLevel, { label: string; color: string; bgColor: string }> = {
  SAFE: {
    label: 'Safe',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
  },
  VULNERABLE: {
    label: 'Vulnerable',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  ENDANGERED: {
    label: 'Endangered',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  CRITICALLY_ENDANGERED: {
    label: 'Critically Endangered',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  EXTINCT: {
    label: 'Extinct',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
}

// ─── Content Status ───────────────────────────────────────────────────────────

export const CONTENT_STATUS = {
  PENDING: {
    label: 'Pending Review',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: '⏳',
  },
  APPROVED: {
    label: 'Approved',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    icon: '✅',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '❌',
  },
} as const

// ─── Story Types ──────────────────────────────────────────────────────────────

export const STORY_TYPES = {
  FOLKTALE: { label: 'Folk Tale', icon: '🌙' },
  MYTH: { label: 'Myth', icon: '⚡' },
  LEGEND: { label: 'Legend', icon: '🗡️' },
  HISTORY: { label: 'History', icon: '📜' },
  ORAL_HISTORY: { label: 'Oral History', icon: '🗣️' },
} as const

// ─── Video Types ──────────────────────────────────────────────────────────────

export const VIDEO_TYPES = {
  LESSON: { label: 'Lesson', icon: '🎓' },
  CULTURAL: { label: 'Cultural', icon: '🎭' },
  DOCUMENTARY: { label: 'Documentary', icon: '🎬' },
  FESTIVAL: { label: 'Festival', icon: '🎉' },
  RITUAL: { label: 'Ritual', icon: '🕯️' },
} as const

// ─── Recording Types ──────────────────────────────────────────────────────────

export const RECORDING_TYPES = {
  WORD: { label: 'Word', icon: '🔤' },
  PHRASE: { label: 'Phrase', icon: '💬' },
  SENTENCE: { label: 'Sentence', icon: '📝' },
  STORY: { label: 'Story', icon: '📖' },
  SONG: { label: 'Song', icon: '🎵' },
  RITUAL: { label: 'Ritual Chant', icon: '🕯️' },
} as const

// ─── Course Levels ────────────────────────────────────────────────────────────

export const COURSE_LEVELS = {
  BEGINNER: {
    label: 'Beginner',
    description: 'No prior knowledge required',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    description: 'Basic familiarity with the language',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  ADVANCED: {
    label: 'Advanced',
    description: 'Strong grasp of language fundamentals',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
} as const

// ─── XP Rewards ──────────────────────────────────────────────────────────────

export const XP_REWARDS = {
  COMPLETE_LESSON: 10,
  PERFECT_QUIZ: 25,
  QUIZ_CORRECT: 5,
  DAILY_STREAK: 15,
  SUBMIT_WORD: 20,
  SUBMIT_STORY: 50,
  SUBMIT_RECORDING: 30,
  SUBMIT_SONG: 40,
  SUBMIT_VIDEO: 45,
  CONTENT_APPROVED: 100,
  PRONUNCIATION_PERFECT: 20,
  HANDWRITING_A_PLUS: 25,
  FIRST_LOGIN: 50,
} as const

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// ─── Sikkim Regions ───────────────────────────────────────────────────────────

export const SIKKIM_REGIONS = [
  'North Sikkim',
  'South Sikkim',
  'East Sikkim',
  'West Sikkim',
  'Gangtok & Urban Sikkim',
  'North & West Sikkim',
  'East & North Sikkim',
  'East Sikkim & Kalimpong',
  'West & South Sikkim',
] as const

// ─── App Metadata ─────────────────────────────────────────────────────────────

export const APP_NAME = 'SIKKIMVERSE'
export const APP_TAGLINE = 'Preserving Indigenous Voices, One Story at a Time'
export const APP_DESCRIPTION =
  'A digital platform for preserving and celebrating the indigenous languages and cultural heritage of Sikkim\'s diverse communities.'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sikkimverse.org'
