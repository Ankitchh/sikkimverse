import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants'

// ─── Query schema ─────────────────────────────────────────────────────────────

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  search: z.string().max(100).trim().optional(),
  region: z.string().max(100).trim().optional(),
  preservationLevel: z
    .enum(['low', 'medium', 'high'])
    .optional()
    .describe('low: <40, medium: 40-60, high: >60'),
})

// ─── GET /api/communities ─────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
    const parsed = querySchema.safeParse(searchParams)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters.', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { page, limit, search, region, preservationLevel } = parsed.data
    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.CommunityWhereInput = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { region: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (region) {
      where.region = { contains: region, mode: 'insensitive' }
    }

    if (preservationLevel === 'low') {
      where.preservationScore = { lt: 40 }
    } else if (preservationLevel === 'medium') {
      where.preservationScore = { gte: 40, lte: 60 }
    } else if (preservationLevel === 'high') {
      where.preservationScore = { gt: 60 }
    }

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          coverImage: true,
          logoImage: true,
          colorPrimary: true,
          colorSecondary: true,
          region: true,
          totalSpeakers: true,
          preservationScore: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              users: true,
              languages: true,
              courses: true,
              stories: { where: { status: 'APPROVED' } },
              songs: { where: { status: 'APPROVED' } },
            },
          },
        },
      }),
      prisma.community.count({ where }),
    ])

    const data = communities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      coverImage: c.coverImage,
      logoImage: c.logoImage,
      colorPrimary: c.colorPrimary,
      colorSecondary: c.colorSecondary,
      region: c.region,
      totalSpeakers: c.totalSpeakers,
      preservationScore: c.preservationScore,
      isActive: c.isActive,
      createdAt: c.createdAt,
      speakerCount: c._count.users,
      languageCount: c._count.languages,
      lessonCount: c._count.courses,
      storyCount: c._count.stories,
      songCount: c._count.songs,
    }))

    return NextResponse.json({
      data,
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
    console.error('[GET /api/communities]', error)
    return NextResponse.json({ error: 'Failed to fetch communities.' }, { status: 500 })
  }
}
