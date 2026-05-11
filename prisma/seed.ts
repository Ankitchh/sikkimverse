/**
 * SIKKIMVERSE Database Seed Script
 *
 * Populates the database with real cultural data for Sikkim's indigenous communities.
 * Run with: npx tsx prisma/seed.ts  (or `npm run seed`)
 */

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

function resolveConnectionString(): string {
  if (process.env.DIRECT_DATABASE_URL) return process.env.DIRECT_DATABASE_URL
  const url = process.env.DATABASE_URL ?? ''
  if (url.startsWith('prisma+postgres://')) {
    try {
      const apiKey = new URL(url).searchParams.get('api_key') ?? ''
      const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString('utf8'))
      if (decoded.databaseUrl) return decoded.databaseUrl
    } catch { /* fall through */ }
  }
  return url || 'postgresql://localhost:5432/sikkimverse'
}

const connectionString = resolveConnectionString()
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// ─── Helper ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting SIKKIMVERSE database seed...\n')

  // ─── Clean existing data ─────────────────────────────────────────────────────
  console.log('🗑️  Clearing existing data...')
  await prisma.pronunciationAttempt.deleteMany()
  await prisma.handwritingAttempt.deleteMany()
  await prisma.userAchievement.deleteMany()
  await prisma.quizAttempt.deleteMany()
  await prisma.userProgress.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.course.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.word.deleteMany()
  await prisma.story.deleteMany()
  await prisma.song.deleteMany()
  await prisma.video.deleteMany()
  await prisma.recording.deleteMany()
  await prisma.festival.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.communityEarning.deleteMany()
  await prisma.dialect.deleteMany()
  await prisma.language.deleteMany()
  await prisma.paymentEvent.deleteMany()
  await prisma.userSubscription.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  await prisma.revenueShare.deleteMany()
  await prisma.emailVerificationToken.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.contentEmbedding.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.community.deleteMany()
  console.log('✅ Cleared existing data\n')

  // ─── Create Communities ───────────────────────────────────────────────────────
  console.log('🏘️  Creating communities...')

  const communityData = [
    {
      name: 'Lepcha',
      slug: 'lepcha',
      description:
        'The Lepcha (Róng) are the earliest known inhabitants of Sikkim. Their unique script, Róng script, is one of the few indigenous writing systems of the Himalayan region. The Lepcha people maintain a deep spiritual connection with their natural surroundings, embodied in their concept of Mayel Lyang — the hidden paradise.',
      colorPrimary: '#16A34A',
      colorSecondary: '#15803D',
      region: 'North & West Sikkim',
      totalSpeakers: 50000,
      preservationScore: 35,
    },
    {
      name: 'Bhutia',
      slug: 'bhutia',
      description:
        'The Bhutia (Lhopos) are Tibetan-origin people who migrated to Sikkim between the 13th and 16th centuries. They brought with them Tibetan Buddhism, the Tibetan script, and a rich tradition of monastery arts, thangka painting, and ritual dance known as Cham.',
      colorPrimary: '#DC2626',
      colorSecondary: '#B91C1C',
      region: 'East & North Sikkim',
      totalSpeakers: 70000,
      preservationScore: 48,
    },
    {
      name: 'Limbu',
      slug: 'limbu',
      description:
        'The Limbu (Yakthung) people are one of the indigenous nationalities of eastern Nepal and Sikkim, known as Kirat. They possess the Sirijonga script, developed in the 18th century. Their Mundhum oral scripture is a vast body of cosmological and ritual knowledge.',
      colorPrimary: '#D97706',
      colorSecondary: '#B45309',
      region: 'East Sikkim & Kalimpong',
      totalSpeakers: 400000,
      preservationScore: 52,
    },
    {
      name: 'Tamang',
      slug: 'tamang',
      description:
        'The Tamang are one of the largest indigenous communities in the eastern Himalayan region. Deeply rooted in Bon-Buddhist traditions, they are known for their distinctive Tamang Selo folk music, traditional dance, and their role as traders across the mountain passes.',
      colorPrimary: '#7C3AED',
      colorSecondary: '#6D28D9',
      region: 'West & South Sikkim',
      totalSpeakers: 1500000,
      preservationScore: 61,
    },
    {
      name: 'Rai',
      slug: 'rai',
      description:
        'The Rai people are a group of Kirati peoples indigenous to eastern Nepal and Sikkim. They speak numerous mutually unintelligible languages collectively called Rai languages. The Rai Mundhum, transmitted orally by Bijuwa shamans, contains detailed accounts of creation and ancestral memory.',
      colorPrimary: '#0891B2',
      colorSecondary: '#0E7490',
      region: 'East Sikkim',
      totalSpeakers: 650000,
      preservationScore: 44,
    },
    {
      name: 'Gurung',
      slug: 'gurung',
      description:
        'The Gurung (Tamu) people trace their origins to the Annapurna and Manaslu regions. Their Pye-ta Lhu-ta oral tradition is a 100,000-verse narrative epic recited during Ghyabre death rituals, making it one of the longest oral traditions still actively performed.',
      colorPrimary: '#BE185D',
      colorSecondary: '#9D174D',
      region: 'West Sikkim',
      totalSpeakers: 500000,
      preservationScore: 41,
    },
    {
      name: 'Sherpa',
      slug: 'sherpa',
      description:
        'The Sherpa people originally migrated from the Kham region of Tibet around the 15th century. Renowned for their intimate knowledge of high-altitude terrain, the Sherpa also maintain rich Buddhist traditions, elaborate monastic festivals like Mani Rimdu, and a distinct dialect of Tibetan.',
      colorPrimary: '#2563EB',
      colorSecondary: '#1D4ED8',
      region: 'North Sikkim',
      totalSpeakers: 150000,
      preservationScore: 55,
    },
    {
      name: 'Mangar',
      slug: 'mangar',
      description:
        'The Mangar (Magar) people are among the oldest documented inhabitants of the Himalayan foothills. Their Dhami-Jhankri shamanic tradition interweaves ancestor veneration, nature spirits, and healing rituals. The Magar language exists in two dialect clusters — Eastern and Western.',
      colorPrimary: '#059669',
      colorSecondary: '#047857',
      region: 'West & South Sikkim',
      totalSpeakers: 700000,
      preservationScore: 39,
    },
    {
      name: 'Newar',
      slug: 'newar',
      description:
        'The Newar are the indigenous inhabitants of the Kathmandu Valley with established trading communities across Sikkim. They bear one of the most elaborate living cultural traditions in Asia — Nepal Bhasa has a written history spanning over a millennium, with classical texts in poetry, drama, and medicine.',
      colorPrimary: '#EA580C',
      colorSecondary: '#C2410C',
      region: 'Gangtok & Urban Sikkim',
      totalSpeakers: 1300000,
      preservationScore: 67,
    },
    {
      name: 'Sunwar',
      slug: 'sunwar',
      description:
        'The Sunwar (Koĩts) people inhabit the Sunkoshi river valley of eastern Nepal and Sikkim. Their Koĩts language belongs to the Mahakiranti group of Tibeto-Burman languages. Sunwar oral literature includes elaborate ritual narratives transmitted by Nakcong priests.',
      colorPrimary: '#CA8A04',
      colorSecondary: '#A16207',
      region: 'East Sikkim',
      totalSpeakers: 40000,
      preservationScore: 28,
    },
  ]

  const communities: Record<string, { id: string; name: string; slug: string }> = {}

  for (const data of communityData) {
    const community = await prisma.community.create({ data })
    communities[data.slug] = community
    console.log(`  ✅ Community: ${community.name}`)
  }

  // ─── Create Languages ─────────────────────────────────────────────────────────
  console.log('\n🗣️  Creating languages...')

  const languageData = [
    {
      communitySlug: 'lepcha',
      name: 'Lepcha (Róng)',
      code: 'lep',
      scriptType: 'Róng Script',
      description: 'The Lepcha language, also known as Róng, is a Tibeto-Burman language spoken primarily in Sikkim, parts of West Bengal, and Nepal. It has its own unique indigenous script called the Róng script, which is written from left to right.',
      speakerCount: 50000,
      endangermentLevel: 'ENDANGERED' as const,
    },
    {
      communitySlug: 'bhutia',
      name: 'Sikkimese (Drenjongke)',
      code: 'sip',
      scriptType: 'Tibetan Script',
      description: 'Drenjongke, or Sikkimese, is the Bhutia language spoken in Sikkim. It uses the Tibetan script and shares many features with Tibetan while maintaining distinctive Sikkimese vocabulary and grammar.',
      speakerCount: 70000,
      endangermentLevel: 'VULNERABLE' as const,
    },
    {
      communitySlug: 'limbu',
      name: 'Limbu (Yakthung Pan)',
      code: 'lif',
      scriptType: 'Sirijonga Script',
      description: 'The Limbu language, known as Yakthung Pan, is a Tibeto-Burman language with its own Sirijonga script developed in the 18th century. It is spoken by the Limbu people in eastern Nepal and Sikkim.',
      speakerCount: 400000,
      endangermentLevel: 'VULNERABLE' as const,
    },
    {
      communitySlug: 'tamang',
      name: 'Tamang',
      code: 'taj',
      scriptType: 'Tibetan Script (adapted)',
      description: 'Tamang is a Tibeto-Burman language spoken by the Tamang people of Nepal and Sikkim. It uses an adapted form of the Tibetan script and has several dialects across different regions.',
      speakerCount: 1500000,
      endangermentLevel: 'VULNERABLE' as const,
    },
    {
      communitySlug: 'rai',
      name: 'Bantawa',
      code: 'bap',
      scriptType: 'Devanagari',
      description: 'Bantawa is one of the major Rai languages spoken in eastern Nepal and Sikkim. It belongs to the Kiranti branch of the Sino-Tibetan language family.',
      speakerCount: 380000,
      endangermentLevel: 'VULNERABLE' as const,
    },
    {
      communitySlug: 'gurung',
      name: 'Gurung (Tamu Kyui)',
      code: 'gvr',
      scriptType: 'Tamu Pye Script',
      description: 'Gurung, known as Tamu Kyui, is a Tibeto-Burman language spoken by the Gurung people in Nepal and Sikkim. The Tamu Pye script is an indigenous script being actively revived by scholars.',
      speakerCount: 500000,
      endangermentLevel: 'VULNERABLE' as const,
    },
    {
      communitySlug: 'sherpa',
      name: 'Sherpa (Sherpali)',
      code: 'xsr',
      scriptType: 'Tibetan Script',
      description: 'The Sherpa language, known as Sherpali or Sherpa Tibetan, is a dialect of Tibetan with distinctive Sherpa vocabulary. It uses the Tibetan script and is spoken mainly in Nepal and North Sikkim.',
      speakerCount: 150000,
      endangermentLevel: 'VULNERABLE' as const,
    },
    {
      communitySlug: 'mangar',
      name: 'Eastern Magar',
      code: 'mgp',
      scriptType: 'Devanagari',
      description: 'Eastern Magar is one of the two major dialect clusters of the Magar language, belonging to the Tibeto-Burman language family. It is spoken in eastern regions of Nepal and Sikkim.',
      speakerCount: 350000,
      endangermentLevel: 'ENDANGERED' as const,
    },
    {
      communitySlug: 'newar',
      name: 'Nepal Bhasa (Newari)',
      code: 'new',
      scriptType: 'Pracalit Script',
      description: 'Nepal Bhasa, commonly known as Newari, is a Tibeto-Burman language with a rich literary tradition spanning over a millennium. It uses the Pracalit script and has significant status as a classical language.',
      speakerCount: 1300000,
      endangermentLevel: 'VULNERABLE' as const,
    },
    {
      communitySlug: 'sunwar',
      name: 'Sunwar (Koĩts)',
      code: 'suv',
      scriptType: 'Devanagari',
      description: 'Sunwar (Koĩts-Sunwar) is a Tibeto-Burman language spoken by the Sunwar people in the Sunkoshi river valley of Nepal and Sikkim. It belongs to the Mahakiranti language group.',
      speakerCount: 40000,
      endangermentLevel: 'ENDANGERED' as const,
    },
  ]

  const languages: Record<string, string> = {} // code -> id

  for (const data of languageData) {
    const { communitySlug, ...langData } = data
    const communityId = communities[communitySlug].id
    const language = await prisma.language.create({
      data: { ...langData, communityId },
    })
    languages[data.code] = language.id
    console.log(`  ✅ Language: ${language.name}`)
  }

  // ─── Create Admin User ────────────────────────────────────────────────────────
  console.log('\n👤 Creating admin user...')
  const passwordHash = await bcrypt.hash('Admin@123', 12)

  const adminUser = await prisma.user.create({
    data: {
      name: 'SIKKIMVERSE Admin',
      email: 'admin@sikkimverse.com',
      passwordHash,
      role: 'ADMIN',
      xp: 10000,
      streak: 30,
      emailVerified: new Date(),
    },
  })
  console.log(`  ✅ Admin: ${adminUser.email}`)

  // Create a contributor user for seeding content
  const contributorUser = await prisma.user.create({
    data: {
      name: 'Tashi Wangchuk',
      email: 'contributor@sikkimverse.com',
      passwordHash: await bcrypt.hash('Contributor@123', 12),
      role: 'CONTRIBUTOR',
      communityId: communities['lepcha'].id,
      xp: 2500,
      streak: 7,
      emailVerified: new Date(),
    },
  })
  console.log(`  ✅ Contributor: ${contributorUser.email}`)

  // ─── Create Demo Accounts (all password: Demo@123) ────────────────────────────
  console.log('\n🎭 Creating demo accounts...')
  const demoHash = await bcrypt.hash('Demo@123', 12)

  const demoUsers = [
    {
      name: 'Demo Student',
      email: 'student@sikkimverse.demo',
      role: 'PUBLIC_USER' as const,
      communityId: null,
      xp: 150,
      streak: 3,
    },
    {
      name: 'Demo Contributor',
      email: 'contributor@sikkimverse.demo',
      role: 'CONTRIBUTOR' as const,
      communityId: communities['lepcha'].id,
      xp: 2200,
      streak: 12,
    },
    {
      name: 'Demo Moderator',
      email: 'moderator@sikkimverse.demo',
      role: 'MODERATOR' as const,
      communityId: communities['bhutia'].id,
      xp: 5400,
      streak: 21,
    },
    {
      name: 'Demo Community President',
      email: 'president@sikkimverse.demo',
      role: 'COMMUNITY_PRESIDENT' as const,
      communityId: communities['limbu'].id,
      xp: 8800,
      streak: 45,
    },
    {
      name: 'Demo Government Officer',
      email: 'govt@sikkimverse.demo',
      role: 'GOVERNMENT_OFFICER' as const,
      communityId: null,
      xp: 3100,
      streak: 9,
    },
    {
      name: 'Demo Admin',
      email: 'admin@sikkimverse.demo',
      role: 'ADMIN' as const,
      communityId: null,
      xp: 12000,
      streak: 60,
    },
    {
      name: 'Demo Super Admin',
      email: 'superadmin@sikkimverse.demo',
      role: 'SUPER_ADMIN' as const,
      communityId: null,
      xp: 25000,
      streak: 90,
    },
  ]

  for (const u of demoUsers) {
    await prisma.user.create({
      data: {
        ...u,
        passwordHash: demoHash,
        emailVerified: new Date(),
      },
    })
    console.log(`  ✅ ${u.role}: ${u.email}`)
  }

  // ─── Create Courses ───────────────────────────────────────────────────────────
  console.log('\n📚 Creating courses...')

  const lepchaLanguageId = languages['lep']
  const bhutiaLanguageId = languages['sip']
  const limbuLanguageId = languages['lif']

  const courseData = [
    {
      title: 'Lepcha for Beginners',
      description:
        'Start your journey into the ancient Lepcha (Róng) language. Learn basic greetings, numbers, colours, and everyday vocabulary in one of the Himalayan region\'s most unique indigenous languages. This course introduces the Róng script alongside spoken language.',
      communityId: communities['lepcha'].id,
      languageId: lepchaLanguageId,
      level: 'BEGINNER' as const,
      isPublished: true,
      totalLessons: 5,
    },
    {
      title: 'Bhutia Essentials',
      description:
        'Explore the rich Sikkimese Bhutia language (Drenjongke), spoken by the Buddhist Lhopo community. Learn foundational vocabulary, Buddhist terminology, and cultural expressions used in daily life and monastic settings.',
      communityId: communities['bhutia'].id,
      languageId: bhutiaLanguageId,
      level: 'BEGINNER' as const,
      isPublished: true,
      totalLessons: 5,
    },
    {
      title: 'Limbu Script & Language',
      description:
        'Master the beautiful Sirijonga script of the Limbu people and learn foundational Yakthung Pan vocabulary. This course covers script writing, phonology, and introductory grammar with cultural context from the Kirat tradition.',
      communityId: communities['limbu'].id,
      languageId: limbuLanguageId,
      level: 'BEGINNER' as const,
      isPublished: true,
      totalLessons: 5,
    },
  ]

  const courses: string[] = []
  for (const data of courseData) {
    const course = await prisma.course.create({ data })
    courses.push(course.id)
    console.log(`  ✅ Course: ${course.title}`)
  }

  // ─── Create Lessons ───────────────────────────────────────────────────────────
  console.log('\n📖 Creating lessons...')

  const lepchaLessons = [
    {
      title: 'Greetings & Introductions',
      description: 'Learn essential Lepcha greetings and how to introduce yourself in the Róng language.',
      order: 1,
      type: 'VOCABULARY' as const,
      xpReward: 15,
      estimatedMinutes: 12,
      isPublished: true,
      content: {
        sections: [
          {
            id: 's1',
            type: 'text',
            content: 'Welcome to your first Lepcha lesson! The Lepcha people, known as the Róng, are the original inhabitants of Sikkim. Their language carries the spirit of Mayel Lyang — the hidden paradise.',
          },
          {
            id: 's2',
            type: 'text',
            content: 'In Lepcha, greetings often reflect the community\'s respect for nature and elders.',
          },
        ],
        vocabulary: [
          { word: 'Ka-zo', meaning: 'Hello / Greetings', pronunciation: 'ka-zo', exampleSentence: 'Ka-zo! Aling kat? (Hello! How are you?)' },
          { word: 'Aling kat?', meaning: 'How are you?', pronunciation: 'ah-ling kat', exampleSentence: 'Ka-zo! Aling kat?' },
          { word: 'Ka-tak shing', meaning: 'I am well', pronunciation: 'ka-tak shing', exampleSentence: 'Ka-tak shing. Thenkyoo!' },
          { word: 'Nyu-rem', meaning: 'My name is...', pronunciation: 'nyoo-rem', exampleSentence: 'Nyu-rem Tashi.' },
          { word: 'Tak-shing', meaning: 'Thank you', pronunciation: 'tak-shing', exampleSentence: 'Tak-shing ang!' },
        ],
        culturalNotes: 'When greeting elders in Lepcha culture, it is customary to lower your head slightly as a sign of respect. The Lepcha people believe that each greeting carries the spiritual energy of Mayel Lyang.',
      },
    },
    {
      title: 'Numbers 1–20',
      description: 'Count in Lepcha and learn how numbers are used in daily life.',
      order: 2,
      type: 'VOCABULARY' as const,
      xpReward: 12,
      estimatedMinutes: 10,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'Lepcha numbers have a rich history connected to the community\'s traditional calendar and agricultural practices.' },
        ],
        vocabulary: [
          { word: 'Kat', meaning: 'One (1)', pronunciation: 'kat' },
          { word: 'Nyat', meaning: 'Two (2)', pronunciation: 'nyat' },
          { word: 'Sum', meaning: 'Three (3)', pronunciation: 'sum' },
          { word: 'Li', meaning: 'Four (4)', pronunciation: 'lee' },
          { word: 'Ngo', meaning: 'Five (5)', pronunciation: 'ngo' },
          { word: 'Truk', meaning: 'Six (6)', pronunciation: 'trook' },
          { word: 'Kun', meaning: 'Seven (7)', pronunciation: 'koon' },
          { word: 'Gyet', meaning: 'Eight (8)', pronunciation: 'gyet' },
          { word: 'Gu', meaning: 'Nine (9)', pronunciation: 'goo' },
          { word: 'Tong-ka', meaning: 'Ten (10)', pronunciation: 'tong-ka' },
        ],
      },
    },
    {
      title: 'Nature & Environment',
      description: 'Discover Lepcha words for nature — the foundation of Róng spiritual life.',
      order: 3,
      type: 'VOCABULARY' as const,
      xpReward: 18,
      estimatedMinutes: 15,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'The Lepcha people have an extraordinarily rich vocabulary for the natural world. Mayel Lyang, the sacred hidden land, is understood through the language of forests, rivers, and mountains.' },
        ],
        vocabulary: [
          { word: 'Tum', meaning: 'River / Water', pronunciation: 'toom', exampleSentence: 'Tum kazi kat. (The river is one.)' },
          { word: 'Byung', meaning: 'Forest / Jungle', pronunciation: 'byoong' },
          { word: 'Sa-rim', meaning: 'Mountain', pronunciation: 'sa-rim' },
          { word: 'Ting-lyang', meaning: 'Sky', pronunciation: 'ting-lyang' },
          { word: 'Sa', meaning: 'Earth / Ground', pronunciation: 'sa' },
        ],
        culturalNotes: 'For the Lepcha, nature is not merely the environment — it is a living spiritual entity. Every tree, river, and mountain has its own spirit (Rum). This is reflected in the language where natural objects often have gender and animacy markers.',
      },
    },
    {
      title: 'The Róng Script — Consonants',
      description: 'Begin learning the unique Lepcha (Róng) writing system.',
      order: 4,
      type: 'SCRIPT' as const,
      xpReward: 25,
      estimatedMinutes: 20,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'The Róng script is written from left to right and was reportedly created by Thikung Men Salóng, a Lepcha sage, around the 17th century. It is an abugida — each consonant carries an inherent vowel "a" that is modified by vowel diacritics.' },
          { id: 's2', type: 'text', content: 'The script has 34 consonant letters and is considered one of the most beautiful scripts of the Himalayan region.' },
        ],
        scriptExercises: [
          { character: 'ᰀ', strokes: 3 },
          { character: 'ᰁ', strokes: 4 },
          { character: 'ᰂ', strokes: 3 },
          { character: 'ᰃ', strokes: 5 },
          { character: 'ᰄ', strokes: 4 },
        ],
        culturalNotes: 'The Róng script was traditionally used to write sacred Lepcha texts including ritual prayers and the Blessum (sacred hymns). Mastering the script is considered a form of cultural guardianship.',
      },
    },
    {
      title: 'Lepcha Culture & Festivals',
      description: 'Explore the rich festivals and cultural practices of the Lepcha people.',
      order: 5,
      type: 'CULTURE' as const,
      xpReward: 20,
      estimatedMinutes: 18,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'The Lepcha calendar is built around agricultural cycles and nature spirits. Their festivals celebrate the harmony between humans and the natural world of Mayel Lyang.' },
          { id: 's2', type: 'text', content: 'Tendong Lho Rum Faat is the most important Lepcha festival, celebrated in August. It honors the sacred Mount Tendong, which the Lepcha believe saved their ancestors from a great flood.' },
        ],
        vocabulary: [
          { word: 'Rum', meaning: 'Nature spirit', pronunciation: 'room' },
          { word: 'Mun', meaning: 'Lepcha shaman / priest', pronunciation: 'moon' },
          { word: 'Tendong', meaning: 'Sacred mountain (Tendong Hill)', pronunciation: 'ten-dong' },
          { word: 'Mayel Lyang', meaning: 'Hidden paradise / sacred land', pronunciation: 'may-el lyang' },
        ],
        culturalNotes: 'The Mun (shaman) plays a central role in Lepcha spiritual life, mediating between humans and the Rum (nature spirits). This oral tradition of knowledge transmission is facing challenges as younger generations move to urban areas.',
      },
    },
  ]

  for (const lesson of lepchaLessons) {
    await prisma.lesson.create({
      data: { ...lesson, courseId: courses[0] },
    })
  }
  console.log(`  ✅ Created 5 lessons for Lepcha for Beginners`)

  const bhutiaLessons = [
    {
      title: 'Basic Bhutia Greetings',
      description: 'Learn essential greetings in Drenjongke, the Sikkimese Bhutia language.',
      order: 1,
      type: 'VOCABULARY' as const,
      xpReward: 15,
      estimatedMinutes: 12,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'Drenjongke is the language of the Bhutia (Lhopo) community of Sikkim. It carries centuries of Buddhist wisdom and the cultural heritage of Tibetan-Sikkimese civilization.' },
        ],
        vocabulary: [
          { word: 'Tashi Delek', meaning: 'Auspicious greetings / Hello', pronunciation: 'ta-shi de-lek', exampleSentence: 'Tashi Delek! (Auspicious greetings!)' },
          { word: 'Karang Kuzu Zangpo La', meaning: 'How are you? (formal)', pronunciation: 'ka-rang ku-zu zang-po la' },
          { word: 'Nga Legso Yod', meaning: 'I am well', pronunciation: 'nga leg-so yod' },
          { word: 'Thukcheche', meaning: 'Thank you', pronunciation: 'thook-che-che' },
          { word: 'Karang Gi Tsen Ka Re Red?', meaning: 'What is your name?', pronunciation: 'ka-rang gi tsen ka re red' },
        ],
        culturalNotes: 'Tashi Delek is both a greeting and a blessing. The phrase literally means "auspicious signs" and reflects the deeply Buddhist worldview of the Bhutia people.',
      },
    },
    {
      title: 'Buddhist Terminology',
      description: 'Learn essential Buddhist vocabulary used in Sikkimese Bhutia culture.',
      order: 2,
      type: 'CULTURE' as const,
      xpReward: 20,
      estimatedMinutes: 18,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'Buddhism is central to Bhutia identity and the Drenjongke language is rich with Buddhist terminology inherited from the Tibetan tradition.' },
        ],
        vocabulary: [
          { word: 'Gonpa', meaning: 'Monastery', pronunciation: 'gon-pa' },
          { word: 'Lama', meaning: 'Buddhist teacher / monk', pronunciation: 'la-ma' },
          { word: 'Chorten', meaning: 'Buddhist stupa', pronunciation: 'chor-ten' },
          { word: 'Cham', meaning: 'Ritual masked dance', pronunciation: 'cham' },
          { word: 'Thangka', meaning: 'Scroll painting depicting Buddhist imagery', pronunciation: 'thang-ka' },
        ],
      },
    },
    {
      title: 'Family & Relationships',
      description: 'Learn Bhutia words for family members and relationships.',
      order: 3,
      type: 'VOCABULARY' as const,
      xpReward: 12,
      estimatedMinutes: 10,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'Family structure is important in Bhutia culture, and the language has precise terms for different family relationships.' },
        ],
        vocabulary: [
          { word: 'Pala', meaning: 'Father', pronunciation: 'pa-la' },
          { word: 'Ama', meaning: 'Mother', pronunciation: 'a-ma' },
          { word: 'Phu', meaning: 'Elder brother', pronunciation: 'phoo' },
          { word: 'Nani', meaning: 'Elder sister', pronunciation: 'na-ni' },
          { word: 'Bu', meaning: 'Son', pronunciation: 'boo' },
          { word: 'Bumu', meaning: 'Daughter', pronunciation: 'boo-moo' },
        ],
      },
    },
    {
      title: 'Tibetan Script for Bhutia',
      description: 'Introduction to the Tibetan script used to write Drenjongke.',
      order: 4,
      type: 'SCRIPT' as const,
      xpReward: 25,
      estimatedMinutes: 22,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'The Bhutia language is written using the Tibetan script (Uchen script for printed text). The script is an abugida written left to right, with 30 consonant letters.' },
        ],
        scriptExercises: [
          { character: 'ཀ', strokes: 2 },
          { character: 'ཁ', strokes: 3 },
          { character: 'ག', strokes: 3 },
          { character: 'ང', strokes: 4 },
          { character: 'ཅ', strokes: 3 },
        ],
        culturalNotes: 'The Tibetan script was created by Thonmi Sambhota in the 7th century CE, commissioned by the emperor Songtsen Gampo. It remains the primary script for Tibetan Buddhism across the Himalayan world.',
      },
    },
    {
      title: 'Sikkim Bhutia Festivals',
      description: 'Explore the major festivals celebrated by the Sikkimese Bhutia community.',
      order: 5,
      type: 'CULTURE' as const,
      xpReward: 18,
      estimatedMinutes: 16,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'The Bhutia festival calendar follows the Tibetan lunar calendar and is marked by elaborate monastery celebrations, Cham dances, and community feasts.' },
          { id: 's2', type: 'text', content: 'Losar (Tibetan New Year) is the most important festival, celebrated with new clothes, special foods, and visits to monasteries.' },
        ],
        vocabulary: [
          { word: 'Losar', meaning: 'Tibetan New Year', pronunciation: 'lo-sar' },
          { word: 'Dumchi', meaning: 'Important Buddhist festival in Sikkim', pronunciation: 'dum-chi' },
          { word: 'Saga Dawa', meaning: 'Buddha\'s birth, enlightenment, and parinirvana day', pronunciation: 'sa-ga da-wa' },
          { word: 'Pang Lhabsol', meaning: 'Sikkimese thanksgiving festival', pronunciation: 'pang lab-sol' },
        ],
        culturalNotes: 'Pang Lhabsol is unique to Sikkim and celebrates the Kanchenjunga deity as the guardian spirit of Sikkim. It involves elaborate masked Cham dances performed by monks.',
      },
    },
  ]

  for (const lesson of bhutiaLessons) {
    await prisma.lesson.create({
      data: { ...lesson, courseId: courses[1] },
    })
  }
  console.log(`  ✅ Created 5 lessons for Bhutia Essentials`)

  const limbuLessons = [
    {
      title: 'Introduction to Limbu',
      description: 'First steps into the Yakthung Pan language of the Limbu people.',
      order: 1,
      type: 'VOCABULARY' as const,
      xpReward: 15,
      estimatedMinutes: 12,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'The Limbu people are one of the Kirat nations of the eastern Himalayas. Their language, Yakthung Pan, is rich with tonal patterns and has a unique phonological system unlike neighboring languages.' },
        ],
        vocabulary: [
          { word: 'Kheyong', meaning: 'Hello / Greetings', pronunciation: 'khe-yong' },
          { word: 'Nɨngba sa?', meaning: 'How are you?', pronunciation: 'ning-ba sa' },
          { word: 'Ningba yok', meaning: 'I am fine', pronunciation: 'ning-ba yok' },
          { word: 'Sanam', meaning: 'Thank you', pronunciation: 'sa-nam' },
          { word: 'Ima', meaning: 'Mother', pronunciation: 'ee-ma' },
          { word: 'Appa', meaning: 'Father', pronunciation: 'app-pa' },
        ],
        culturalNotes: 'The Limbu people follow the Kirat religion (Yumaism / Mundhum). Their oral scripture, the Mundhum, guides all aspects of life from birth to death rituals.',
      },
    },
    {
      title: 'The Sirijonga Script — Introduction',
      description: 'Learn about the history and basics of the Sirijonga script.',
      order: 2,
      type: 'SCRIPT' as const,
      xpReward: 25,
      estimatedMinutes: 20,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'The Sirijonga script (also called Kiranti Rai or Limbu script) was created in the 18th century by Sirijonga Hang, a Limbu scholar, to write the Mundhum oral scripture. The script has 10 vowels and 23 consonants.' },
        ],
        scriptExercises: [
          { character: 'ᤀ', strokes: 3 },
          { character: 'ᤁ', strokes: 4 },
          { character: 'ᤂ', strokes: 3 },
          { character: 'ᤃ', strokes: 5 },
          { character: 'ᤄ', strokes: 3 },
        ],
      },
    },
    {
      title: 'Limbu Nature Vocabulary',
      description: 'Learn Limbu words for the natural world — central to Mundhum cosmology.',
      order: 3,
      type: 'VOCABULARY' as const,
      xpReward: 18,
      estimatedMinutes: 15,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'In Yumaism (the Limbu religion), the natural world is sacred. The Mundhum contains detailed knowledge of plants, animals, rivers, and mountains as spiritual entities.' },
        ],
        vocabulary: [
          { word: 'Chhim', meaning: 'House / Home', pronunciation: 'chhim' },
          { word: 'Lek', meaning: 'Mountain ridge', pronunciation: 'lek' },
          { word: 'Khola', meaning: 'River / Stream', pronunciation: 'kho-la' },
          { word: 'Sappa', meaning: 'Tree', pronunciation: 'sap-pa' },
          { word: 'Pham', meaning: 'Land / Earth', pronunciation: 'pham' },
        ],
      },
    },
    {
      title: 'Limbu Numbers & Counting',
      description: 'Count in Yakthung Pan from 1 to 10.',
      order: 4,
      type: 'VOCABULARY' as const,
      xpReward: 12,
      estimatedMinutes: 10,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'Limbu has its own unique number system that reflects the mathematical traditions of the Kirat peoples.' },
        ],
        vocabulary: [
          { word: 'Ekka', meaning: 'One (1)', pronunciation: 'ek-ka' },
          { word: 'Nikk', meaning: 'Two (2)', pronunciation: 'nikk' },
          { word: 'Summa', meaning: 'Three (3)', pronunciation: 'sum-ma' },
          { word: 'Likk', meaning: 'Four (4)', pronunciation: 'likk' },
          { word: 'Ngakk', meaning: 'Five (5)', pronunciation: 'ngakk' },
          { word: 'Tukhuma', meaning: 'Six (6)', pronunciation: 'tu-khu-ma' },
          { word: 'Senna', meaning: 'Seven (7)', pronunciation: 'sen-na' },
          { word: 'Hakk', meaning: 'Eight (8)', pronunciation: 'hakk' },
          { word: 'Chakk', meaning: 'Nine (9)', pronunciation: 'chakk' },
          { word: 'Thamma', meaning: 'Ten (10)', pronunciation: 'tham-ma' },
        ],
      },
    },
    {
      title: 'Mundhum & Limbu Spirituality',
      description: 'Explore the Mundhum oral scripture and Yumaist spiritual practices.',
      order: 5,
      type: 'CULTURE' as const,
      xpReward: 22,
      estimatedMinutes: 20,
      isPublished: true,
      content: {
        sections: [
          { id: 's1', type: 'text', content: 'The Mundhum is the sacred oral literature of the Limbu people, transmitted through generations of Phedangma (male) and Yeba/Yema (female) priests. It contains creation narratives, ritual procedures, ethical codes, and cosmological knowledge.' },
        ],
        vocabulary: [
          { word: 'Mundhum', meaning: 'Sacred oral scripture of the Limbu', pronunciation: 'mun-dhum' },
          { word: 'Phedangma', meaning: 'Male Limbu priest', pronunciation: 'phe-dang-ma' },
          { word: 'Yuma', meaning: 'Great Goddess / Divine mother in Yumaism', pronunciation: 'yu-ma' },
          { word: 'Tagera Ningwaphuma', meaning: 'Creator deity in Mundhum', pronunciation: 'ta-ge-ra ning-wa-phu-ma' },
        ],
        culturalNotes: 'Yumaism (Kirat religion) predates Hinduism and Buddhism in the eastern Himalayas. The Mundhum is not written — it is memorized and transmitted orally. This makes its preservation especially challenging and critically important.',
      },
    },
  ]

  for (const lesson of limbuLessons) {
    await prisma.lesson.create({
      data: { ...lesson, courseId: courses[2] },
    })
  }
  console.log(`  ✅ Created 5 lessons for Limbu Script & Language`)

  // ─── Create Sample Words ──────────────────────────────────────────────────────
  console.log('\n📝 Creating sample words...')

  const wordData = [
    // Lepcha words
    {
      word: 'Mayel Lyang',
      meaning: 'The hidden paradise; the sacred ancestral homeland of the Lepcha people',
      communitySlug: 'lepcha',
      langCode: 'lep',
      pronunciation: 'may-el lyang',
      partOfSpeech: 'Noun (proper)',
      exampleSentence: 'Mayel Lyang ka tum-ring. (Mayel Lyang is our sacred land.)',
    },
    {
      word: 'Rum',
      meaning: 'Nature spirit or deity in Lepcha animist belief',
      communitySlug: 'lepcha',
      langCode: 'lep',
      pronunciation: 'room',
      partOfSpeech: 'Noun',
      exampleSentence: 'Byung-ka Rum azong. (The forest spirit watches over.)',
    },
    {
      word: 'Tak-shing',
      meaning: 'Thank you; gratitude',
      communitySlug: 'lepcha',
      langCode: 'lep',
      pronunciation: 'tak-shing',
      partOfSpeech: 'Phrase',
      exampleSentence: 'Tak-shing ang! (Thank you very much!)',
    },
    {
      word: 'Mun',
      meaning: 'A Lepcha shaman and ritual specialist who mediates between humans and nature spirits',
      communitySlug: 'lepcha',
      langCode: 'lep',
      pronunciation: 'moon',
      partOfSpeech: 'Noun',
    },
    {
      word: 'Tendong',
      meaning: 'Sacred mountain (Tendong Hill) believed to have saved the Lepcha from a great flood',
      communitySlug: 'lepcha',
      langCode: 'lep',
      pronunciation: 'ten-dong',
      partOfSpeech: 'Noun (proper)',
    },
    // Bhutia words
    {
      word: 'Tashi Delek',
      meaning: 'Auspicious greetings; may auspicious signs be with you',
      communitySlug: 'bhutia',
      langCode: 'sip',
      pronunciation: 'ta-shi de-lek',
      partOfSpeech: 'Greeting',
      exampleSentence: 'Tashi Delek! Losar la! (Auspicious greetings on New Year!)',
    },
    {
      word: 'Chorten',
      meaning: 'Buddhist stupa; a dome-shaped monument containing relics',
      communitySlug: 'bhutia',
      langCode: 'sip',
      pronunciation: 'chor-ten',
      partOfSpeech: 'Noun',
    },
    {
      word: 'Cham',
      meaning: 'Sacred masked dance performed by monks during Buddhist festivals',
      communitySlug: 'bhutia',
      langCode: 'sip',
      pronunciation: 'cham',
      partOfSpeech: 'Noun',
    },
    {
      word: 'Gonpa',
      meaning: 'Buddhist monastery; a place of religious practice and learning',
      communitySlug: 'bhutia',
      langCode: 'sip',
      pronunciation: 'gon-pa',
      partOfSpeech: 'Noun',
    },
    {
      word: 'Thangka',
      meaning: 'Tibetan Buddhist painting on silk depicting deities, mandalas, or narrative scenes',
      communitySlug: 'bhutia',
      langCode: 'sip',
      pronunciation: 'thang-ka',
      partOfSpeech: 'Noun',
    },
    // Limbu words
    {
      word: 'Mundhum',
      meaning: 'The sacred oral scripture of the Limbu people containing cosmological knowledge and ritual procedures',
      communitySlug: 'limbu',
      langCode: 'lif',
      pronunciation: 'mun-dhum',
      partOfSpeech: 'Noun (proper)',
    },
    {
      word: 'Yuma',
      meaning: 'The Great Goddess and divine mother in Yumaism; the supreme deity of the Limbu religious tradition',
      communitySlug: 'limbu',
      langCode: 'lif',
      pronunciation: 'yu-ma',
      partOfSpeech: 'Noun (proper)',
    },
    {
      word: 'Phedangma',
      meaning: 'A male Limbu priest trained to recite the Mundhum oral scripture',
      communitySlug: 'limbu',
      langCode: 'lif',
      pronunciation: 'phe-dang-ma',
      partOfSpeech: 'Noun',
    },
    {
      word: 'Sanam',
      meaning: 'Thank you; expression of gratitude',
      communitySlug: 'limbu',
      langCode: 'lif',
      pronunciation: 'sa-nam',
      partOfSpeech: 'Phrase',
    },
    {
      word: 'Kheyong',
      meaning: 'Greetings; hello',
      communitySlug: 'limbu',
      langCode: 'lif',
      pronunciation: 'khe-yong',
      partOfSpeech: 'Greeting',
    },
  ]

  for (const w of wordData) {
    await prisma.word.create({
      data: {
        word: w.word,
        meaning: w.meaning,
        communityId: communities[w.communitySlug].id,
        languageId: languages[w.langCode],
        pronunciation: w.pronunciation ?? null,
        partOfSpeech: w.partOfSpeech ?? null,
        exampleSentence: w.exampleSentence ?? null,
        contributorId: adminUser.id,
        status: 'APPROVED',
      },
    })
  }
  console.log(`  ✅ Created ${wordData.length} sample words`)

  // ─── Create Sample Stories ────────────────────────────────────────────────────
  console.log('\n📖 Creating sample stories...')

  const storyData = [
    {
      communitySlug: 'lepcha',
      title: 'The Origin of Mayel Lyang',
      content: `Long ago, before the mountains of Sikkim took their present form, the Lepcha ancestors lived in a sacred valley hidden between the clouds and the earth — Mayel Lyang, the paradise land.

The first Lepcha man, Fudongthing, and the first Lepcha woman, Nazongnyu, were created from the snow of Mount Kanchenjunga. The great mountain breathed life into them, and the river Tista sang their names into existence.

In Mayel Lyang, the trees spoke wisdom, the rivers carried songs, and every animal was a teacher. The Rum (nature spirits) guided the Lepcha people through the seasons, whispering knowledge of healing plants, warning of storms, and celebrating each harvest.

When the great flood came — waters rising from every valley — it was Mount Tendong that saved the Lepcha people. The mountain grew taller with every inch the waters rose, and the people climbed to safety, carrying their seeds, their sacred songs, and the memory of Mayel Lyang.

From that day, the Lepcha have honored Tendong as their protector. Every year, when the rains gather over Sikkim, they remember: the mountain remembers them, and they remember the mountain.

The Mun (shaman) still recites this story during Tendong Lho Rum Faat, the festival of thanksgiving, to remind each generation that they are the children of Kanchenjunga — keepers of a hidden paradise.`,
      summary: 'The origin story of the Lepcha people, telling how the first ancestors were created from the snows of Kanchenjunga and how Mount Tendong saved them from the great flood.',
      type: 'MYTH' as const,
      language: 'Lepcha / English',
    },
    {
      communitySlug: 'lepcha',
      title: 'The Mun Who Spoke to Stars',
      content: `There was once a Mun named Tyotkomoo who lived in a village near the sacred grove of Mayel Lyang. People said she could speak to the stars, but she always replied: "It is the stars who choose to speak to me."

One winter, when illness swept through the village and the Rum fell silent, the elders asked Tyotkomoo to seek their guidance. She climbed to the highest ridge above the village and waited three nights without sleep or food.

On the third night, the Pleiades — which the Lepcha call the Seven Sisters — descended to the ridge. They told Tyotkomoo that the illness came because the sacred spring below the village had been blocked by fallen trees, and the water no longer flowed clean and clear.

Tyotkomoo returned to the village. The people cleared the spring, and the water ran sweet again. Within seven days, the illness began to leave.

"What did the stars say?" the elders asked.

"They said: listen to the water," she answered. "The water remembers everything the land has been."

To this day, the Lepcha say: when the water speaks, the wise listen.`,
      summary: 'A story about a wise Lepcha Mun (shaman) who communicates with the stars to find the cause of a village illness.',
      type: 'FOLKTALE' as const,
      language: 'Lepcha / English',
    },
    {
      communitySlug: 'bhutia',
      title: 'The First Monastery of Sikkim',
      content: `The three learned lamas — Lhatsun Chenpo, Kathok Kuntu Zangpo, and Ngadak Sempa Chembo — came from different directions into Sikkim, guided by a prophecy that they would establish the first monastery in this mountain kingdom.

They met in the Yuksom valley in 1641, the place where three paths crossed. Here, they performed the first enthronement of Phuntsog Namgyal as the first Chogyal (divine ruler) of Sikkim, anointing him with water drawn from three different sacred springs.

In this ceremony, the lamas planted a prayer flag called the Norbu Gang Chorten, which still stands at Yuksom today. They declared Sikkim a hidden land (beyul) — a sacred sanctuary protected by the dharma and the deity Kanchenjunga.

The first monastery built by Lhatsun Chenpo was called Dubdi Monastery — the hermitage. It perches above Yuksom, half-hidden in the forest, its walls whispering the prayers of four centuries.

Kanchenjunga, the Sikkimese say, is not merely a mountain. He is Dzö-nga — the Snow Treasure House of Five Treasuries — a deity who holds the hidden treasures of earth: salt, gold, precious stones, scriptures, and invincible weapons of peace.

The Cham dance performed at monasteries each year reenacts the victory of dharma over ignorance, just as Lhatsun Chenpo once consecrated this mountain kingdom for all generations to come.`,
      summary: 'The founding story of Sikkim\'s first monastery at Yuksom and the enthronement of the first Chogyal, as told in the Sikkimese Bhutia oral tradition.',
      type: 'HISTORY' as const,
      language: 'Sikkimese Bhutia / English',
    },
    {
      communitySlug: 'bhutia',
      title: 'The Hidden Valley of Demojong',
      content: `The great Guru Padmasambhava — Guru Rinpoche — was said to have flown over Sikkim in the 8th century on the back of a tigress. He saw the hidden valley below the great mountain and recognized it as a beyul — a sacred hidden land sealed for future generations when the world would fill with conflict.

He planted teachings in the rocks, water, and trees of Sikkim — terma (hidden treasures) — to be discovered by tertöns (treasure-finders) in future ages.

Centuries later, Lhatsun Chenpo discovered these teachings and unsealed the valley. He named it Demojong — the Valley of Rice — though rice does not grow there. The name speaks of spiritual nourishment, not grain.

Even today, pilgrims walk the inner pilgrimage route of Kanchenjunga, circumambulating the great mountain, passing the sacred lakes and hermitages where Guru Rinpoche's blessings still reside.

The elders say: in Sikkim, you do not find peace. Peace finds you — if you walk slowly enough, with a quiet enough mind.`,
      summary: 'The legend of Guru Padmasambhava sealing Sikkim as a sacred hidden valley (beyul) and the rediscovery of its treasures by Lhatsun Chenpo.',
      type: 'LEGEND' as const,
      language: 'Sikkimese Bhutia / English',
    },
    {
      communitySlug: 'limbu',
      title: 'How the Mundhum Was Born',
      content: `In the beginning, before human beings walked the earth, the great goddess Yuma Sammang sat at the center of all existence. She breathed out, and her breath became the wind. She blinked, and her tears became the rivers. She sang, and her song became the Mundhum.

The first human couple — Sawa Yuma and Sawa Hang — heard the Mundhum song floating on the wind. They caught it in their hearts and memorized every word, every rhythm, every sacred pause. This is how knowledge came to the Limbu people: not written, not inscribed, but breathed into them by the goddess herself.

The Mundhum contains everything: how to plant seeds and when to harvest, how to honor the dead and welcome the newborn, how to speak to the spirit of a tiger that takes livestock, how to heal a heart broken by grief, how to dance when joy becomes too great for the body to contain.

"Why don't you write it down?" a traveler once asked a Phedangma.

"If I write it," the priest replied, "it becomes a book. If I breathe it, it remains alive. The Mundhum is not information. It is breath."`,
      summary: 'The origin story of the Limbu Mundhum oral scripture, explaining how sacred knowledge was sung into existence by the goddess Yuma and preserved through oral transmission.',
      type: 'MYTH' as const,
      language: 'Limbu / English',
    },
    {
      communitySlug: 'limbu',
      title: 'The Warrior Yakthumba',
      content: `The Limbu people call themselves Yakthung — people of the high plains. Long ago, they were ruled by a great chieftain named Yakthumba, who was said to have been born in the middle of a storm on the ridge between Nepal and what is now Sikkim.

When the King of the plains sent armies to claim the mountain lands, Yakthumba did not raise a weapon. Instead, he called all the Phedangma priests and they recited the Mundhum for three days and three nights without stopping.

On the third night, the king's general heard a sound he could not explain — like ten thousand warriors singing — though the valley below was empty. His horses refused to cross the river. His soldiers saw their own ancestors standing in the mist, shaking their heads.

The army turned back.

When the people asked Yakthumba how he had defeated the army without spears, he said: "I sent the Mundhum before us. It is older than any army. It is stronger than any wall."

The Limbu elders still say: the Mundhum is our greatest shield. As long as it is spoken, the Yakthung people exist.`,
      summary: 'The legend of the Limbu chieftain Yakthumba who defeated an invading army not with weapons but with the power of the sacred Mundhum oral recitation.',
      type: 'LEGEND' as const,
      language: 'Limbu / English',
    },
    {
      communitySlug: 'tamang',
      title: 'The Drum of Heaven',
      content: `The Tamang people say that in the beginning, the world was silent. Too silent. The sky and the earth had separated but had not yet learned to speak to each other.

Then Bombo Shere — the first shaman — climbed to the highest pass in the Himalayas with a skin drum he had made from the hide of a sacred deer. He beat it once, and the mountains trembled. He beat it twice, and the rivers began to flow. He beat it three times, and rain fell on the dry earth for the first time.

From that day, the sound of the drum has been the bridge between the human world and the spirit world. When a Tamang Bombo (shaman) beats his drum and enters trance, he walks that bridge — between the living and the dead, between illness and healing, between confusion and clarity.

The Tamang Selo, the folk music of the Tamang people, carries this inheritance. Every song is a small prayer. Every rhythm is a footstep on the bridge.

The people say: when you hear a damaru drum in the mountains, be still. The shaman is walking somewhere none of us can see.`,
      summary: 'The origin story of the Tamang drum tradition and the first shaman Bombo Shere who created the bridge between the human and spirit worlds through rhythm.',
      type: 'MYTH' as const,
      language: 'Tamang / English',
    },
    {
      communitySlug: 'tamang',
      title: 'The Seven Lakes of Tamang Tradition',
      content: `High in the mountains above Tamang villages lie seven sacred lakes, each one a mirror held up to the sky. The elders say these lakes were formed when the seven tears of the sky goddess fell to earth in grief over the suffering of the world below.

Each lake has its own spirit and its own healing property. The first lake cures blindness of the eyes; the second, blindness of the heart. The third brings clarity of speech; the fourth, wisdom in dreams. The fifth lake heals broken relationships, the sixth dissolves old grief, and the seventh — the highest and most remote — is said to show you your true name.

Pilgrims who walk to all seven lakes must carry no food from home. They must eat only what the mountain offers and sleep only in the open air. On the last night, at the seventh lake, they must stay awake until dawn and listen.

Those who truly listen, the elders say, hear their name spoken once — by a voice they have never heard before but recognize immediately.

"That," says the old Bombo of the village, "is the sound of who you were before you forgot."`,
      summary: 'The legend of the seven sacred lakes in the Tamang highland, each said to have healing properties, created from the tears of the sky goddess.',
      type: 'LEGEND' as const,
      language: 'Tamang / English',
    },
  ]

  for (const s of storyData) {
    await prisma.story.create({
      data: {
        title: s.title,
        content: s.content,
        summary: s.summary,
        communityId: communities[s.communitySlug].id,
        type: s.type,
        language: s.language,
        contributorId: adminUser.id,
        status: 'APPROVED',
        tags: ['indigenous', 'oral-tradition', 'sikkim'],
      },
    })
  }
  console.log(`  ✅ Created ${storyData.length} sample stories`)

  // ─── Create Sample Songs ──────────────────────────────────────────────────────
  console.log('\n🎵 Creating sample songs...')

  const songData = [
    {
      communitySlug: 'lepcha',
      title: 'Tendong Lho Rum Faat Hymn',
      lyrics: `Ka za a-ring tum ka
Tendong sa-rim zo-ka
Rum azong pang lha-ka
Mayel Lyang ming-ring-ka

(Translation:)
We sing to the sacred river
Tendong mountain rises high
The spirits watch over the land
Mayel Lyang, our eternal home`,
      language: 'Lepcha',
      occasion: 'Tendong Lho Rum Faat festival (August)',
    },
    {
      communitySlug: 'lepcha',
      title: 'Harvest Song of the Róng People',
      lyrics: `Sa-rim ting-lyang zo-ring
Byung tum azong pang-ring
Ka-tak shing ang Rum-ring
Thenkyoo! Thenkyoo! Ka-za ring!

(Translation:)
Mountains touching the sky
Forest and river watch over
We give thanks to the spirits
Thank you! Thank you! We sing together!`,
      language: 'Lepcha',
      occasion: 'Harvest time',
    },
    {
      communitySlug: 'bhutia',
      title: 'Losar Prayer Song',
      lyrics: `Tashi Delek! Tashi Delek!
Losar la tashi delek!
Kunchog Sum la sol-wa deb
Chogyal Namgyal ring-du zhi

(Translation:)
Auspicious greetings! Auspicious greetings!
On New Year, may fortune be with you!
We pray to the Three Jewels
May the divine ruler Namgyal long endure`,
      language: 'Sikkimese Bhutia',
      occasion: 'Losar (Tibetan New Year)',
    },
    {
      communitySlug: 'bhutia',
      title: 'Pang Lhabsol Offering Song',
      lyrics: `Dzö-nga lha-chen wang-gi gyalpo
Kanchenjunga, lord of the five treasuries
Pang Lhabsol la sol-wa deb-so
We offer this prayer on Pang Lhabsol day

Sikkim mi-drik kyong-wa dze
Guardian who protects the people of Sikkim
Kha-che ring-du zhi-bar dze
May you remain steadfast for long ages`,
      language: 'Sikkimese Bhutia',
      occasion: 'Pang Lhabsol festival',
    },
    {
      communitySlug: 'limbu',
      title: 'Kelang Song (Wedding)',
      lyrics: `Sanam! Sanam! Kheyong pheba!
Naso naso kel-ang yo-ka
Yuma Sammang nong-ma-ka
Sawa yuma sawa hang-ka

(Translation:)
Thank you! Thank you! Greetings to all!
Together we celebrate the wedding
With the blessing of goddess Yuma
As Sawa Yuma and Sawa Hang were united`,
      language: 'Limbu',
      occasion: 'Wedding ceremony (Kelang)',
    },
    {
      communitySlug: 'limbu',
      title: 'Yalandar (Rice Planting Song)',
      lyrics: `Yalandar yalandar ya-la!
Pham sa-ri kel-ang swa
Ngakk thamma sap-pa ring
Yuma nong-ma seng-ma ring!

(Translation:)
Yalandar, yalandar, ya-la!
In the earth we plant together
Five, ten trees we plant
May Yuma's blessing make them grow!`,
      language: 'Limbu',
      occasion: 'Rice planting season',
    },
    {
      communitySlug: 'tamang',
      title: 'Tamang Selo — Mountain Love Song',
      lyrics: `Pahad ko bato mathi mathi
Tamang ko sangit baji baji
Priyasi ko yaad le maan bharyo
Himalay ko ghumto bhayena

(Translation:)
High above on the mountain path
The music of the Tamang plays on
My heart fills with memories of my beloved
The Himalayan veil has not lifted`,
      language: 'Tamang',
      occasion: 'Festival and celebration',
    },
    {
      communitySlug: 'tamang',
      title: 'Bombo Healing Chant',
      lyrics: `Damaru damaru ring-ring
Spirit paths I walk alone
Bombo walking, Bombo seeing
What the living cannot own

Seven winds, seven waters
Carry healing to this home
Ancestors, hear my calling
Guide the lost ones safely home`,
      language: 'Tamang',
      occasion: 'Healing ceremony (puja)',
    },
  ]

  for (const s of songData) {
    await prisma.song.create({
      data: {
        title: s.title,
        lyrics: s.lyrics,
        communityId: communities[s.communitySlug].id,
        language: s.language,
        occasion: s.occasion,
        contributorId: adminUser.id,
        status: 'APPROVED',
        tags: ['traditional', 'folk', 'sikkim'],
      },
    })
  }
  console.log(`  ✅ Created ${songData.length} sample songs`)

  // ─── Create Achievements ──────────────────────────────────────────────────────
  console.log('\n🏆 Creating achievements...')

  const achievementData = [
    {
      name: 'First Word',
      description: 'Learned your very first word in an indigenous language. Every great journey begins with a single word.',
      icon: '🌱',
      xpRequired: 10,
      type: 'MILESTONE',
    },
    {
      name: 'Story Collector',
      description: 'Contributed 5 traditional stories to the cultural archive. You are keeping the oral tradition alive.',
      icon: '📚',
      xpRequired: 500,
      type: 'CONTRIBUTION',
    },
    {
      name: 'Voice Master',
      description: 'Recorded 50 pronunciation samples with a score above 80%. Your voice carries the language forward.',
      icon: '🎙️',
      xpRequired: 800,
      type: 'SKILL',
    },
    {
      name: 'Script Scholar',
      description: 'Completed all handwriting exercises for an indigenous script. You have mastered the art of ancestral writing.',
      icon: '✍️',
      xpRequired: 1200,
      type: 'SKILL',
    },
    {
      name: 'Cultural Guide',
      description: 'Shared knowledge about 10 festivals or cultural practices. You are a living bridge to heritage.',
      icon: '🏮',
      xpRequired: 1500,
      type: 'CONTRIBUTION',
    },
    {
      name: 'Streak Champion',
      description: 'Maintained a 30-day learning streak without interruption. Consistency is the hallmark of dedication.',
      icon: '🔥',
      xpRequired: 300,
      type: 'STREAK',
    },
    {
      name: 'Community Builder',
      description: 'Actively participated across 3 different indigenous communities. You build bridges between peoples.',
      icon: '🤝',
      xpRequired: 2000,
      type: 'SOCIAL',
    },
    {
      name: 'Heritage Guardian',
      description: 'Contributed over 100 approved items to the cultural archive. You are a guardian of living heritage.',
      icon: '🛡️',
      xpRequired: 5000,
      type: 'CONTRIBUTION',
    },
  ]

  for (const data of achievementData) {
    await prisma.achievement.create({ data })
  }
  console.log(`  ✅ Created ${achievementData.length} achievements`)

  // ─── Create Festivals ─────────────────────────────────────────────────────────
  console.log('\n🎉 Creating festivals...')

  const festivalData = [
    {
      communitySlug: 'lepcha',
      name: 'Tendong Lho Rum Faat',
      description: 'The most important Lepcha festival, held in August to honor Mount Tendong which is believed to have saved the Lepcha people from the great flood. Offerings are made to the nature spirits (Rum) and the Mun leads prayers.',
      month: 8,
      significance: 'Commemorates the divine protection of Mount Tendong and gives thanks to the Rum (nature spirits) for guarding Mayel Lyang. Central to Lepcha identity and spiritual practice.',
    },
    {
      communitySlug: 'lepcha',
      name: 'Lepcha New Year (Namsoong)',
      description: 'The Lepcha New Year celebration, held at the end of the harvest season. Families gather for traditional feasts, exchange of gifts, and the recitation of ancestral stories.',
      month: 12,
      significance: 'Marks the new agricultural and spiritual cycle, with prayers for prosperity, health, and harmony with the natural world.',
    },
    {
      communitySlug: 'bhutia',
      name: 'Losar',
      description: 'The Tibetan New Year, celebrated by the Bhutia community with visits to monasteries, special foods like kapse (fried bread), and elaborate family gatherings. It usually falls in February.',
      month: 2,
      significance: 'The most important annual festival marking the new year according to the Tibetan lunar calendar, bringing renewal and blessings for the coming year.',
    },
    {
      communitySlug: 'bhutia',
      name: 'Pang Lhabsol',
      description: 'A unique Sikkimese festival that venerates Kanchenjunga (Dzö-nga) as the guardian deity of Sikkim. Celebrated at monasteries with elaborate Cham (masked dances) by monks.',
      month: 8,
      significance: 'The only festival in the world dedicated to Kanchenjunga as a divine protector. Reaffirms Sikkim\'s identity as a sacred land blessed by the mountain deity.',
    },
    {
      communitySlug: 'limbu',
      name: 'Udhauli',
      description: 'The major Kirat (Limbu and Rai) festival of thanksgiving held in December when birds and animals descend from higher elevations. Phedangma priests recite the Mundhum while the community dances the Sakela dance.',
      month: 12,
      significance: 'Celebrates the descent from high altitudes as winter approaches, with gratitude offerings to the goddess Yuma and the ancestral spirits. The Sakela dance is central.',
    },
    {
      communitySlug: 'limbu',
      name: 'Ubhauli',
      description: 'The spring counterpart of Udhauli, celebrated when birds and animals ascend to higher elevations. The community prays for good monsoon, healthy crops, and protection from disease.',
      month: 5,
      significance: 'Marks the ascent to highland pastures in spring, with prayers to Yuma for rain and growth. The Sakela Sili dance is performed by the entire community.',
    },
    {
      communitySlug: 'tamang',
      name: 'Losar (Tamang New Year)',
      description: 'The Tamang New Year celebration with unique Tamang traditions including the Tamang Selo music, community dances, and ritual offerings at sacred sites.',
      month: 2,
      significance: 'Brings the community together to celebrate new beginnings with music, dance, and prayers in the Bon-Buddhist tradition unique to the Tamang people.',
    },
    {
      communitySlug: 'tamang',
      name: 'Sonam Lhosar',
      description: 'A major Tamang festival marking their new year, usually in January or February. Features traditional Tamang Selo music performances, communal feasting, and rituals led by Bombo shamans.',
      month: 1,
      significance: 'The Tamang New Year is a time for renewing community bonds, honoring ancestors, and seeking blessings from the Bombo (shaman) for the coming year.',
    },
  ]

  for (const f of festivalData) {
    const { communitySlug, ...festData } = f
    await prisma.festival.create({
      data: { ...festData, communityId: communities[communitySlug].id },
    })
  }
  console.log(`  ✅ Created ${festivalData.length} festivals`)

  // ─── Create Dialects ──────────────────────────────────────────────────────────
  console.log('\n🗺️  Creating dialects...')

  await prisma.dialect.create({
    data: {
      name: 'Northern Lepcha',
      languageId: languages['lep'],
      region: 'North Sikkim',
      description: 'The dialect of Lepcha spoken in the northern regions of Sikkim, with some phonological differences from the southern variety.',
      speakerCount: 15000,
    },
  })

  await prisma.dialect.create({
    data: {
      name: 'Bantawa',
      languageId: languages['lif'],
      region: 'Eastern Nepal and Sikkim',
      description: 'The Bantawa dialect of the Limbu language family, also considered a separate language by some linguists.',
      speakerCount: 380000,
    },
  })

  console.log(`  ✅ Created 2 dialects`)

  // ─── Community Earnings (sample economic data) ────────────────────────────────
  console.log('\n💰 Creating community earnings data...')

  const earningData = [
    { communitySlug: 'lepcha', amount: '12500.00', source: 'Cultural Tourism', period: '2024-Q4' },
    { communitySlug: 'lepcha', amount: '8750.00', source: 'Government Grant', period: '2024-Q4' },
    { communitySlug: 'bhutia', amount: '25000.00', source: 'Monastery Tourism', period: '2024-Q4' },
    { communitySlug: 'bhutia', amount: '15000.00', source: 'Thangka Art Sales', period: '2024-Q4' },
    { communitySlug: 'limbu', amount: '18500.00', source: 'Cultural Tourism', period: '2024-Q4' },
    { communitySlug: 'tamang', amount: '32000.00', source: 'Music & Performance', period: '2024-Q4' },
  ]

  for (const e of earningData) {
    const { communitySlug, ...earnData } = e
    await prisma.communityEarning.create({
      data: {
        ...earnData,
        communityId: communities[communitySlug].id,
      },
    })
  }
  console.log(`  ✅ Created ${earningData.length} community earning records`)

  // ─── Tags ─────────────────────────────────────────────────────────────────────
  console.log('\n🏷️  Creating tags...')

  const globalTags = ['oral-tradition', 'indigenous', 'himalayan', 'sikkim', 'preservation', 'language', 'cultural-heritage']
  for (const tagName of globalTags) {
    await prisma.tag.create({
      data: {
        name: tagName,
        slug: tagName.toLowerCase().replace(/\s+/g, '-'),
        communityId: null,
      },
    })
  }

  // Community-specific tags
  const lepchaTags = ['lepcha', 'rong-script', 'mayel-lyang', 'mun-shaman']
  for (const tagName of lepchaTags) {
    await prisma.tag.create({
      data: {
        name: tagName,
        slug: tagName,
        communityId: communities['lepcha'].id,
      },
    })
  }

  console.log(`  ✅ Created ${globalTags.length + lepchaTags.length} tags`)

  // ─── Create Subscription Plans ───────────────────────────────────────────────
  console.log('\n💳 Creating subscription plans...')

  const subscriptionPlans = [
    {
      name: 'Heritage Monthly',
      slug: 'heritage-monthly',
      description: 'Full access to all languages, communities, and AI features. 45% supports communities.',
      priceInr: 199,
      interval: 'MONTHLY' as const,
      trialDays: 7,
      features: {
        communities: 'all', courses: 'unlimited', aiTutor: true,
        aiSearch: true, voicePractice: true, writingPractice: true,
        downloads: true, badge: 'Heritage Supporter',
      },
    },
    {
      name: 'Heritage Annual',
      slug: 'heritage-annual',
      description: 'Full access for a full year — save ₹590 vs monthly. Funds indigenous preservation.',
      priceInr: 1799,
      interval: 'ANNUAL' as const,
      trialDays: 7,
      features: {
        communities: 'all', courses: 'unlimited', aiTutor: true,
        aiSearch: true, voicePractice: true, writingPractice: true,
        downloads: true, badge: 'Heritage Guardian', annualBonus: '200 bonus XP',
      },
    },
  ]

  for (const plan of subscriptionPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    })
    console.log(`  ✅ Plan: ${plan.name} (₹${plan.priceInr})`)
  }

  // ─── Lepcha Script Characters ─────────────────────────────────────────────────
  console.log('\n✍️  Seeding Lepcha script characters...')
  const lepchaCommunity = await prisma.community.findUnique({ where: { slug: 'lepcha' }, select: { id: true } })
  if (lepchaCommunity) {
    const lepchaChars = [
      { character: 'ᰀ', unicode: 'U+1C00', phonetic: 'Ka',  ipa: '/ka/',  meaning: 'Consonant Ka',  group: 'Velars',   strokeCount: 3, sortOrder: 1 },
      { character: 'ᰁ', unicode: 'U+1C01', phonetic: 'Kha', ipa: '/kʰa/', meaning: 'Consonant Kha', group: 'Velars',   strokeCount: 4, sortOrder: 2 },
      { character: 'ᰂ', unicode: 'U+1C02', phonetic: 'Ga',  ipa: '/ɡa/',  meaning: 'Consonant Ga',  group: 'Velars',   strokeCount: 3, sortOrder: 3 },
      { character: 'ᰃ', unicode: 'U+1C03', phonetic: 'Nga', ipa: '/ŋa/',  meaning: 'Consonant Nga', group: 'Velars',   strokeCount: 2, sortOrder: 4 },
      { character: 'ᰄ', unicode: 'U+1C04', phonetic: 'Ca',  ipa: '/tɕa/', meaning: 'Consonant Ca',  group: 'Palatals', strokeCount: 3, sortOrder: 5 },
      { character: 'ᰅ', unicode: 'U+1C05', phonetic: 'Cha', ipa: '/tɕʰa/',meaning: 'Consonant Cha', group: 'Palatals', strokeCount: 4, sortOrder: 6 },
      { character: 'ᰆ', unicode: 'U+1C06', phonetic: 'Ja',  ipa: '/dʑa/', meaning: 'Consonant Ja',  group: 'Palatals', strokeCount: 3, sortOrder: 7 },
      { character: 'ᰇ', unicode: 'U+1C07', phonetic: 'Nya', ipa: '/ɲa/',  meaning: 'Consonant Nya', group: 'Palatals', strokeCount: 3, sortOrder: 8 },
      { character: 'ᰈ', unicode: 'U+1C08', phonetic: 'Ta',  ipa: '/ta/',  meaning: 'Consonant Ta',  group: 'Dentals',  strokeCount: 3, sortOrder: 9 },
      { character: 'ᰉ', unicode: 'U+1C09', phonetic: 'Tha', ipa: '/tʰa/', meaning: 'Consonant Tha', group: 'Dentals',  strokeCount: 4, sortOrder: 10 },
      { character: 'ᰊ', unicode: 'U+1C0A', phonetic: 'Da',  ipa: '/da/',  meaning: 'Consonant Da',  group: 'Dentals',  strokeCount: 3, sortOrder: 11 },
      { character: 'ᰋ', unicode: 'U+1C0B', phonetic: 'Na',  ipa: '/na/',  meaning: 'Consonant Na',  group: 'Dentals',  strokeCount: 2, sortOrder: 12 },
      { character: 'ᰌ', unicode: 'U+1C0C', phonetic: 'Pa',  ipa: '/pa/',  meaning: 'Consonant Pa',  group: 'Labials',  strokeCount: 3, sortOrder: 13 },
      { character: 'ᰍ', unicode: 'U+1C0D', phonetic: 'Pha', ipa: '/pʰa/', meaning: 'Consonant Pha', group: 'Labials',  strokeCount: 4, sortOrder: 14 },
      { character: 'ᰎ', unicode: 'U+1C0E', phonetic: 'Ba',  ipa: '/ba/',  meaning: 'Consonant Ba',  group: 'Labials',  strokeCount: 3, sortOrder: 15 },
      { character: 'ᰏ', unicode: 'U+1C0F', phonetic: 'Ma',  ipa: '/ma/',  meaning: 'Consonant Ma',  group: 'Labials',  strokeCount: 2, sortOrder: 16 },
    ]
    for (const char of lepchaChars) {
      await prisma.scriptCharacter.upsert({
        where: { id: `lepcha-${char.unicode.replace('U+', '').toLowerCase()}` },
        update: { ...char, isPublished: true, communityId: lepchaCommunity.id },
        create: { id: `lepcha-${char.unicode.replace('U+', '').toLowerCase()}`, ...char, isPublished: true, communityId: lepchaCommunity.id },
      })
    }
    console.log(`  ✅ ${lepchaChars.length} Lepcha script characters seeded`)
  }

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Summary:')
  console.log(`  • ${communityData.length} communities`)
  console.log(`  • ${languageData.length} languages`)
  console.log(`  • 2 users (admin@sikkimverse.com / contributor@sikkimverse.com)`)
  console.log(`  • ${courseData.length} courses`)
  console.log(`  • 15 lessons (5 per course)`)
  console.log(`  • ${wordData.length} words`)
  console.log(`  • ${storyData.length} stories`)
  console.log(`  • ${songData.length} songs`)
  console.log(`  • ${achievementData.length} achievements`)
  console.log(`  • ${festivalData.length} festivals`)
  console.log(`\n🔑 Admin credentials: admin@sikkimverse.com / Admin@123`)
  console.log(`🔑 Contributor credentials: contributor@sikkimverse.com / Contributor@123`)
  console.log(`\n🎭 Demo accounts (all password: Demo@123):`)
  console.log(`  student@sikkimverse.demo`)
  console.log(`  contributor@sikkimverse.demo`)
  console.log(`  moderator@sikkimverse.demo`)
  console.log(`  president@sikkimverse.demo`)
  console.log(`  govt@sikkimverse.demo`)
  console.log(`  admin@sikkimverse.demo`)
  console.log(`  superadmin@sikkimverse.demo`)
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
