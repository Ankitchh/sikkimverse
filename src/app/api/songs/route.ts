import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'
import { z } from 'zod'

const QuerySchema = z.object({
  communityId: z.string().optional(),
  occasion:    z.string().optional(),
  search:      z.string().optional(),
  status:      z.enum(['APPROVED', 'PENDING', 'REJECTED']).optional(),
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(50).default(12),
})

const CreateSongSchema = z.object({
  title:        z.string().min(1).max(300),
  lyrics:       z.string().optional(),
  occasion:     z.string().optional(),
  language:     z.string().min(1),
  audioUrl:     z.string().url().optional(),
  communityId:  z.string(),
  contributorId:z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse(Object.fromEntries(searchParams))

    const where: Prisma.SongWhereInput = {
      status: query.status ?? 'APPROVED',
    }
    if (query.communityId) where.communityId = query.communityId
    if (query.occasion)    where.occasion    = { contains: query.occasion, mode: 'insensitive' }
    if (query.search) {
      where.OR = [
        { title:  { contains: query.search, mode: 'insensitive' } },
        { lyrics: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const skip = (query.page - 1) * query.limit
    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        where,
        include: {
          community: { select: { name: true, slug: true } },
          contributor: { select: { name: true } },
        },
        orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: query.limit,
      }),
      prisma.song.count({ where }),
    ])

    return NextResponse.json({
      songs,
      pagination: { total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query', details: error.issues }, { status: 400 })
    }
    console.error('[GET /api/songs]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateSongSchema.parse(body)

    const song = await prisma.song.create({
      data: {
        title:         data.title,
        lyrics:        data.lyrics,
        occasion:      data.occasion,
        language:      data.language,
        audioUrl:      data.audioUrl,
        communityId:   data.communityId,
        contributorId: data.contributorId,
      },
      include: { community: { select: { name: true, slug: true } } },
    })

    return NextResponse.json({ song }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 422 })
    }
    console.error('[POST /api/songs]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
