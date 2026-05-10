import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay'
import {
  sendSubscriptionConfirmationEmail,
  sendPaymentFailedEmail,
} from '@/lib/email'
import { formatInr } from '@/lib/razorpay'

export const runtime = 'nodejs'

// Razorpay sends raw body — disable Next.js body parsing
export const dynamic = 'force-dynamic'

interface RzpSubscriptionEntity {
  id: string
  plan_id: string
  status: string
  current_start?: number
  current_end?: number
  charge_at?: number
}

interface RzpPaymentEntity {
  id: string
  amount: number
  currency: string
  status: string
  subscription_id?: string
}

interface RzpWebhookPayload {
  entity: string
  account_id: string
  event: string
  contains: string[]
  payload: {
    subscription?: { entity: RzpSubscriptionEntity }
    payment?: { entity: RzpPaymentEntity }
  }
  created_at: number
}

async function handleSubscriptionActivated(sub: RzpSubscriptionEntity) {
  const subscription = await prisma.userSubscription.findUnique({
    where: { gatewaySubId: sub.id },
    include: { user: true, plan: true },
  })
  if (!subscription) return

  const now = new Date()
  const periodEnd = sub.current_end
    ? new Date(sub.current_end * 1000)
    : new Date(now.getTime() + 30 * 86_400_000)

  await prisma.userSubscription.update({
    where: { id: subscription.id },
    data: {
      status: 'ACTIVE',
      currentPeriodStart: sub.current_start ? new Date(sub.current_start * 1000) : now,
      currentPeriodEnd: periodEnd,
      trialEnd: subscription.trialEnd ?? undefined,
    },
  })

  // Send confirmation email
  if (subscription.user.email) {
    await sendSubscriptionConfirmationEmail(
      subscription.user.email,
      subscription.user.name ?? '',
      subscription.plan.name,
      formatInr(Number(subscription.plan.priceInr)),
      periodEnd,
    )
  }

  await prisma.notification.create({
    data: {
      userId: subscription.userId,
      type: 'SUBSCRIPTION_ACTIVATED',
      title: 'Subscription activated',
      message: `Your ${subscription.plan.name} subscription is now active. Thank you for supporting indigenous language preservation!`,
      link: '/dashboard',
    },
  })
}

async function handlePaymentCaptured(payment: RzpPaymentEntity) {
  if (!payment.subscription_id) return

  const subscription = await prisma.userSubscription.findUnique({
    where: { gatewaySubId: payment.subscription_id },
    include: { plan: true },
  })
  if (!subscription) return

  await prisma.paymentEvent.upsert({
    where: { gatewayEventId: payment.id },
    create: {
      subscriptionId: subscription.id,
      gatewayEventId: payment.id,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: 'paid',
      metadata: { razorpay_payment_id: payment.id },
    },
    update: { status: 'paid' },
  })

  // Renew the subscription period
  const newPeriodEnd = new Date(subscription.currentPeriodEnd.getTime() + 30 * 86_400_000)
  await prisma.userSubscription.update({
    where: { id: subscription.id },
    data: {
      status: 'ACTIVE',
      currentPeriodEnd: newPeriodEnd,
    },
  })
}

async function handlePaymentFailed(payment: RzpPaymentEntity) {
  if (!payment.subscription_id) return

  const subscription = await prisma.userSubscription.findUnique({
    where: { gatewaySubId: payment.subscription_id },
    include: { user: true, plan: true },
  })
  if (!subscription) return

  await prisma.paymentEvent.upsert({
    where: { gatewayEventId: payment.id },
    create: {
      subscriptionId: subscription.id,
      gatewayEventId: payment.id,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: 'failed',
    },
    update: { status: 'failed' },
  })

  await prisma.userSubscription.update({
    where: { id: subscription.id },
    data: { status: 'PAST_DUE' },
  })

  if (subscription.user.email) {
    await sendPaymentFailedEmail(
      subscription.user.email,
      subscription.user.name ?? '',
      subscription.plan.name,
    )
  }

  await prisma.notification.create({
    data: {
      userId: subscription.userId,
      type: 'PAYMENT_FAILED',
      title: 'Payment failed',
      message: 'Your subscription payment could not be processed. Please update your payment method to continue.',
      link: '/settings/billing',
    },
  })
}

async function handleSubscriptionCanceled(sub: RzpSubscriptionEntity) {
  const subscription = await prisma.userSubscription.findUnique({
    where: { gatewaySubId: sub.id },
  })
  if (!subscription) return

  await prisma.userSubscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const signature = request.headers.get('x-razorpay-signature')
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.warn('[Webhook] RAZORPAY_WEBHOOK_SECRET not set — skipping signature verification')
  }

  const bodyText = await request.text()

  if (webhookSecret && signature) {
    const valid = verifyRazorpayWebhookSignature(bodyText, signature, webhookSecret)
    if (!valid) {
      console.error('[Webhook] Invalid Razorpay signature')
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
    }
  }

  let payload: RzpWebhookPayload
  try {
    payload = JSON.parse(bodyText) as RzpWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  try {
    switch (payload.event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const sub = payload.payload.subscription?.entity
        if (sub) await handleSubscriptionActivated(sub)
        break
      }
      case 'payment.captured': {
        const payment = payload.payload.payment?.entity
        if (payment) await handlePaymentCaptured(payment)
        break
      }
      case 'payment.failed': {
        const payment = payload.payload.payment?.entity
        if (payment) await handlePaymentFailed(payment)
        break
      }
      case 'subscription.cancelled':
      case 'subscription.completed': {
        const sub = payload.payload.subscription?.entity
        if (sub) await handleSubscriptionCanceled(sub)
        break
      }
      default:
        // Unhandled event — log and return 200 so Razorpay doesn't retry
        console.log('[Webhook] Unhandled event:', payload.event)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[POST /api/subscriptions/webhook]', err)
    // Return 200 to prevent Razorpay from retrying — log for monitoring
    return NextResponse.json({ received: true, warning: 'Handler error logged' })
  }
}
