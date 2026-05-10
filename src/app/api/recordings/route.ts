import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, RecordingType } from '@/generated/prisma'
import { z } from 'zod'

const QuerySchema = z.object({
  communityId: z.string().optional(),
  type:        z.nativeEnum(RecordingType).optional(),
  search:      z.string().optional(),
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(50).default(20),
})

const CreateRecordingSchema = z.object({
  title:         z.string().min(1).max(300),
  description:   z.string().optional(),
  type:          z.nativeEnum(RecordingType).default(RecordingType.WORD),
  audioUrl:      z.string().url(),
  duration:      z.number().int().min(0).default(0),
  transcription: z.string().optional(),
  translation:   z.string().optional(),
  communityId:   z.string(),
  contributorId: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse(Object.fromEntries(searchParams))

    const where: Prisma.RecordingWhereInput = { status: 'APPROVED' }
    if (query.communityId) where.communityId = query.communityId
    if (query.type)        where.type        = query.type
    if (query.search) {
      where.OR = [
        { title:         { contains: query.search, mode: 'insensitive' } },
        { transcription: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const skip = (query.page - 1) * query.limit
    const [recordings, total] = await Promise.all([
      prisma.recording.findMany({
        where,
        include: {
          community: { select: { name: true, slug: true } },
          contributor: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.recording.count({ where }),
    ])

    return NextResponse.json({
      recordings,
      pagination: { total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query', details: error.issues }, { status: 400 })
    }
    console.error('[GET /api/recordings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateRecordingSchema.parse(body)

    const recording = await prisma.recording.create({
      data: {
        title:         data.title,
        description:   data.description,
        type:          data.type,
        audioUrl:      data.audioUrl,
        duration:      data.duration,
        transcription: data.transcription,
        translation:   data.translation,
        communityId:   data.communityId,
        contributorId: data.contributorId,
      },
      include: { community: { select: { name: true, slug: true } } },
    })

    return NextResponse.json({ recording }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 422 })
    }
    console.error('[POST /api/recordings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
