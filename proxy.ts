import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// ─── Route protection & role guards ──────────────────────────────────────────

const PROTECTED_PATTERNS = [
  /^\/dashboard(\/.*)?$/,
  /^\/profile$/,
  /^\/learn\/lesson(\/.*)?$/,
  /^\/practice(\/.*)?$/,
  /^\/settings\/billing$/,
  /^\/contribute$/,
]

// Routes that also require an active subscription
const SUBSCRIPTION_PATTERNS = [
  /^\/practice\/(voice|writing)(\/.*)?$/,
]

function requiresSubscription(pathname: string): boolean {
  return SUBSCRIPTION_PATTERNS.some((p) => p.test(pathname))
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname))
}

// Dashboard sub-route → minimum required roles
const DASHBOARD_ROLE_MAP: Record<string, string[]> = {
  '/dashboard/admin':       ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard/government':  ['GOVERNMENT_OFFICER', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/community':   ['COMMUNITY_PRESIDENT', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/moderator':   ['MODERATOR', 'COMMUNITY_PRESIDENT', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/contributor': ['CONTRIBUTOR', 'MODERATOR', 'COMMUNITY_PRESIDENT', 'GOVERNMENT_OFFICER', 'ADMIN', 'SUPER_ADMIN'],
}

function getDashboardRoles(pathname: string): string[] | null {
  for (const [prefix, roles] of Object.entries(DASHBOARD_ROLE_MAP)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return roles
  }
  return null
}

// ─── Rate limit tracking (in-memory, per worker instance) ─────────────────────

interface RateLimitEntry {
  count: number
  windowStart: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 120 // requests per window per IP

function getRateLimitHeaders(ip: string): {
  headers: Record<string, string>
  limited: boolean
} {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return {
      headers: {
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': String(RATE_LIMIT_MAX - 1),
        'X-RateLimit-Reset': String(Math.ceil((now + RATE_LIMIT_WINDOW_MS) / 1000)),
      },
      limited: false,
    }
  }

  entry.count += 1
  const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count)

  return {
    headers: {
      'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW_MS) / 1000)),
    },
    limited: entry.count > RATE_LIMIT_MAX,
  }
}

// ─── Security headers ─────────────────────────────────────────────────────────

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
  )
  return response
}

// ─── CSRF token check ─────────────────────────────────────────────────────────

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const CSRF_HEADER = 'x-csrf-token'
const CSRF_COOKIE = 'csrf-token'

function validateCsrf(request: NextRequest): boolean {
  // Skip CSRF for API routes that use their own auth (NextAuth, upload, etc.)
  if (request.nextUrl.pathname.startsWith('/api/auth')) return true
  if (!MUTATION_METHODS.has(request.method)) return true

  const headerToken = request.headers.get(CSRF_HEADER)
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value

  // If no CSRF token infrastructure is in place yet, pass through
  if (!cookieToken) return true

  return headerToken === cookieToken
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Derive IP for rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'

  const { headers: rateLimitHeaders, limited } = getRateLimitHeaders(ip)

  if (limited) {
    const response = NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
    Object.entries(rateLimitHeaders).forEach(([k, v]) => response.headers.set(k, v))
    applySecurityHeaders(response)
    return response
  }

  // CSRF check for mutation requests
  if (!validateCsrf(request)) {
    const response = NextResponse.json({ error: 'Invalid CSRF token.' }, { status: 403 })
    applySecurityHeaders(response)
    return response
  }

  // Auth check for protected routes
  if (isProtectedRoute(pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', request.url)
      const response = NextResponse.redirect(signInUrl)
      applySecurityHeaders(response)
      return response
    }

    // Subscription gate: practice routes require ACTIVE or TRIALING subscription
    if (requiresSubscription(pathname)) {
      const subStatus = token.subscriptionStatus as string | null | undefined
      const subEnd = token.subscriptionEnd as string | null | undefined
      const isActive =
        (subStatus === 'ACTIVE' || subStatus === 'TRIALING') &&
        (subEnd ? new Date(subEnd) > new Date() : true)

      if (!isActive) {
        const billingUrl = new URL('/settings/billing', request.url)
        billingUrl.searchParams.set('required', '1')
        const response = NextResponse.redirect(billingUrl)
        applySecurityHeaders(response)
        return response
      }
    }

    // Role-based dashboard guards
    const requiredRoles = getDashboardRoles(pathname)
    if (requiredRoles) {
      const userRole = (token.role as string | undefined) ?? 'PUBLIC_USER'
      if (!requiredRoles.includes(userRole)) {
        // Redirect to the user's own dashboard or learn page
        const roleRoutes: Record<string, string> = {
          ADMIN:               '/dashboard/admin',
          SUPER_ADMIN:         '/dashboard/admin',
          GOVERNMENT_OFFICER:  '/dashboard/government',
          COMMUNITY_PRESIDENT: '/dashboard/community',
          MODERATOR:           '/dashboard/moderator',
          CONTRIBUTOR:         '/dashboard/contributor',
        }
        const dest = roleRoutes[userRole] ?? '/learn'
        const response = NextResponse.redirect(new URL(dest, request.url))
        applySecurityHeaders(response)
        return response
      }
    }
  }

  // Pass through — attach rate limit + security headers
  const response = NextResponse.next()
  Object.entries(rateLimitHeaders).forEach(([k, v]) => response.headers.set(k, v))
  applySecurityHeaders(response)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)$).*)',
  ],
}
