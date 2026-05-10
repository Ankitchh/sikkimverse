import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email'

// ─── Rate limiting ────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number
  windowStart: number
}

const registerRateMap = new Map<string, RateLimitEntry>()
const REGISTER_WINDOW_MS = 60_000 // 1 minute
const REGISTER_MAX = 5 // max registrations per window per IP

function checkRegisterRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = registerRateMap.get(ip)

  if (!entry || now - entry.windowStart > REGISTER_WINDOW_MS) {
    registerRateMap.set(ip, { count: 1, windowStart: now })
    // Periodic cleanup to avoid unbounded memory growth
    if (registerRateMap.size > 10_000) {
      for (const [key, val] of registerRateMap.entries()) {
        if (now - val.windowStart > REGISTER_WINDOW_MS) registerRateMap.delete(key)
      }
    }
    return true
  }

  entry.count += 1
  return entry.count <= REGISTER_MAX
}

// ─── Turnstile verification ───────────────────────────────────────────────────

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY
  if (!secret) return true // Turnstile not configured — skip

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  })

  if (!res.ok) return false
  const data = (await res.json()) as { success: boolean }
  return data.success === true
}

// ─── Validation schema ────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  communityId: z.string().cuid('Invalid community ID').optional(),
  role: z
    .enum(['PUBLIC_USER', 'CONTRIBUTOR'])
    .default('PUBLIC_USER'),
  turnstileToken: z.string().optional(),
})

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // IP extraction for rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1'

    // Rate limit check
    if (!checkRegisterRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please wait a minute and try again.' },
        { status: 429 },
      )
    }

    // Parse and validate body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed.',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      )
    }

    const { name, email, password, communityId, role, turnstileToken } = parsed.data

    // Turnstile verification
    if (process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'CAPTCHA verification required.' },
          { status: 422 },
        )
      }
      const valid = await verifyTurnstile(turnstileToken, ip)
      if (!valid) {
        return NextResponse.json(
          { error: 'CAPTCHA verification failed. Please try again.' },
          { status: 422 },
        )
      }
    }

    // Check if email is already registered
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      )
    }

    // Validate communityId if provided
    if (communityId) {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        select: { id: true, isActive: true },
      })
      if (!community || !community.isActive) {
        return NextResponse.json(
          { error: 'Invalid or inactive community.' },
          { status: 422 },
        )
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        communityId: communityId ?? null,
        xp: 0,
        streak: 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        communityId: true,
        xp: true,
        streak: true,
        createdAt: true,
      },
    })

    // Welcome notification + email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex')
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'WELCOME',
          title: 'Welcome to SIKKIMVERSE!',
          message:
            'Thank you for joining. Verify your email to unlock full access and earn 25 bonus XP.',
          link: '/settings',
        },
      }),
      prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          token: verifyToken,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }),
    ])

    // Send emails non-blocking — don't fail registration if email fails
    Promise.all([
      sendWelcomeEmail(user.email, user.name ?? ''),
      sendVerificationEmail(user.email, user.name ?? '', verifyToken),
    ]).catch((err) => console.error('[Register] Email error:', err))

    return NextResponse.json(
      {
        message: 'Account created successfully.',
        user,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[POST /api/auth/register]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    )
  }
}
