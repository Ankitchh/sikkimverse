import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'

const QuerySchema = z.object({
  scope:       z.enum(['global', 'community']).default('global'),
  communityId: z.string().optional(),
  period:      z.enum(['all', 'monthly', 'weekly']).default('all'),
  limit:       z.coerce.number().int().min(1).max(100).default(50),
})

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse(Object.fromEntries(searchParams))

    const where: { communityId?: string } = {}
    if (query.scope === 'community' && query.communityId) {
      where.communityId = query.communityId
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id:          true,
        name:        true,
        image:       true,
        xp:          true,
        streak:      true,
        role:        true,
        communityId: true,
        community:   { select: { name: true, slug: true } },
      },
      orderBy: { xp: 'desc' },
      take: query.limit,
    })

    // Get contribution counts separately to avoid _count select issues
    const userIds = users.map(u => u.id)
    const [storyCounts, songCounts, recordingCounts, wordCounts] = await Promise.all([
      prisma.story.groupBy({ by: ['contributorId'], where: { contributorId: { in: userIds }, status: 'APPROVED' }, _count: true }),
      prisma.song.groupBy({ by: ['contributorId'], where: { contributorId: { in: userIds }, status: 'APPROVED' }, _count: true }),
      prisma.recording.groupBy({ by: ['contributorId'], where: { contributorId: { in: userIds }, status: 'APPROVED' }, _count: true }),
      prisma.word.groupBy({ by: ['contributorId'], where: { contributorId: { in: userIds }, status: 'APPROVED' }, _count: true }),
    ])

    const countMap = (arr: { contributorId: string; _count: number }[]) =>
      new Map(arr.map(r => [r.contributorId, r._count]))

    const sc = countMap(storyCounts)
    const mc = countMap(songCounts)
    const rc = countMap(recordingCounts)
    const wc = countMap(wordCounts)

    const ranked = users.map((u, i) => ({
      rank: i + 1,
      ...u,
      contributions: (sc.get(u.id) ?? 0) + (mc.get(u.id) ?? 0) + (rc.get(u.id) ?? 0) + (wc.get(u.id) ?? 0),
    }))

    // If authenticated, also return the caller's position
    let myRank: { rank: number; xp: number } | null = null
    if (token?.sub) {
      const myPos = await prisma.user.count({
        where: { xp: { gt: (await prisma.user.findUnique({ where: { id: token.sub }, select: { xp: true } }))?.xp ?? 0 } },
      })
      const me = await prisma.user.findUnique({ where: { id: token.sub }, select: { xp: true } })
      if (me) myRank = { rank: myPos + 1, xp: me.xp }
    }

    return NextResponse.json({ leaderboard: ranked, myRank })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query', details: error.issues }, { status: 400 })
    }
    console.error('[GET /api/leaderboard]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
