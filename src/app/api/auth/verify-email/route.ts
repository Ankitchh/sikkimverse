import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

// GET /api/auth/verify-email?token=xxx
export async function GET(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  if (!authLimiter(ip).allowed) {
    return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 })
  }

  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=missing-token', request.url))
  }

  try {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, emailVerified: true } } },
    })

    if (!record) {
      return NextResponse.redirect(new URL('/auth/verify-email?error=invalid', request.url))
    }

    if (record.expires < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { id: record.id } })
      return NextResponse.redirect(new URL('/auth/verify-email?error=expired', request.url))
    }

    if (record.user.emailVerified) {
      // Already verified — just redirect to success
      await prisma.emailVerificationToken.delete({ where: { id: record.id } })
      return NextResponse.redirect(new URL('/auth/verify-email?success=1', request.url))
    }

    // Mark email as verified and delete the token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.delete({ where: { id: record.id } }),
    ])

    // Award bonus XP for verifying email
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { xp: { increment: 25 } },
      }),
      prisma.notification.create({
        data: {
          userId: record.userId,
          type: 'EMAIL_VERIFIED',
          title: 'Email verified!',
          message: 'Your email has been verified and you earned 25 XP. Your account is fully set up.',
          link: '/learn',
        },
      }),
    ])

    return NextResponse.redirect(new URL('/auth/verify-email?success=1', request.url))
  } catch (err) {
    console.error('[GET /api/auth/verify-email]', err)
    return NextResponse.redirect(new URL('/auth/verify-email?error=server', request.url))
  }
}
