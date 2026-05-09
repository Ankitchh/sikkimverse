import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    const [achievements, userAchievements] = await Promise.all([
      prisma.achievement.findMany({ orderBy: { xpRequired: 'asc' } }),
      token?.sub
        ? prisma.userAchievement.findMany({
            where: { userId: token.sub },
            select: { achievementId: true, earnedAt: true },
          })
        : [],
    ])

    const earnedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.earnedAt]))

    const result = achievements.map((a) => ({
      ...a,
      earned: earnedMap.has(a.id),
      earnedAt: earnedMap.get(a.id) ?? null,
    }))

    return NextResponse.json({ achievements: result })
  } catch (error) {
    console.error('[GET /api/achievements]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
