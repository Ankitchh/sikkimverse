import Razorpay from 'razorpay'
import crypto from 'crypto'

// ─── Client singleton ─────────────────────────────────────────────────────────

let _client: Razorpay | null = null

function getClient(): Razorpay {
  if (_client) return _client
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set')
  }
  _client = new Razorpay({ key_id, key_secret })
  return _client
}

// ─── Plan management ──────────────────────────────────────────────────────────

export interface RazorpayPlanParams {
  name: string
  description: string
  amountInPaise: number  // e.g. 19900 for ₹199
  interval: number       // e.g. 1 for monthly
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export async function createRazorpayPlan(params: RazorpayPlanParams) {
  const rzp = getClient()
  return rzp.plans.create({
    period: params.period,
    interval: params.interval,
    item: {
      name: params.name,
      description: params.description,
      amount: params.amountInPaise,
      currency: 'INR',
    },
    notes: { platform: 'sikkimverse' },
  })
}

// ─── Subscription management ──────────────────────────────────────────────────

export interface CreateSubscriptionParams {
  planId: string          // Razorpay plan_id
  totalCount?: number     // number of billing cycles (0 = forever)
  customerNotify?: 0 | 1
  addons?: Array<{ item: { name: string; amount: number; currency: string } }>
  notes?: Record<string, string>
  startAt?: number        // unix timestamp for deferred start
}

export async function createRazorpaySubscription(params: CreateSubscriptionParams) {
  const rzp = getClient()
  return rzp.subscriptions.create({
    plan_id: params.planId,
    total_count: params.totalCount ?? 120,     // 10 years default
    quantity: 1,
    customer_notify: params.customerNotify ?? 1,
    addons: params.addons ?? [],
    notes: { platform: 'sikkimverse', ...params.notes },
    ...(params.startAt ? { start_at: params.startAt } : {}),
  })
}

export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd: boolean = true,
) {
  const rzp = getClient()
  return rzp.subscriptions.cancel(subscriptionId, cancelAtCycleEnd)
}

export async function fetchRazorpaySubscription(subscriptionId: string) {
  const rzp = getClient()
  return rzp.subscriptions.fetch(subscriptionId)
}

// ─── Webhook verification ─────────────────────────────────────────────────────

export function verifyRazorpayWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}

// ─── Payment verification (checkout) ─────────────────────────────────────────

export function verifyRazorpayPaymentSignature(params: {
  razorpay_order_id?: string
  razorpay_subscription_id?: string
  razorpay_payment_id: string
  razorpay_signature: string
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET ?? ''
  const { razorpay_payment_id, razorpay_signature } = params
  const id = params.razorpay_order_id ?? params.razorpay_subscription_id ?? ''
  const payload = `${id}|${razorpay_payment_id}`
  try {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(razorpay_signature, 'hex'),
    )
  } catch {
    return false
  }
}

// ─── Amount helpers ───────────────────────────────────────────────────────────

export function inrToPaise(inr: number): number {
  return Math.round(inr * 100)
}

export function paiseToInr(paise: number): number {
  return paise / 100
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount)
}
