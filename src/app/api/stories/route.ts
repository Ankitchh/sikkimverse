import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, StoryType } from '@/generated/prisma'
import { z } from 'zod'

const QuerySchema = z.object({
  communityId: z.string().optional(),
  type:        z.nativeEnum(StoryType).optional(),
  status:      z.enum(['APPROVED', 'PENDING', 'REJECTED']).optional(),
  search:      z.string().optional(),
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(50).default(12),
})

const CreateStorySchema = z.object({
  title:        z.string().min(1).max(300),
  content:      z.string().min(1),
  summary:      z.string().max(1000).optional(),
  type:         z.nativeEnum(StoryType).default(StoryType.FOLKTALE),
  language:     z.string().min(1).max(100),
  communityId:  z.string(),
  contributorId:z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse(Object.fromEntries(searchParams))

    const where: Prisma.StoryWhereInput = {
      status: query.status ?? 'APPROVED',
    }
    if (query.communityId) where.communityId = query.communityId
    if (query.type)        where.type        = query.type
    if (query.search) {
      where.OR = [
        { title:   { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const skip = (query.page - 1) * query.limit
    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where,
        include: {
          community: { select: { name: true, slug: true } },
          contributor: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.story.count({ where }),
    ])

    return NextResponse.json({
      stories,
      pagination: { total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 })
    }
    console.error('[GET /api/stories]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateStorySchema.parse(body)

    const story = await prisma.story.create({
      data: {
        title:         data.title,
        content:       data.content,
        summary:       data.summary,
        type:          data.type,
        language:      data.language,
        communityId:   data.communityId,
        contributorId: data.contributorId,
      },
      include: {
        community: { select: { name: true, slug: true } },
      },
    })

    return NextResponse.json({ story }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 422 })
    }
    console.error('[POST /api/stories]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
