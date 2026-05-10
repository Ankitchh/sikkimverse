import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const QuerySchema = z.object({
  communityId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse(Object.fromEntries(searchParams))

    const languages = await prisma.language.findMany({
      where: query.communityId ? { communityId: query.communityId } : {},
      select: { id: true, name: true, code: true, communityId: true },
      orderBy: { name: 'asc' },
      take: query.limit,
    })

    return NextResponse.json({ languages })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
    }
    console.error('[GET /api/languages]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
