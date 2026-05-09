import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'
import { z } from 'zod'

const QuerySchema = z.object({
  communityId: z.string().optional(),
  month:       z.coerce.number().int().min(1).max(12).optional(),
  search:      z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse(Object.fromEntries(searchParams))

    const where: Prisma.FestivalWhereInput = {}
    if (query.communityId) where.communityId = query.communityId
    if (query.month)       where.month       = query.month
    if (query.search) {
      where.OR = [
        { name:        { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const festivals = await prisma.festival.findMany({
      where,
      include: { community: { select: { name: true, slug: true } } },
      orderBy: [{ month: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ festivals })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query', details: error.issues }, { status: 400 })
    }
    console.error('[GET /api/festivals]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
