import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSubscriptionActive, daysRemaining, STATUS_LABELS, STATUS_COLORS } from '@/lib/subscription'
import { apiLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function GET(request: Request): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  const { allowed } = apiLimiter(ip)
  if (!allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const sub = await prisma.userSubscription.findUnique({
      where: { userId: session.user.id },
      include: {
        plan: {
          select: { name: true, slug: true, priceInr: true, interval: true, features: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, amount: true, currency: true, status: true, createdAt: true },
        },
      },
    })

    if (!sub) {
      return NextResponse.json({ subscription: null, isActive: false })
    }

    const active = isSubscriptionActive(sub)

    return NextResponse.json({
      subscription: {
        id: sub.id,
        status: sub.status,
        statusLabel: STATUS_LABELS[sub.status],
        statusColor: STATUS_COLORS[sub.status],
        plan: sub.plan,
        trialEnd: sub.trialEnd,
        currentPeriodEnd: sub.currentPeriodEnd,
        daysRemaining: daysRemaining(sub.currentPeriodEnd),
        cancelAt: sub.cancelAt,
        canceledAt: sub.canceledAt,
        payments: sub.payments,
      },
      isActive: active,
    })
  } catch (err) {
    console.error('[GET /api/subscriptions/status]', err)
    return NextResponse.json({ error: 'Failed to fetch subscription status.' }, { status: 500 })
  }
}
