import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'
import type { UserRole } from '@/generated/prisma'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants'

// ─── Roles that can submit content ────────────────────────────────────────────

const CONTRIBUTOR_ROLES: UserRole[] = [
  'CONTRIBUTOR',
  'MODERATOR',
  'COMMUNITY_PRESIDENT',
  'GOVERNMENT_OFFICER',
  'ADMIN',
  'SUPER_ADMIN',
]

const MODERATOR_ROLES: UserRole[] = [
  'MODERATOR',
  'COMMUNITY_PRESIDENT',
  'ADMIN',
  'SUPER_ADMIN',
]

// ─── Submission schemas ───────────────────────────────────────────────────────

const wordDataSchema = z.object({
  word: z.string().min(1).max(200).trim(),
  meaning: z.string().min(1).max(2000).trim(),
  communityId: z.string().cuid(),
  languageId: z.string().cuid(),
  dialectId: z.string().cuid().optional(),
  pronunciation: z.string().max(500).trim().optional(),
  audioUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  partOfSpeech: z.string().max(100).trim().optional(),
  exampleSentence: z.string().max(1000).trim().optional(),
})

const storyDataSchema = z.object({
  title: z.string().min(1).max(300).trim(),
  content: z.string().min(10).max(50000).trim(),
  summary: z.string().max(2000).trim().optional(),
  communityId: z.string().cuid(),
  type: z.enum(['FOLKTALE', 'MYTH', 'LEGEND', 'HISTORY', 'ORAL_HISTORY']),
  language: z.string().min(1).max(100).trim(),
  audioUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
})

const songDataSchema = z.object({
  title: z.string().min(1).max(300).trim(),
  lyrics: z.string().max(20000).trim().optional(),
  communityId: z.string().cuid(),
  language: z.string().min(1).max(100).trim(),
  occasion: z.string().max(200).trim().optional(),
  audioUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
})

const recordingDataSchema = z.object({
  title: z.string().min(1).max(300).trim(),
  description: z.string().max(2000).trim().optional(),
  communityId: z.string().cuid(),
  type: z.enum(['WORD', 'PHRASE', 'SENTENCE', 'STORY', 'SONG', 'RITUAL']),
  audioUrl: z.string().url(),
  duration: z.number().int().positive().optional(),
  transcription: z.string().max(10000).trim().optional(),
  translation: z.string().max(10000).trim().optional(),
})

const videoDataSchema = z.object({
  title: z.string().min(1).max(300).trim(),
  description: z.string().max(2000).trim().optional(),
  communityId: z.string().cuid(),
  type: z.enum(['LESSON', 'CULTURAL', 'DOCUMENTARY', 'FESTIVAL', 'RITUAL']),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().int().positive().optional(),
})

const createSubmissionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('WORD'), data: wordDataSchema }),
  z.object({ type: z.literal('STORY'), data: storyDataSchema }),
  z.object({ type: z.literal('SONG'), data: songDataSchema }),
  z.object({ type: z.literal('RECORDING'), data: recordingDataSchema }),
  z.object({ type: z.literal('VIDEO'), data: videoDataSchema }),
])

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  type: z.enum(['WORD', 'STORY', 'SONG', 'RECORDING', 'VIDEO']).optional(),
  communityId: z.string().cuid().optional(),
})

