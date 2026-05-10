import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  communityId: z.string().cuid().optional().nullable(),
})

// ─── GET /api/users/me ────────────────────────────────────────────────────────

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      xp: true,
      streak: true,
      communityId: true,
      createdAt: true,
      community: { select: { id: true, name: true, slug: true, colorPrimary: true } },
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ user })
}

// ─── PATCH /api/users/me ─────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const data = UpdateSchema.parse(body)

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.communityId !== undefined ? { communityId: data.communityId } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        communityId: true,
        community: { select: { id: true, name: true, slug: true } },
      },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 422 })
    }
    console.error('[PATCH /api/users/me]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
