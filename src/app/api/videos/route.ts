import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, VideoType } from '@/generated/prisma'
import { z } from 'zod'

const QuerySchema = z.object({
  communityId: z.string().optional(),
  type:        z.nativeEnum(VideoType).optional(),
  search:      z.string().optional(),
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(24).default(12),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse(Object.fromEntries(searchParams))

    const where: Prisma.VideoWhereInput = { status: 'APPROVED' }
    if (query.communityId) where.communityId = query.communityId
    if (query.type)        where.type        = query.type
    if (query.search) {
      where.OR = [
        { title:       { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const skip = (query.page - 1) * query.limit
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        include: { community: { select: { name: true, slug: true } } },
        orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: query.limit,
      }),
      prisma.video.count({ where }),
    ])

    return NextResponse.json({
      videos,
      pagination: { total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query', details: error.issues }, { status: 400 })
    }
    console.error('[GET /api/videos]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
