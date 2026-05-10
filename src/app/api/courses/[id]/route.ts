import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// ─── GET /api/courses/[id] ────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params
    const session = await auth()

    const course = await prisma.course.findUnique({
      where: { id, isPublished: true },
      include: {
        community: {
          select: { id: true, name: true, slug: true, colorPrimary: true, colorSecondary: true, region: true },
        },
        language: {
          select: { id: true, name: true, code: true, endangermentLevel: true },
        },
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            xpReward: true,
            estimatedMinutes: true,
            order: true,
          },
        },
        _count: {
          select: {
            progress: { where: { completed: true } },
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    }

    // If the user is authenticated, fetch their progress for this course
    let userProgress: Record<string, { completed: boolean; score: number | null }> = {}
    if (session?.user?.id) {
      const progress = await prisma.userProgress.findMany({
        where: { userId: session.user.id, courseId: course.id },
        select: { lessonId: true, completed: true, score: true },
      })
      userProgress = Object.fromEntries(
        progress.map(p => [p.lessonId, { completed: p.completed, score: p.score }])
      )
    }

    const completedLessons = Object.values(userProgress).filter(p => p.completed).length
    const enrolledCount = await prisma.userProgress.groupBy({
      by: ['userId'],
      where: { courseId: course.id },
      _count: true,
    }).then(g => g.length)

    return NextResponse.json({
      data: {
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        coverImage: course.coverImage,
        totalLessons: course.totalLessons || course.lessons.length,
        community: course.community,
        language: course.language,
        lessons: course.lessons.map(lesson => ({
          ...lesson,
          status: userProgress[lesson.id]?.completed
            ? 'completed'
            : lesson.order === (completedLessons + 1)
            ? 'current'
            : lesson.order <= completedLessons
            ? 'completed'
            : 'locked',
          score: userProgress[lesson.id]?.score ?? null,
        })),
        userProgress: {
          completedLessons,
          totalLessons: course.lessons.length,
          percentComplete: course.lessons.length
            ? Math.round((completedLessons / course.lessons.length) * 100)
            : 0,
        },
        enrolledCount,
      },
    })
  } catch (error) {
    console.error('[GET /api/courses/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch course.' }, { status: 500 })
  }
}
