import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const KeySchema = z.object({
  id: z.string().optional(),
  row: z.number().int().min(0),
  col: z.number().int().min(0),
  width: z.number().min(0.5).max(4).default(1),
  primaryChar: z.string().min(1),
  primaryLabel: z.string().min(1),
  altChars: z.array(z.object({ char: z.string(), label: z.string() })).optional(),
  phoneticHint: z.string().optional(),
  audioUrl: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
})

const SaveLayoutSchema = z.object({
  id: z.string().optional(),
  communityId: z.string(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  layoutType: z.enum(['MOBILE', 'DESKTOP', 'BOTH']).default('BOTH'),
  isActive: z.boolean().default(false),
  keys: z.array(KeySchema),
})

async function requireAdmin(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return null
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && role !== 'COMMUNITY_PRESIDENT') return null
  return session
}

// ─── GET /api/admin/keyboards ────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const communityId = searchParams.get('communityId') ?? undefined

  const userRole = (session.user as { role?: string }).role
  const userCommunityId = (session.user as { communityId?: string | null }).communityId

  // Community presidents can only see their own community layouts
  const where = userRole === 'ADMIN'
    ? (communityId ? { communityId } : {})
    : { communityId: userCommunityId ?? '' }

  const layouts = await prisma.keyboardLayout.findMany({
    where,
    include: {
      community: { select: { name: true, slug: true } },
      keys: { orderBy: [{ row: 'asc' }, { col: 'asc' }] },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ layouts })
}

// ─── POST /api/admin/keyboards ───────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = SaveLayoutSchema.parse(body)

    const userId = session.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userRole = (session.user as { role?: string }).role
    const userCommunityId = (session.user as { communityId?: string | null }).communityId

    // Community presidents can only manage their own community
    if (userRole !== 'ADMIN' && data.communityId !== userCommunityId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const layout = await prisma.$transaction(async (tx) => {
      let existingLayout = data.id
        ? await tx.keyboardLayout.findUnique({ where: { id: data.id } })
        : null

      if (existingLayout) {
        // Update existing layout, delete old keys, insert new ones
        await tx.keyboardKey.deleteMany({ where: { layoutId: existingLayout.id } })
        existingLayout = await tx.keyboardLayout.update({
          where: { id: existingLayout.id },
          data: {
            name: data.name,
            description: data.description,
            layoutType: data.layoutType,
            isActive: data.isActive,
            version: { increment: 1 },
          },
        })
      } else {
        existingLayout = await tx.keyboardLayout.create({
          data: {
            communityId: data.communityId,
            name: data.name,
            slug: data.slug,
            description: data.description,
            layoutType: data.layoutType,
            isActive: data.isActive,
            createdById: userId,
          },
        })
      }

      const layoutId = existingLayout.id

      await tx.keyboardKey.createMany({
        data: data.keys.map((k, idx) => ({
          layoutId,
          row: k.row,
          col: k.col,
          width: k.width,
          primaryChar: k.primaryChar,
          primaryLabel: k.primaryLabel,
          altChars: k.altChars ?? [],
          phoneticHint: k.phoneticHint,
          audioUrl: k.audioUrl,
          sortOrder: k.sortOrder ?? idx,
        })),
      })

      return tx.keyboardLayout.findUnique({
        where: { id: layoutId },
        include: { keys: { orderBy: [{ row: 'asc' }, { col: 'asc' }] } },
      })
    })

    return NextResponse.json({ layout }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 422 })
    }
    console.error('[POST /api/admin/keyboards]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── DELETE /api/admin/keyboards ─────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const layout = await prisma.keyboardLayout.findUnique({ where: { id } })
  if (!layout) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const userRole = (session.user as { role?: string }).role
  const userCommunityId = (session.user as { communityId?: string | null }).communityId
  if (userRole !== 'ADMIN' && layout.communityId !== userCommunityId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.keyboardLayout.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
