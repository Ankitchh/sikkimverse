import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { authLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const RESEND_COOLDOWN_MS = 5 * 60 * 1000   // 5 minute cooldown between resends

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  if (!authLimiter(ip).allowed) {
    return NextResponse.json({ error: 'Too many attempts. Please wait.' }, { status: 429 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, emailVerified: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified.' }, { status: 409 })
    }

    // Check cooldown — delete stale tokens, check for recent ones
    const recent = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_MS) },
      },
    })

    if (recent) {
      const waitSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - recent.createdAt.getTime())) / 1000,
      )
      return NextResponse.json(
        { error: `Please wait ${waitSeconds} seconds before requesting another verification email.` },
        { status: 429 },
      )
    }

    // Delete any old tokens
    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } })

    // Create new token
    const token = crypto.randomBytes(32).toString('hex')
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expires: new Date(Date.now() + VERIFY_TTL_MS),
      },
    })

    await sendVerificationEmail(user.email, user.name ?? '', token)

    return NextResponse.json({ message: 'Verification email sent. Please check your inbox.' })
  } catch (err) {
    console.error('[POST /api/auth/resend-verification]', err)
    return NextResponse.json({ error: 'Failed to send verification email.' }, { status: 500 })
  }
}
