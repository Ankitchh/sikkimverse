import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants'

// ─── Query schema ─────────────────────────────────────────────────────────────

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  communityId: z.string().cuid().optional(),
  languageId: z.string().cuid().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  search: z.string().max(100).trim().optional(),
})

// ─── GET /api/courses ─────────────────────────────────────────────────────────

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

    const { page, limit, communityId, languageId, level, search } = parsed.data
    const skip = (page - 1) * limit

    const where: Prisma.CourseWhereInput = {
      isPublished: true,
    }

    if (communityId) where.communityId = communityId
    if (languageId) where.languageId = languageId
    if (level) where.level = level

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          level: true,
          coverImage: true,
          totalLessons: true,
          isPublished: true,
          createdAt: true,
          community: {
            select: {
              id: true,
              name: true,
              slug: true,
              colorPrimary: true,
              logoImage: true,
            },
          },
          language: {
            select: {
              id: true,
              name: true,
              code: true,
              endangermentLevel: true,
            },
          },
          _count: {
            select: {
              lessons: { where: { isPublished: true } },
              progress: { where: { completed: true } },
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ])

    const data = courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      level: c.level,
      coverImage: c.coverImage,
      totalLessons: c._count.lessons,
      enrolledCount: c._count.progress,
      isPublished: c.isPublished,
      createdAt: c.createdAt,
      community: c.community,
      language: c.language,
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
    console.error('[GET /api/courses]', error)
    return NextResponse.json({ error: 'Failed to fetch courses.' }, { status: 500 })
  }
}
