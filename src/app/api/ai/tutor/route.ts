import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'

// ─── Rate limiting ────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number
  windowStart: number
}

const tutorRateMap = new Map<string, RateLimitEntry>()
const TUTOR_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const TUTOR_MAX = 20 // max messages per hour per user

function checkTutorRateLimit(userId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = tutorRateMap.get(userId)

  if (!entry || now - entry.windowStart > TUTOR_WINDOW_MS) {
    tutorRateMap.set(userId, { count: 1, windowStart: now })
    // Cleanup stale entries periodically
    if (tutorRateMap.size > 5_000) {
      for (const [key, val] of tutorRateMap.entries()) {
        if (now - val.windowStart > TUTOR_WINDOW_MS) tutorRateMap.delete(key)
      }
    }
    return { allowed: true, remaining: TUTOR_MAX - 1, resetAt: now + TUTOR_WINDOW_MS }
  }

  entry.count += 1
  const remaining = Math.max(0, TUTOR_MAX - entry.count)
  const resetAt = entry.windowStart + TUTOR_WINDOW_MS
  return { allowed: entry.count <= TUTOR_MAX, remaining, resetAt }
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a warm, knowledgeable, and encouraging cultural and language tutor for Sikkim's indigenous communities. Your role is to help users learn Lepcha (Róng), Sikkimese Bhutia (Drenjongke), Limbu (Yakthung Pan), Tamang, Rai languages (Bantawa, Chamling, Kulung), Gurung (Tamu Kyui), Sherpa (Sherpali), Magar, Nepal Bhasa (Newari), and Sunwar (Koĩts) languages and their associated cultures.

Your capabilities include:
- Providing translations between English and indigenous languages
- Teaching pronunciation with phonetic guides (IPA when helpful)
- Explaining grammatical structures with clear examples
- Sharing cultural context, traditions, festivals, and significance
- Teaching indigenous scripts (Róng/Lepcha script, Sirijonga, Tamu Pye, etc.)
- Recommending learning paths and study strategies
- Encouraging learners with culturally appropriate expressions

Guidelines:
- Always be warm, patient, and culturally respectful
- When providing words or phrases, include: original script (if applicable), romanization, pronunciation guide, and meaning
- For cultural topics, provide context and significance — not just facts
- Acknowledge when you are uncertain and suggest consulting native speakers or community elders
- Celebrate even small learning achievements
- Use encouraging phrases from the relevant language when appropriate
- Be sensitive to the endangered status of these languages and the importance of preservation

If the user asks about a specific community (communityId or languageContext is provided), focus especially on that community's language and culture.`

// ─── Validation schema ────────────────────────────────────────────────────────

const tutorRequestSchema = z.object({
  message: z.string().min(1).max(2000).trim(),
  communityId: z.string().cuid().optional(),
  languageContext: z.string().max(100).trim().optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      }),
    )
    .max(20)
    .optional(),
})

// ─── Fallback response ────────────────────────────────────────────────────────

function getFallbackResponse(message: string): string {
  const greetings = ['hello', 'hi', 'namaste', 'hey']
  const isGreeting = greetings.some((g) => message.toLowerCase().includes(g))

  if (isGreeting) {
    return "Namaste! I'm your SIKKIMVERSE language tutor. I'm currently running in offline mode, but I can still help you learn about Sikkim's indigenous languages. Try asking me about specific words, phrases, or cultural practices of the Lepcha, Bhutia, Limbu, Tamang, or other communities!"
  }

  return "I'm currently in offline mode and cannot process your specific request right now. Please check your OpenAI API configuration or try again later. In the meantime, explore the community pages and lessons to continue your language learning journey!"
}

