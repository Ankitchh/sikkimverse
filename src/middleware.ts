import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// ─── Protected route patterns ─────────────────────────────────────────────────

const PROTECTED_PATTERNS = [
  /^\/dashboard(\/.*)?$/,
  /^\/profile$/,
  /^\/learn\/lesson(\/.*)?$/,
  /^\/practice(\/.*)?$/,
]

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname))
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

export async function middleware(request: NextRequest) {
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
