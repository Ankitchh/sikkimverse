import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function GET(request: Request): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  const { allowed } = apiLimiter(ip)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceInr: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        priceInr: true,
        interval: true,
        trialDays: true,
        features: true,
        gatewayPlanId: true,
      },
    })

    return NextResponse.json({ plans })
  } catch (err) {
    console.error('[GET /api/subscriptions/plans]', err)
    return NextResponse.json({ error: 'Failed to fetch plans.' }, { status: 500 })
  }
}
