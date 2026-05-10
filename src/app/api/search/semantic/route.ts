import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const schema = z.object({
  query: z.string().min(2).max(200).trim(),
  communityId: z.string().cuid().optional(),
  contentTypes: z
    .array(z.enum(['word', 'story', 'song', 'recording', 'lesson']))
    .optional(),
  limit: z.number().int().min(1).max(20).optional().default(10),
})

// ─── Embedding generation ─────────────────────────────────────────────────────

async function getEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { data: Array<{ embedding: number[] }> }
    return data.data[0]?.embedding ?? null
  } catch {
    return null
  }
}

// ─── Cosine similarity (fallback for non-pgvector environments) ───────────────

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB)
  return mag === 0 ? 0 : dot / mag
}

// ─── Keyword fallback search ──────────────────────────────────────────────────

async function keywordSearch(
  query: string,
  contentTypes: string[],
  communityId: string | undefined,
  limit: number,
) {
  const communityFilter = communityId ? { communityId } : {}
  const results: Array<{
    id: string
    type: string
    title: string
    excerpt: string
    communityId: string | null
    score: number
  }> = []

  const search = query.toLowerCase()

  if (!contentTypes.length || contentTypes.includes('word')) {
    const words = await prisma.word.findMany({
      where: {
        ...communityFilter,
        status: 'APPROVED',
        OR: [
          { word: { contains: query, mode: 'insensitive' } },
          { meaning: { contains: query, mode: 'insensitive' } },
          { exampleSentence: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, word: true, meaning: true, communityId: true },
      take: limit,
    })
    words.forEach((w) =>
      results.push({
        id: w.id,
        type: 'word',
        title: w.word,
        excerpt: w.meaning.slice(0, 150),
        communityId: w.communityId,
        score: w.word.toLowerCase().startsWith(search) ? 1 : 0.7,
      }),
    )
  }

  if (!contentTypes.length || contentTypes.includes('story')) {
    const stories = await prisma.story.findMany({
      where: {
        ...communityFilter,
        status: 'APPROVED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, summary: true, communityId: true },
      take: limit,
    })
    stories.forEach((s) =>
      results.push({
        id: s.id,
        type: 'story',
        title: s.title,
        excerpt: (s.summary ?? '').slice(0, 150),
        communityId: s.communityId,
        score: s.title.toLowerCase().includes(search) ? 0.9 : 0.6,
      }),
    )
  }

  if (!contentTypes.length || contentTypes.includes('song')) {
    const songs = await prisma.song.findMany({
      where: {
        ...communityFilter,
        status: 'APPROVED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { lyrics: { contains: query, mode: 'insensitive' } },
          { occasion: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, occasion: true, communityId: true },
      take: limit,
    })
    songs.forEach((s) =>
      results.push({
        id: s.id,
        type: 'song',
        title: s.title,
        excerpt: s.occasion ?? '',
        communityId: s.communityId,
        score: 0.65,
      }),
    )
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

// ─── POST /api/search/semantic ────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  if (!apiLimiter(ip).allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const { query, communityId, contentTypes = [], limit } = parsed.data

  try {
    // Try vector search if embeddings exist
    const embedding = await getEmbedding(query)

    if (embedding) {
      // Fetch stored embeddings and rank by cosine similarity
      const stored = await prisma.contentEmbedding.findMany({
        where: {
          ...(communityId ? { communityId } : {}),
          ...(contentTypes.length ? { contentType: { in: contentTypes } } : {}),
        },
        select: {
          id: true,
          contentType: true,
          contentId: true,
          communityId: true,
          text: true,
          embeddingJson: true,
          metadata: true,
        },
        take: 500, // fetch a batch to rank locally
      })

      if (stored.length > 0) {
        const ranked = stored
          .map((doc) => {
            const storedVec = doc.embeddingJson as number[]
            const score = Array.isArray(storedVec) ? cosineSimilarity(embedding, storedVec) : 0
            return {
              id: doc.contentId,
              type: doc.contentType,
              title: (doc.metadata as Record<string, string> | null)?.title ?? doc.text.slice(0, 60),
              excerpt: doc.text.slice(0, 150),
              communityId: doc.communityId ?? null,
              score,
            }
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)

        return NextResponse.json({
          results: ranked,
          mode: 'semantic',
          query,
        })
      }
    }

    // Fall back to keyword search
    const results = await keywordSearch(query, contentTypes, communityId, limit)
    return NextResponse.json({ results, mode: 'keyword', query })
  } catch (err) {
    console.error('[POST /api/search/semantic]', err)
    return NextResponse.json({ error: 'Search failed.' }, { status: 500 })
  }
}
