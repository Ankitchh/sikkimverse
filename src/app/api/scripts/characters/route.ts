import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const QuerySchema = z.object({
  communityId: z.string().optional(),
  communitySlug: z.string().optional(),
  group: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
})

// ─── GET /api/scripts/characters ─────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse(Object.fromEntries(searchParams))

    let communityId = query.communityId

    // Resolve slug → id if needed
    if (!communityId && query.communitySlug) {
      const community = await prisma.community.findUnique({
        where: { slug: query.communitySlug },
        select: { id: true },
      })
      communityId = community?.id
    }

    const where = {
      isPublished: true,
      ...(communityId ? { communityId } : {}),
      ...(query.group ? { group: query.group } : {}),
    }

    const characters = await prisma.scriptCharacter.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      take: query.limit,
      select: {
        id: true,
        character: true,
        unicode: true,
        phonetic: true,
        ipa: true,
        meaning: true,
        strokeCount: true,
        strokeData: true,
        audioUrl: true,
        group: true,
        sortOrder: true,
        community: { select: { name: true, slug: true, colorPrimary: true } },
      },
    })

    return NextResponse.json({ characters, total: characters.length })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query', details: error.issues }, { status: 400 })
    }
    console.error('[GET /api/scripts/characters]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