// ─── POST /api/ai/tutor ───────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const userId = session.user.id
    const { allowed, remaining, resetAt } = checkTutorRateLimit(userId)

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. You can send up to 20 messages per hour.',
          resetAt: new Date(resetAt).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(TUTOR_MAX),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
          },
        },
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    const parsed = tutorRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    const { message, communityId, languageContext, conversationHistory = [] } = parsed.data

    // Check OpenAI configuration
    const openAiKey = process.env.OPENAI_API_KEY
    if (!openAiKey) {
      // Graceful fallback
      return NextResponse.json({
        reply: getFallbackResponse(message),
        isOffline: true,
        remaining,
      })
    }

    // ── Inject community-specific context from database ──────────────────────
    let communityContext = ''
    if (communityId) {
      try {
        const { prisma } = await import('@/lib/prisma')

        const [community, words, stories, songs] = await Promise.all([
          prisma.community.findUnique({
            where: { id: communityId },
            select: { name: true, region: true, preservationScore: true },
          }),
          prisma.word.findMany({
            where: { communityId, status: 'APPROVED' },
            select: { word: true, meaning: true, pronunciation: true, partOfSpeech: true },
            orderBy: { createdAt: 'desc' },
            take: 20,
          }),
          prisma.story.findMany({
            where: { communityId, status: 'APPROVED' },
            select: { title: true, summary: true, type: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
          prisma.song.findMany({
            where: { communityId, status: 'APPROVED' },
            select: { title: true, occasion: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
        ])

        if (community) {
          communityContext += `\n\n## Active Community: ${community.name}`
          communityContext += `\nRegion: ${community.region}. Preservation score: ${community.preservationScore}%.`

          if (words.length > 0) {
            communityContext += `\n\n### Documented Vocabulary (${words.length} approved words):`
            words.slice(0, 15).forEach((w) => {
              communityContext += `\n- ${w.word}: ${w.meaning}`
              if (w.pronunciation) communityContext += ` (pronunciation: ${w.pronunciation})`
              if (w.partOfSpeech) communityContext += ` [${w.partOfSpeech}]`
            })
          }

          if (stories.length > 0) {
            communityContext += `\n\n### Archived Cultural Stories:`
            stories.forEach((s) => {
              communityContext += `\n- "${s.title}" (${s.type})${s.summary ? `: ${s.summary.slice(0, 120)}` : ''}`
            })
          }

          if (songs.length > 0) {
            communityContext += `\n\n### Cultural Songs in Archive:`
            songs.forEach((s) => {
              communityContext += `\n- "${s.title}"${s.occasion ? ` (occasion: ${s.occasion})` : ''}`
            })
          }

          communityContext += `\n\nWhen answering questions, draw on this community's documented language and cultural data above. Prioritize accuracy over guessing.`
        }
      } catch (err) {
        console.warn('[AI Tutor] Could not fetch community context:', err)
      }
    }

    // Build context-aware system prompt
    let contextualSystem = SYSTEM_PROMPT + communityContext
    if (languageContext) {
      contextualSystem += `\n\nThe user is currently focusing on: ${languageContext}.`
    }

    // Build messages array for OpenAI
    type OpenAIMessage = { role: 'system' | 'user' | 'assistant'; content: string }
    const messages: OpenAIMessage[] = [
      { role: 'system', content: contextualSystem },
      ...conversationHistory.map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ]

    // Call OpenAI with streaming
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        stream: true,
      }),
    })

    if (!openAIResponse.ok) {
      const errText = await openAIResponse.text()
      console.error('[AI Tutor] OpenAI error:', errText)

      // Graceful fallback on OpenAI error
      return NextResponse.json({
        reply: getFallbackResponse(message),
        isOffline: true,
        remaining,
      })
    }

    // Stream the response back to the client
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = openAIResponse.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter((line) => line.trim() !== '')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  continue
                }
                try {
                  const parsed = JSON.parse(data) as {
                    choices: Array<{ delta: { content?: string }; finish_reason: string | null }>
                  }
                  const content = parsed.choices[0]?.delta?.content
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
                    )
                  }
                } catch {
                  // Skip malformed chunks
                }
              }
            }
          }
        } catch (err) {
          console.error('[AI Tutor] Stream error:', err)
        } finally {
          reader.releaseLock()
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-RateLimit-Limit': String(TUTOR_MAX),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
      },
    })
  } catch (error) {
    console.error('[POST /api/ai/tutor]', error)
    return NextResponse.json({ error: 'Failed to process AI tutor request.' }, { status: 500 })
  }
}
