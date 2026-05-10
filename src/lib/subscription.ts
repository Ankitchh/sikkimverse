import { prisma } from '@/lib/prisma'
import type { SubscriptionStatus, UserSubscription, SubscriptionPlan } from '@/generated/prisma'

export const COMMUNITY_SHARE_PCT = 0.45
export const PLATFORM_SHARE_PCT = 0.55

export type SubscriptionWithPlan = UserSubscription & { plan: SubscriptionPlan }

// ─── Status helpers ───────────────────────────────────────────────────────────

export function isSubscriptionActive(sub: UserSubscription): boolean {
  if (sub.status === 'ACTIVE') return true
  if (sub.status === 'TRIALING') {
    return !sub.trialEnd || sub.trialEnd > new Date()
  }
  return false
}

export function isSubscriptionExpiringSoon(sub: UserSubscription, withinDays = 3): boolean {
  const end = sub.currentPeriodEnd
  if (!end) return false
  const diff = end.getTime() - Date.now()
  return diff > 0 && diff < withinDays * 86_400_000
}

export function daysRemaining(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000))
}

// ─── Subscription queries ─────────────────────────────────────────────────────

export async function getUserSubscription(
  userId: string,
): Promise<SubscriptionWithPlan | null> {
  return prisma.userSubscription.findUnique({
    where: { userId },
    include: { plan: true },
  })
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true, trialEnd: true, currentPeriodEnd: true },
  })
  if (!sub) return false
  return isSubscriptionActive(sub as UserSubscription)
}

// ─── Plan seed helper ─────────────────────────────────────────────────────────

export async function ensureDefaultPlans(): Promise<void> {
  const plans = [
    {
      name: 'Heritage Monthly',
      slug: 'heritage-monthly',
      description:
        'Full access to all languages, communities, and AI features. 45% of your subscription supports indigenous communities directly.',
      priceInr: 199,
      interval: 'MONTHLY' as const,
      trialDays: 7,
      features: {
        communities: 'all',
        courses: 'unlimited',
        aiTutor: true,
        aiSearch: true,
        voicePractice: true,
        writingPractice: true,
        downloads: true,
        badge: 'Heritage Supporter',
      },
    },
    {
      name: 'Heritage Annual',
      slug: 'heritage-annual',
      description:
        'Full access for a full year — save ₹590 vs monthly. Your commitment directly funds indigenous language preservation.',
      priceInr: 1799,
      interval: 'ANNUAL' as const,
      trialDays: 7,
      features: {
        communities: 'all',
        courses: 'unlimited',
        aiTutor: true,
        aiSearch: true,
        voicePractice: true,
        writingPractice: true,
        downloads: true,
        badge: 'Heritage Guardian',
        annualBonus: '200 bonus XP',
      },
    },
  ]

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    })
  }
}

// ─── Revenue calculation ──────────────────────────────────────────────────────

export interface CommunityEngagement {
  communityId: string
  contentCount: number
  viewCount: number
  contributorCount: number
}

export function calculateEngagementScore(eng: CommunityEngagement): number {
  // Weighted engagement: content weight 40%, views 40%, contributors 20%
  const contentScore = Math.log1p(eng.contentCount) * 0.4
  const viewScore = Math.log1p(eng.viewCount) * 0.4
  const contributorScore = Math.log1p(eng.contributorCount) * 0.2
  return contentScore + viewScore + contributorScore
}

export interface RevenueDistribution {
  communityId: string
  share: number // fraction of the 45% pool, e.g. 0.3 means 30% of the community pool
  amountInr: number
}

export function distributeRevenue(
  totalRevenue: number,
  engagements: CommunityEngagement[],
): RevenueDistribution[] {
  const scores = engagements.map((e) => ({
    communityId: e.communityId,
    score: calculateEngagementScore(e),
  }))

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
  const communityPool = totalRevenue * COMMUNITY_SHARE_PCT

  return scores.map((s) => {
    const share = totalScore > 0 ? s.score / totalScore : 1 / scores.length
    return {
      communityId: s.communityId,
      share,
      amountInr: communityPool * share,
    }
  })
}

// ─── Subscription status map to display labels ────────────────────────────────

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  TRIALING: 'Free Trial',
  ACTIVE: 'Active',
  PAST_DUE: 'Payment Due',
  CANCELED: 'Canceled',
  EXPIRED: 'Expired',
}

export const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  TRIALING: 'text-blue-600 bg-blue-50',
  ACTIVE: 'text-green-600 bg-green-50',
  PAST_DUE: 'text-amber-600 bg-amber-50',
  CANCELED: 'text-gray-500 bg-gray-50',
  EXPIRED: 'text-red-600 bg-red-50',
}
