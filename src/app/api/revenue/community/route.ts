import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  distributeRevenue,
  COMMUNITY_SHARE_PCT,
  PLATFORM_SHARE_PCT,
} from '@/lib/subscription'
import { apiLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

// ─── GET /api/revenue/community ───────────────────────────────────────────────
// Returns the revenue share breakdown for the specified period.
// Admins can see all communities; community presidents see only their own.

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  if (!apiLimiter(ip).allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  const role = session.user.role ?? 'PUBLIC_USER'
  const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'GOVERNMENT_OFFICER', 'COMMUNITY_PRESIDENT']
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 })
  }

  const period = request.nextUrl.searchParams.get('period') ?? getCurrentPeriod()

  try {
    // Fetch all communities (or just the user's community for presidents)
    const communityFilter =
      role === 'COMMUNITY_PRESIDENT' && session.user.communityId
        ? { id: session.user.communityId }
        : {}

    const communities = await prisma.community.findMany({
      where: { ...communityFilter, isActive: true },
      select: { id: true, name: true, slug: true },
    })

    if (communities.length === 0) {
      return NextResponse.json({ period, communities: [], totalRevenue: 0 })
    }

    const communityIds = communities.map((c) => c.id)

    // Aggregate engagement metrics for the period
    const [contentCounts, viewCounts, contributorCounts] = await Promise.all([
      // Content count per community
      Promise.all([
        prisma.word.groupBy({
          by: ['communityId'],
          where: { communityId: { in: communityIds }, status: 'APPROVED' },
          _count: { id: true },
        }),
        prisma.story.groupBy({
          by: ['communityId'],
          where: { communityId: { in: communityIds }, status: 'APPROVED' },
          _count: { id: true },
        }),
        prisma.song.groupBy({
          by: ['communityId'],
          where: { communityId: { in: communityIds }, status: 'APPROVED' },
          _count: { id: true },
        }),
      ]),
      // View counts (words + stories + songs)
      Promise.all([
        prisma.story.groupBy({
          by: ['communityId'],
          where: { communityId: { in: communityIds }, status: 'APPROVED' },
          _sum: { viewCount: true },
        }),
        prisma.song.groupBy({
          by: ['communityId'],
          where: { communityId: { in: communityIds }, status: 'APPROVED' },
          _sum: { viewCount: true },
        }),
      ]),
      // Unique contributors per community
      prisma.user.groupBy({
        by: ['communityId'],
        where: {
          communityId: { in: communityIds },
          role: { in: ['CONTRIBUTOR', 'MODERATOR', 'COMMUNITY_PRESIDENT'] },
        },
        _count: { id: true },
      }),
    ])

    // Build engagement map
    const engagementMap = new Map<string, { communityId: string; contentCount: number; viewCount: number; contributorCount: number }>(
      communityIds.map((id) => [id, { communityId: id, contentCount: 0, viewCount: 0, contributorCount: 0 }]),
    )

    const [wordCounts, storyCounts, songCounts] = contentCounts
    ;[...wordCounts, ...storyCounts, ...songCounts].forEach(
      (row: { communityId: string; _count: { id: number } }) => {
        const e = engagementMap.get(row.communityId)
        if (e) e.contentCount += row._count.id
      },
    )

    const [storyViews, songViews] = viewCounts
    ;[...storyViews, ...songViews].forEach(
      (row: { communityId: string; _sum: { viewCount: number | null } }) => {
        const e = engagementMap.get(row.communityId)
        if (e) e.viewCount += row._sum.viewCount ?? 0
      },
    )

    contributorCounts.forEach(
      (row: { communityId: string | null; _count: { id: number } }) => {
        if (!row.communityId) return
        const e = engagementMap.get(row.communityId)
        if (e) e.contributorCount += row._count.id
      },
    )

    // Fetch subscription revenue for the period
    const [year, month] = period.split('-').map(Number)
    const periodStart = new Date(year, month - 1, 1)
    const periodEnd = new Date(year, month, 1)

    const payments = await prisma.paymentEvent.aggregate({
      where: {
        status: 'paid',
        createdAt: { gte: periodStart, lt: periodEnd },
      },
      _sum: { amount: true },
    })

    const totalRevenue = Number(payments._sum.amount ?? 0)

    // Calculate distribution
    const engagements = Array.from(engagementMap.values())
    const distributions = distributeRevenue(totalRevenue, engagements)

    const result = communities.map((community) => {
      const eng = engagementMap.get(community.id)!
      const dist = distributions.find((d) => d.communityId === community.id)!
      const storedShare = null as unknown as { communityShare: string; platformShare: string; isPaid: boolean } | null

      return {
        community: { id: community.id, name: community.name, slug: community.slug },
        engagement: eng,
        revenue: {
          communityShare: dist?.amountInr.toFixed(2) ?? '0.00',
          platformShare: (totalRevenue * dist?.share * PLATFORM_SHARE_PCT).toFixed(2) ?? '0.00',
          sharePercent: ((dist?.share ?? 0) * 100).toFixed(1),
        },
        isPaid: storedShare?.isPaid ?? false,
      }
    })

    return NextResponse.json({
      period,
      totalRevenue: totalRevenue.toFixed(2),
      communityPool: (totalRevenue * COMMUNITY_SHARE_PCT).toFixed(2),
      platformPool: (totalRevenue * PLATFORM_SHARE_PCT).toFixed(2),
      communitySharePct: COMMUNITY_SHARE_PCT * 100,
      platformSharePct: PLATFORM_SHARE_PCT * 100,
      communities: result,
    })
  } catch (err) {
    console.error('[GET /api/revenue/community]', err)
    return NextResponse.json({ error: 'Failed to calculate revenue.' }, { status: 500 })
  }
}

function getCurrentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
