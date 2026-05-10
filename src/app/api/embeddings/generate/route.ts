import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const schema = z.object({
  contentType: z.enum(['word', 'story', 'song', 'recording', 'lesson']),
  contentId: z.string().cuid(),
})

// ─── Embedding generation ─────────────────────────────────────────────────────

async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { data: Array<{ embedding: number[] }> }
    return data.data[0]?.embedding ?? null
  } catch {
    return null
  }
}

// ─── Content fetchers ─────────────────────────────────────────────────────────

async function fetchContentText(
  type: string,
  id: string,
): Promise<{ text: string; communityId: string | null; metadata: Record<string, string> } | null> {
  switch (type) {
    case 'word': {
      const w = await prisma.word.findUnique({
        where: { id },
        select: { word: true, meaning: true, exampleSentence: true, partOfSpeech: true, communityId: true },
      })
      if (!w) return null
      return {
        text: [w.word, w.meaning, w.exampleSentence, w.partOfSpeech].filter(Boolean).join('. '),
        communityId: w.communityId,
        metadata: { title: w.word, type: 'word' },
      }
    }
    case 'story': {
      const s = await prisma.story.findUnique({
        where: { id },
        select: { title: true, summary: true, content: true, communityId: true },
      })
      if (!s) return null
      const text = `${s.title}. ${s.summary ?? ''} ${s.content.slice(0, 4000)}`
      return { text, communityId: s.communityId, metadata: { title: s.title, type: 'story' } }
    }
    case 'song': {
      const sg = await prisma.song.findUnique({
        where: { id },
        select: { title: true, lyrics: true, occasion: true, communityId: true },
      })
      if (!sg) return null
      const text = [sg.title, sg.occasion, sg.lyrics?.slice(0, 2000)].filter(Boolean).join('. ')
      return { text, communityId: sg.communityId, metadata: { title: sg.title, type: 'song' } }
    }
    case 'recording': {
      const r = await prisma.recording.findUnique({
        where: { id },
        select: { title: true, description: true, transcription: true, translation: true, communityId: true },
      })
      if (!r) return null
      const text = [r.title, r.description, r.transcription, r.translation].filter(Boolean).join('. ')
      return { text, communityId: r.communityId, metadata: { title: r.title, type: 'recording' } }
    }
    case 'lesson': {
      const l = await prisma.lesson.findUnique({
        where: { id },
        select: { title: true, description: true, content: true, course: { select: { communityId: true } } },
      })
      if (!l) return null
      const contentStr = typeof l.content === 'object' ? JSON.stringify(l.content).slice(0, 3000) : ''
      const text = [l.title, l.description, contentStr].filter(Boolean).join('. ')
      return {
        text,
        communityId: l.course.communityId,
        metadata: { title: l.title, type: 'lesson' },
      }
    }
    default:
      return null
  }
}

// ─── POST /api/embeddings/generate ───────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  // Only admins and moderators can trigger embedding generation
  const role = session.user.role
  if (!['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 })
  }

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
    return NextResponse.json({ error: 'Validation failed.', details: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const { contentType, contentId } = parsed.data

  try {
    const content = await fetchContentText(contentType, contentId)
    if (!content) {
      return NextResponse.json({ error: 'Content not found.' }, { status: 404 })
    }

    const embedding = await generateEmbedding(content.text)
    if (!embedding) {
      return NextResponse.json({
        message: 'OpenAI not configured — embedding stored without vector.',
        stored: false,
      })
    }

    await prisma.contentEmbedding.upsert({
      where: { contentType_contentId: { contentType, contentId } },
      create: {
        contentType,
        contentId,
        communityId: content.communityId,
        text: content.text.slice(0, 4000),
        embeddingJson: embedding,
        metadata: content.metadata,
      },
      update: {
        text: content.text.slice(0, 4000),
        embeddingJson: embedding,
        metadata: content.metadata,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Embedding generated and stored.',
      contentType,
      contentId,
      dimensions: embedding.length,
    })
  } catch (err) {
    console.error('[POST /api/embeddings/generate]', err)
    return NextResponse.json({ error: 'Failed to generate embedding.' }, { status: 500 })
  }
}

// ─── POST /api/embeddings/generate (bulk) ─────────────────────────────────────
// GET with ?batch=true runs a batch across unembedded approved content

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const role = session.user.role
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 })
  }

  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') ?? '20'), 50)

  try {
    // Find approved content without embeddings
    const existingEmbeddings = await prisma.contentEmbedding.findMany({
      select: { contentType: true, contentId: true },
    })
    const existing = new Set(existingEmbeddings.map((e) => `${e.contentType}:${e.contentId}`))

    const [words, stories, songs] = await Promise.all([
      prisma.word.findMany({ where: { status: 'APPROVED' }, select: { id: true }, take: limit }),
      prisma.story.findMany({ where: { status: 'APPROVED' }, select: { id: true }, take: limit }),
      prisma.song.findMany({ where: { status: 'APPROVED' }, select: { id: true }, take: limit }),
    ])

    const pending = [
      ...words.filter((w) => !existing.has(`word:${w.id}`)).map((w) => ({ type: 'word', id: w.id })),
      ...stories.filter((s) => !existing.has(`story:${s.id}`)).map((s) => ({ type: 'story', id: s.id })),
      ...songs.filter((s) => !existing.has(`song:${s.id}`)).map((s) => ({ type: 'song', id: s.id })),
    ].slice(0, limit)

    return NextResponse.json({
      pending: pending.length,
      items: pending,
      message: `${pending.length} items need embeddings. POST each to /api/embeddings/generate.`,
    })
  } catch (err) {
    console.error('[GET /api/embeddings/generate]', err)
    return NextResponse.json({ error: 'Failed to check embedding status.' }, { status: 500 })
  }
}
