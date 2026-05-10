import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// ─── GET /api/lessons/[id] ────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params
    const session = await auth()

    // Fetch lesson with all relations via separate queries for TypeScript compatibility
    const lesson = await prisma.lesson.findFirst({
      where: { id, isPublished: true },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 })
    }

    const [course, quizzes] = await Promise.all([
      prisma.course.findUnique({
        where: { id: lesson.courseId },
        include: {
          community: { select: { id: true, name: true, slug: true, colorPrimary: true } },
          language:  { select: { id: true, name: true, code: true } },
          lessons: {
            where: { isPublished: true },
            orderBy: { order: 'asc' },
            select: { id: true, title: true, order: true },
          },
        },
      }),
      prisma.quiz.findMany({
        where: { lessonId: id },
        select: {
          id: true,
          type: true,
          question: true,
          options: true,
          correctAnswer: true,
        },
      }),
    ])

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    }

    // Fetch user progress
    let userProgress: { completed: boolean; score: number | null } | null = null
    let courseProgress: Record<string, boolean> = {}

    if (session?.user?.id) {
      const [lessonProg, allProgress] = await Promise.all([
        prisma.userProgress.findUnique({
          where: { userId_lessonId: { userId: session.user.id, lessonId: id } },
          select: { completed: true, score: true },
        }),
        prisma.userProgress.findMany({
          where: { userId: session.user.id, courseId: lesson.courseId },
          select: { lessonId: true, completed: true },
        }),
      ])
      userProgress = lessonProg
      courseProgress = Object.fromEntries(allProgress.map(p => [p.lessonId, p.completed]))
    }

    const sortedLessons = course.lessons
    const idx = sortedLessons.findIndex(l => l.id === id)
    const prevLesson = idx > 0 ? sortedLessons[idx - 1] : null
    const nextLesson = idx < sortedLessons.length - 1 ? sortedLessons[idx + 1] : null

    return NextResponse.json({
      data: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        xpReward: lesson.xpReward,
        estimatedMinutes: lesson.estimatedMinutes,
        order: lesson.order,
        content: lesson.content,
        course: {
          id: course.id,
          title: course.title,
          level: course.level,
          community: course.community,
          language: course.language,
        },
        quizzes,
        navigation: {
          prev: prevLesson,
          next: nextLesson,
          currentIndex: idx,
          total: sortedLessons.length,
        },
        userProgress: userProgress
          ? { completed: userProgress.completed, score: userProgress.score }
          : null,
        courseProgress,
      },
    })
  } catch (error) {
    console.error('[GET /api/lessons/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch lesson.' }, { status: 500 })
  }
}
