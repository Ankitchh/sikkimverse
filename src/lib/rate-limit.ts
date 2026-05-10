// In-memory rate limiter — per worker instance.
// For multi-instance deployments, replace with Redis (e.g. Upstash).

interface Entry {
  count: number
  windowStart: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number // unix seconds
  limit: number
}

export function createRateLimiter(options: {
  windowMs: number
  max: number
  maxMapSize?: number
}) {
  const { windowMs, max, maxMapSize = 50_000 } = options
  const map = new Map<string, Entry>()

  return function check(key: string): RateLimitResult {
    const now = Date.now()
    const entry = map.get(key)

    if (!entry || now - entry.windowStart > windowMs) {
      map.set(key, { count: 1, windowStart: now })

      if (map.size > maxMapSize) {
        for (const [k, v] of map.entries()) {
          if (now - v.windowStart > windowMs) map.delete(k)
        }
      }

      return {
        allowed: true,
        remaining: max - 1,
        resetAt: Math.ceil((now + windowMs) / 1000),
        limit: max,
      }
    }

    entry.count += 1
    return {
      allowed: entry.count <= max,
      remaining: Math.max(0, max - entry.count),
      resetAt: Math.ceil((entry.windowStart + windowMs) / 1000),
      limit: max,
    }
  }
}

// Shared limiters for common endpoints
export const apiLimiter = createRateLimiter({ windowMs: 60_000, max: 60 })
export const authLimiter = createRateLimiter({ windowMs: 60_000, max: 10 })
export const paymentLimiter = createRateLimiter({ windowMs: 60_000, max: 5 })
