import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const schema = z.object({
  token: z.string().min(64).max(64),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must include uppercase, lowercase, and a number',
    ),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  if (!authLimiter(ip).allowed) {
    return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const { token, password } = parsed.data

  try {
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true } } },
    })

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 },
      )
    }

    if (resetRecord.usedAt) {
      return NextResponse.json(
        { error: 'This reset link has already been used. Please request a new one.' },
        { status: 400 },
      )
    }

    if (resetRecord.expires < new Date()) {
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new one.' },
        { status: 400 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Update password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all active sessions (force re-login)
      prisma.session.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ])

    return NextResponse.json({ message: 'Password reset successfully. Please sign in.' })
  } catch (err) {
    console.error('[POST /api/auth/reset-password]', err)
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 })
  }
}

// GET — validate token without consuming it (for the reset form to check before rendering)
export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get('token')
  if (!token || token.length !== 64) {
    return NextResponse.json({ valid: false, reason: 'Invalid token format.' })
  }

  const record = await prisma.passwordReset.findUnique({
    where: { token },
    select: { expires: true, usedAt: true },
  })

  if (!record) return NextResponse.json({ valid: false, reason: 'Token not found.' })
  if (record.usedAt) return NextResponse.json({ valid: false, reason: 'Token already used.' })
  if (record.expires < new Date()) return NextResponse.json({ valid: false, reason: 'Token expired.' })

  return NextResponse.json({ valid: true })
}
