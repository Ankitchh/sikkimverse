import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cancelRazorpaySubscription } from '@/lib/razorpay'
import { paymentLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const schema = z.object({
  immediately: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  if (!paymentLimiter(ip).allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  let body: unknown
  try { body = await request.json() } catch { body = {} }
  const parsed = schema.safeParse(body)
  const immediately = parsed.success ? parsed.data.immediately : false

  try {
    const sub = await prisma.userSubscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!sub) {
      return NextResponse.json({ error: 'No subscription found.' }, { status: 404 })
    }

    if (sub.status === 'CANCELED' || sub.status === 'EXPIRED') {
      return NextResponse.json({ error: 'Subscription is already canceled.' }, { status: 409 })
    }

    // Cancel in Razorpay if gateway subscription exists
    if (sub.gatewaySubId) {
      try {
        await cancelRazorpaySubscription(sub.gatewaySubId, !immediately)
      } catch (rzpErr) {
        console.error('[Cancel] Razorpay cancel error:', rzpErr)
        // Continue with local cancellation even if Razorpay fails
      }
    }

    const cancelAt = immediately ? new Date() : sub.currentPeriodEnd

    const updated = await prisma.userSubscription.update({
      where: { id: sub.id },
      data: {
        status: immediately ? 'CANCELED' : sub.status,
        cancelAt,
        canceledAt: immediately ? new Date() : null,
      },
    })

    // Notify user
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SUBSCRIPTION_CANCELED',
        title: 'Subscription canceled',
        message: immediately
          ? 'Your subscription has been canceled immediately. Access has been revoked.'
          : `Your subscription will remain active until ${cancelAt.toLocaleDateString('en-IN', { dateStyle: 'long' })}.`,
        link: '/settings/billing',
      },
    })

    return NextResponse.json({
      success: true,
      cancelAt: updated.cancelAt,
      immediately,
    })
  } catch (err) {
    console.error('[POST /api/subscriptions/cancel]', err)
    return NextResponse.json({ error: 'Failed to cancel subscription.' }, { status: 500 })
  }
}
