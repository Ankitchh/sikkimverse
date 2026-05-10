import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { authLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
})

const RESET_TTL_MS = 60 * 60 * 1000 // 1 hour

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  const rl = authLimiter(ip)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait before trying again.' },
      { status: 429 },
    )
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 422 })
  }

  const { email } = parsed.data

  // Always return the same response regardless of whether the user exists
  // This prevents email enumeration attacks
  const successResponse = NextResponse.json({
    message: 'If an account with that email exists, a password reset link has been sent.',
  })

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, passwordHash: true },
    })

    if (!user || !user.passwordHash) {
      // Don't reveal whether email exists; also don't process Google-only accounts
      return successResponse
    }

    // Invalidate any existing unused tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id, usedAt: null },
    })

    // Create a new reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + RESET_TTL_MS)

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expires },
    })

    // Send email (non-blocking — don't fail the request if email fails)
    sendPasswordResetEmail(user.email, user.name ?? '', token).catch((err) => {
      console.error('[ForgotPassword] Email send failed:', err)
    })

    return successResponse
  } catch (err) {
    console.error('[POST /api/auth/forgot-password]', err)
    return successResponse // still return success to prevent enumeration
  }
}
