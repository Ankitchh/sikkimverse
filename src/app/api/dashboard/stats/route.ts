import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/generated/prisma'

// ─── Admin roles ──────────────────────────────────────────────────────────────

const ADMIN_ROLES: UserRole[] = ['ADMIN', 'SUPER_ADMIN', 'GOVERNMENT_OFFICER']

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────────

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const userRole = session.user.role as UserRole
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: 'Admin access required to view platform statistics.' },
        { status: 403 },
      )
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Run all queries in parallel for performance
    const [
      usersByRole,
      totalUsers,
      activeUsers,
      newUsersThisMonth,

      totalStories,
      totalSongs,
      totalVideos,
      totalRecordings,
      totalWords,
      totalCourses,

      pendingSubmissions,
      recentSubmissions,

      contentByStatus,

      communitiesWithStats,

      xpDistribution,
    ] = await Promise.all([
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      // Total users
      prisma.user.count(),

      // Active users last 7 days (had a session or progress record)
      prisma.userProgress.findMany({
        where: { completedAt: { gte: sevenDaysAgo } },
        select: { userId: true },
        distinct: ['userId'],
      }),

      // New users this month
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),

      // Content totals
      prisma.story.count(),
      prisma.song.count(),
      prisma.video.count(),
      prisma.recording.count(),
      prisma.word.count(),
      prisma.course.count(),

      // Pending submissions count
      prisma.submission.count({ where: { status: 'PENDING' } }),

      // Recent submissions (last 10)
      prisma.submission.findMany({
        take: 10,
        orderBy: { submittedAt: 'desc' },
        include: {
          contributor: { select: { id: true, name: true, image: true } },
          community: { select: { id: true, name: true, slug: true, colorPrimary: true } },
        },
      }),

      // Content by status
      prisma.submission.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Communities with preservation scores and content counts
      prisma.community.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          colorPrimary: true,
          region: true,
          preservationScore: true,
          totalSpeakers: true,
          _count: {
            select: {
              users: true,
              languages: true,
              stories: { where: { status: 'APPROVED' } },
              songs: { where: { status: 'APPROVED' } },
              words: { where: { status: 'APPROVED' } },
              videos: { where: { status: 'APPROVED' } },
              recordings: { where: { status: 'APPROVED' } },
              courses: { where: { isPublished: true } },
              submissions: { where: { status: 'PENDING' } },
            },
          },
        },
        orderBy: { preservationScore: 'asc' },
      }),

      // XP distribution buckets
      prisma.$queryRaw<Array<{ bucket: string; count: bigint }>>`
        SELECT
          CASE
            WHEN xp = 0 THEN '0'
            WHEN xp BETWEEN 1 AND 99 THEN '1-99'
            WHEN xp BETWEEN 100 AND 499 THEN '100-499'
            WHEN xp BETWEEN 500 AND 999 THEN '500-999'
            WHEN xp BETWEEN 1000 AND 4999 THEN '1000-4999'
            ELSE '5000+'
          END as bucket,
          COUNT(*)::bigint as count
        FROM "User"
        GROUP BY bucket
        ORDER BY MIN(xp)
      `,
    ])

    // Format XP distribution (convert BigInt to number)
    const xpBuckets = (xpDistribution as Array<{ bucket: string; count: bigint }>).map((b) => ({
      bucket: b.bucket,
      count: Number(b.count),
    }))

    // Format content by status
    const submissionsByStatus = Object.fromEntries(
      contentByStatus.map((s) => [s.status, s._count.id]),
    )

    // Format communities data
    const communityStats = communitiesWithStats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      colorPrimary: c.colorPrimary,
      region: c.region,
      preservationScore: c.preservationScore,
      totalSpeakers: c.totalSpeakers,
      memberCount: c._count.users,
      languageCount: c._count.languages,
      approvedStories: c._count.stories,
      approvedSongs: c._count.songs,
      approvedWords: c._count.words,
      approvedVideos: c._count.videos,
      approvedRecordings: c._count.recordings,
      publishedCourses: c._count.courses,
      pendingSubmissions: c._count.submissions,
      totalApprovedContent:
        c._count.stories +
        c._count.songs +
        c._count.words +
        c._count.videos +
        c._count.recordings,
    }))

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsersLast7Days: activeUsers.length,
        newUsersThisMonth,
        pendingSubmissions,
      },
      usersByRole: usersByRole.map((u) => ({
        role: u.role,
        count: u._count.id,
      })),
      content: {
        totalStories,
        totalSongs,
        totalVideos,
        totalRecordings,
        totalWords,
        totalCourses,
        total: totalStories + totalSongs + totalVideos + totalRecordings + totalWords,
      },
      submissions: {
        byStatus: {
          pending: submissionsByStatus['PENDING'] ?? 0,
          approved: submissionsByStatus['APPROVED'] ?? 0,
          rejected: submissionsByStatus['REJECTED'] ?? 0,
        },
        recent: recentSubmissions,
      },
      communities: communityStats,
      xpDistribution: xpBuckets,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/dashboard/stats]', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics.' }, { status: 500 })
  }
}
