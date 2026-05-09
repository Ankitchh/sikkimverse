import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'
import { XP_REWARDS } from '@/lib/constants'

// ─── Validation schemas ────────────────────────────────────────────────────────

const recordProgressSchema = z.object({
  lessonId: z.string().cuid(),
  courseId: z.string().cuid(),
  score: z.number().int().min(0).max(100),
  completed: z.boolean(),
})

const getProgressQuerySchema = z.object({
  courseId: z.string().cuid().optional(),
})

// ─── Level calculation ────────────────────────────────────────────────────────

function xpToLevel(xp: number): number {
  // Level formula: each level requires 10% more XP than the previous.
  // Level 1: 0–99 XP, Level 2: 100–219 XP, etc.
  if (xp <= 0) return 1
  return Math.floor(Math.log((xp / 100) * 0.1 + 1) / Math.log(1.1)) + 1
}

// ─── Streak calculation ───────────────────────────────────────────────────────

function updateStreak(
  currentStreak: number,
  lastActivity: Date | null,
  now: Date,
): { newStreak: number; streakBonusXP: number } {
  if (!lastActivity) {
    return { newStreak: 1, streakBonusXP: XP_REWARDS.DAILY_STREAK }
  }

  const lastDate = new Date(lastActivity)
  const lastDateMidnight = new Date(
    lastDate.getFullYear(),
    lastDate.getMonth(),
    lastDate.getDate(),
  )
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.floor(
    (todayMidnight.getTime() - lastDateMidnight.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays === 0) {
    // Same day — no streak change, no bonus
    return { newStreak: currentStreak, streakBonusXP: 0 }
  } else if (diffDays === 1) {
    // Consecutive day — extend streak
    const newStreak = currentStreak + 1
    return { newStreak, streakBonusXP: XP_REWARDS.DAILY_STREAK }
  } else {
    // Streak broken
    return { newStreak: 1, streakBonusXP: XP_REWARDS.DAILY_STREAK }
  }
}

// ─── POST /api/progress ───────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    const parsed = recordProgressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    const { lessonId, courseId, score, completed } = parsed.data
    const userId = session.user.id

    // Verify lesson and course exist
    const [lesson, course] = await Promise.all([
      prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true, xpReward: true, courseId: true } }),
      prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }),
    ])

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 })
    }
    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    }
    if (lesson.courseId !== courseId) {
      return NextResponse.json({ error: 'Lesson does not belong to the specified course.' }, { status: 422 })
    }

    // Check if already completed (don't award XP again for re-completions)
    const existingProgress = await prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    })

    const wasAlreadyCompleted = existingProgress?.completed ?? false

    const now = new Date()

    // Upsert the progress record
    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        courseId,
        score,
        completed,
        completedAt: completed ? now : null,
      },
      update: {
        score: Math.max(existingProgress?.score ?? 0, score), // keep best score
        completed: existingProgress?.completed || completed,
        completedAt:
          completed && !existingProgress?.completed ? now : existingProgress?.completedAt,
      },
    })

    // XP + streak update if newly completed
    let xpEarned = 0
    let streakBonusXP = 0
    let newStreak = session.user.streak ?? 0
    let newXp = session.user.xp ?? 0

    if (completed && !wasAlreadyCompleted) {
      const lessonXP = lesson.xpReward ?? XP_REWARDS.COMPLETE_LESSON
      const perfectBonus = score === 100 ? XP_REWARDS.PERFECT_QUIZ - XP_REWARDS.COMPLETE_LESSON : 0
      xpEarned = lessonXP + perfectBonus

      // Fetch fresh user data for streak
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, streak: true, streakLastActivity: true },
      })

      const { newStreak: calculatedStreak, streakBonusXP: bonusXP } = updateStreak(
        user?.streak ?? 0,
        user?.streakLastActivity ?? null,
        now,
      )
      newStreak = calculatedStreak
      streakBonusXP = bonusXP
      const totalXpGain = xpEarned + streakBonusXP

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: totalXpGain },
          streak: newStreak,
          streakLastActivity: now,
        },
        select: { xp: true, streak: true },
      })

      newXp = updatedUser.xp
      newStreak = updatedUser.streak
    }

    const currentLevel = xpToLevel(newXp)

    return NextResponse.json({
      progress: {
        id: progress.id,
        lessonId: progress.lessonId,
        courseId: progress.courseId,
        completed: progress.completed,
        score: progress.score,
        completedAt: progress.completedAt,
      },
      rewards: {
        xpEarned,
        streakBonusXP,
        totalXpEarned: xpEarned + streakBonusXP,
      },
      user: {
        xp: newXp,
        level: currentLevel,
        streak: newStreak,
      },
    })
  } catch (error) {
    console.error('[POST /api/progress]', error)
    return NextResponse.json({ error: 'Failed to record progress.' }, { status: 500 })
  }
}

// ─── GET /api/progress ────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
    const parsed = getProgressQuerySchema.safeParse(searchParams)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters.', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { courseId } = parsed.data
    const userId = session.user.id

    const where: Prisma.UserProgressWhereInput = { userId }
    if (courseId) where.courseId = courseId

    const progressRecords = await prisma.userProgress.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
            order: true,
            xpReward: true,
            estimatedMinutes: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            coverImage: true,
            totalLessons: true,
            community: {
              select: { id: true, name: true, slug: true, colorPrimary: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group by course for summary
    const courseSummaries = new Map<
      string,
      {
        courseId: string
        courseTitle: string
        level: string
        totalLessons: number
        completedLessons: number
        community: { id: string; name: string; slug: string; colorPrimary: string } | null
        lastActivityAt: Date | null
      }
    >()

    for (const p of progressRecords) {
      const existing = courseSummaries.get(p.courseId)
      const completedAt = p.completedAt

      if (!existing) {
        courseSummaries.set(p.courseId, {
          courseId: p.courseId,
          courseTitle: p.course.title,
          level: p.course.level,
          totalLessons: p.course.totalLessons,
          completedLessons: p.completed ? 1 : 0,
          community: p.course.community ?? null,
          lastActivityAt: completedAt,
        })
      } else {
        if (p.completed) existing.completedLessons += 1
        if (completedAt && (!existing.lastActivityAt || completedAt > existing.lastActivityAt)) {
          existing.lastActivityAt = completedAt
        }
      }
    }

    const summaries = Array.from(courseSummaries.values()).map((s) => ({
      ...s,
      progressPercent:
        s.totalLessons > 0 ? Math.round((s.completedLessons / s.totalLessons) * 100) : 0,
    }))

    return NextResponse.json({
      data: progressRecords,
      summaries,
      user: {
        xp: session.user.xp ?? 0,
        level: xpToLevel(session.user.xp ?? 0),
        streak: session.user.streak ?? 0,
      },
    })
  } catch (error) {
    console.error('[GET /api/progress]', error)
    return NextResponse.json({ error: 'Failed to fetch progress.' }, { status: 500 })
  }
}