// ─── POST /api/submissions ────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const userRole = session.user.role as UserRole
    if (!CONTRIBUTOR_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: 'Contributor role or above is required to submit content.' },
        { status: 403 },
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    const parsed = createSubmissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    const { type, data } = parsed.data
    const contributorId = session.user.id

    // Verify the community exists and is active
    const community = await prisma.community.findUnique({
      where: { id: data.communityId },
      select: { id: true, isActive: true },
    })
    if (!community || !community.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive community.' }, { status: 422 })
    }

    // Create submission + content record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the Submission record
      const submission = await tx.submission.create({
        data: {
          type,
          communityId: data.communityId,
          contributorId,
          status: 'PENDING',
        },
      })

      // Create the actual content record
      let contentId: string | null = null

      if (type === 'WORD') {
        const d = data as z.infer<typeof wordDataSchema>
        const word = await tx.word.create({
          data: {
            word: d.word,
            meaning: d.meaning,
            communityId: d.communityId,
            languageId: d.languageId,
            dialectId: d.dialectId ?? null,
            pronunciation: d.pronunciation ?? null,
            audioUrl: d.audioUrl ?? null,
            imageUrl: d.imageUrl ?? null,
            partOfSpeech: d.partOfSpeech ?? null,
            exampleSentence: d.exampleSentence ?? null,
            contributorId,
            status: 'PENDING',
          },
        })
        contentId = word.id
      } else if (type === 'STORY') {
        const d = data as z.infer<typeof storyDataSchema>
        const story = await tx.story.create({
          data: {
            title: d.title,
            content: d.content,
            summary: d.summary ?? null,
            communityId: d.communityId,
            type: d.type,
            language: d.language,
            audioUrl: d.audioUrl ?? null,
            imageUrl: d.imageUrl ?? null,
            tags: d.tags ?? [],
            contributorId,
            status: 'PENDING',
          },
        })
        contentId = story.id
      } else if (type === 'SONG') {
        const d = data as z.infer<typeof songDataSchema>
        const song = await tx.song.create({
          data: {
            title: d.title,
            lyrics: d.lyrics ?? null,
            communityId: d.communityId,
            language: d.language,
            occasion: d.occasion ?? null,
            audioUrl: d.audioUrl ?? null,
            videoUrl: d.videoUrl ?? null,
            imageUrl: d.imageUrl ?? null,
            tags: d.tags ?? [],
            contributorId,
            status: 'PENDING',
          },
        })
        contentId = song.id
      } else if (type === 'RECORDING') {
        const d = data as z.infer<typeof recordingDataSchema>
        const recording = await tx.recording.create({
          data: {
            title: d.title,
            description: d.description ?? null,
            communityId: d.communityId,
            type: d.type,
            audioUrl: d.audioUrl,
            duration: d.duration ?? 0,
            transcription: d.transcription ?? null,
            translation: d.translation ?? null,
            contributorId,
            status: 'PENDING',
          },
        })
        contentId = recording.id
      } else if (type === 'VIDEO') {
        const d = data as z.infer<typeof videoDataSchema>
        const video = await tx.video.create({
          data: {
            title: d.title,
            description: d.description ?? null,
            communityId: d.communityId,
            type: d.type,
            videoUrl: d.videoUrl,
            thumbnailUrl: d.thumbnailUrl ?? null,
            duration: d.duration ?? 0,
            contributorId,
            status: 'PENDING',
          },
        })
        contentId = video.id
      }

      // Link the content record ID back to the submission
      if (contentId) {
        await tx.submission.update({
          where: { id: submission.id },
          data: { contentId },
        })
      }

      return { submission: { ...submission, contentId }, contentId }
    })

    return NextResponse.json(
      {
        message: 'Submission created successfully. It will be reviewed by a moderator.',
        submissionId: result.submission.id,
        contentId: result.contentId,
        type,
        status: 'PENDING',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[POST /api/submissions]', error)
    return NextResponse.json({ error: 'Failed to create submission.' }, { status: 500 })
  }
}

// ─── GET /api/submissions ─────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
    const parsed = listQuerySchema.safeParse(searchParams)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters.', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { page, limit, status, type, communityId } = parsed.data
    const skip = (page - 1) * limit
    const userRole = session.user.role as UserRole
    const isModerator = MODERATOR_ROLES.includes(userRole)

    // Build where clause
    const where: Prisma.SubmissionWhereInput = {}

    if (!isModerator) {
      // Regular contributors only see their own submissions
      where.contributorId = session.user.id
    } else if (communityId) {
      // Moderators can filter by community
      where.communityId = communityId
    }

    if (status) where.status = status
    if (type) where.type = type

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          contributor: {
            select: { id: true, name: true, image: true, email: true },
          },
          moderator: {
            select: { id: true, name: true, image: true },
          },
          community: {
            select: { id: true, name: true, slug: true, colorPrimary: true },
          },
        },
      }),
      prisma.submission.count({ where }),
    ])

    return NextResponse.json({
      data: submissions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error('[GET /api/submissions]', error)
    return NextResponse.json({ error: 'Failed to fetch submissions.' }, { status: 500 })
  }
}
