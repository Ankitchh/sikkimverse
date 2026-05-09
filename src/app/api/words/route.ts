import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'
import { z } from 'zod'

const QuerySchema = z.object({
  communityId: z.string().optional(),
  languageId:  z.string().optional(),
  search:      z.string().optional(),
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
})

const CreateWordSchema = z.object({
  word:           z.string().min(1).max(200),
  meaning:        z.string().min(1).max(1000),
  pronunciation:  z.string().optional(),
  partOfSpeech:   z.string().optional(),
  exampleSentence:z.string().optional(),
  languageId:     z.string(),
  communityId:    z.string(),
  contributorId:  z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse(Object.fromEntries(searchParams))

    const where: Prisma.WordWhereInput = {}
    if (query.communityId) where.communityId = query.communityId
    if (query.languageId)  where.languageId  = query.languageId
    if (query.search) {
      where.OR = [
        { word:    { contains: query.search, mode: 'insensitive' } },
        { meaning: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const skip = (query.page - 1) * query.limit
    const [words, total] = await Promise.all([
      prisma.word.findMany({
        where,
        include: {
          language:  { select: { name: true } },
          community: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.word.count({ where }),
    ])

    return NextResponse.json({
      words,
      pagination: { total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 })
    }
    console.error('[GET /api/words]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateWordSchema.parse(body)

    const word = await prisma.word.create({
      data: {
        word:            data.word,
        meaning:         data.meaning,
        pronunciation:   data.pronunciation,
        partOfSpeech:    data.partOfSpeech,
        exampleSentence: data.exampleSentence,
        languageId:      data.languageId,
        communityId:     data.communityId,
        contributorId:   data.contributorId,
      },
      include: {
        language:  { select: { name: true } },
        community: { select: { name: true, slug: true } },
      },
    })

    return NextResponse.json({ word }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 422 })
    }
    console.error('[POST /api/words]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
