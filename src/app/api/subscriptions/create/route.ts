import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createRazorpaySubscription } from '@/lib/razorpay'
import { paymentLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const schema = z.object({
  planId: z.string().cuid(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  const rl = paymentLimiter(ip)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.', details: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  try {
    const { planId } = parsed.data

    // Check if user already has an active subscription
    const existing = await prisma.userSubscription.findUnique({
      where: { userId: session.user.id },
      select: { id: true, status: true },
    })

    if (existing && (existing.status === 'ACTIVE' || existing.status === 'TRIALING')) {
      return NextResponse.json(
        { error: 'You already have an active subscription.' },
        { status: 409 },
      )
    }

    // Fetch the plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId, isActive: true },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found.' }, { status: 404 })
    }

    // If Razorpay is configured and plan has a gateway plan ID, create real subscription
    if (process.env.RAZORPAY_KEY_ID && plan.gatewayPlanId) {
      const rzpSub = await createRazorpaySubscription({
        planId: plan.gatewayPlanId,
        notes: { userId: session.user.id, planId: plan.id },
      })

      // Create subscription record in pending state — webhook will activate
      const now = new Date()
      const trialEnd = new Date(now.getTime() + plan.trialDays * 86_400_000)
      const periodEnd = new Date(trialEnd.getTime() + 30 * 86_400_000)

      const sub = await prisma.userSubscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          planId: plan.id,
          status: 'TRIALING',
          trialStart: now,
          trialEnd,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          gatewaySubId: rzpSub.id as string,
        },
        update: {
          planId: plan.id,
          status: 'TRIALING',
          trialStart: now,
          trialEnd,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          gatewaySubId: rzpSub.id as string,
          cancelAt: null,
          canceledAt: null,
        },
      })

      return NextResponse.json({
        subscriptionId: sub.id,
        gatewaySubId: rzpSub.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        trialDays: plan.trialDays,
      })
    }

    // Razorpay not configured — create a trial subscription locally (dev/staging)
    const now = new Date()
    const trialEnd = new Date(now.getTime() + plan.trialDays * 86_400_000)
    const periodEnd = new Date(trialEnd.getTime() + 30 * 86_400_000)

    const sub = await prisma.userSubscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        planId: plan.id,
        status: 'TRIALING',
        trialStart: now,
        trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      update: {
        planId: plan.id,
        status: 'TRIALING',
        trialStart: now,
        trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAt: null,
        canceledAt: null,
      },
    })

    return NextResponse.json({
      subscriptionId: sub.id,
      gatewaySubId: null,
      trialDays: plan.trialDays,
      devMode: true,
    })
  } catch (err) {
    console.error('[POST /api/subscriptions/create]', err)
    return NextResponse.json({ error: 'Failed to create subscription.' }, { status: 500 })
  }
}
