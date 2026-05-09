import { NextRequest } from 'next/server'

// ─── Activity event types ─────────────────────────────────────────────────────

interface ActivityEvent {
  id: string
  type: 'word_added' | 'story_archived' | 'song_recorded' | 'learner_joined' | 'achievement_earned' | 'moderation_approved'
  community: string
  actor: string
  detail: string
  timestamp: string
}

const POOL: Omit<ActivityEvent, 'id' | 'timestamp'>[] = [
  { type: 'word_added',          community: 'Lepcha',  actor: 'Rinchen N.', detail: 'added 3 new Róng words to the dictionary' },
  { type: 'story_archived',      community: 'Bhutia',  actor: 'Sonam T.',   detail: 'archived "The Snow Lion Legend"' },
  { type: 'song_recorded',       community: 'Limbu',   actor: 'Choden O.',  detail: 'recorded a traditional Tamu Lhosar song' },
  { type: 'learner_joined',      community: 'Tamang',  actor: 'Pema Y.',    detail: 'started the Tamang Language Basics course' },
  { type: 'achievement_earned',  community: 'Sherpa',  actor: 'Jigme W.',   detail: 'earned the "Heritage Keeper" badge' },
  { type: 'word_added',          community: 'Rai',     actor: 'Mingma N.',  detail: 'contributed 7 Bantawa Rai words' },
  { type: 'story_archived',      community: 'Gurung',  actor: 'Dawa L.',    detail: 'archived a creation myth' },
  { type: 'moderation_approved', community: 'Mangar',  actor: 'Karma T.',   detail: '"Harvest Chant" recording was approved' },
  { type: 'learner_joined',      community: 'Newar',   actor: 'Nima D.',    detail: 'completed their first Newari lesson' },
  { type: 'song_recorded',       community: 'Sunwar',  actor: 'Sita R.',    detail: 'recorded a Sunwar festival song' },
]

let counter = 0

function makeEvent(): ActivityEvent {
  const base = POOL[counter % POOL.length]
  counter++
  return {
    ...base,
    id: String(Date.now()),
    timestamp: new Date().toISOString(),
  }
}

function encodeSSE(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  let intervalId: ReturnType<typeof setInterval> | null = null
  let closed = false

  const stream = new ReadableStream({
    start(controller) {
      // Send an initial heartbeat
      controller.enqueue(encoder.encode(': connected\n\n'))

      // Send activity events every 3.5 seconds
      intervalId = setInterval(() => {
        if (closed) {
          if (intervalId) clearInterval(intervalId)
          return
        }
        try {
          controller.enqueue(encoder.encode(encodeSSE(makeEvent())))
        } catch {
          if (intervalId) clearInterval(intervalId)
        }
      }, 3500)

      // Heartbeat every 25 seconds to keep the connection alive
      const heartbeat = setInterval(() => {
        if (closed) { clearInterval(heartbeat); return }
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          clearInterval(heartbeat)
        }
      }, 25_000)

      // Clean up if client disconnects
      request.signal.addEventListener('abort', () => {
        closed = true
        if (intervalId) clearInterval(intervalId)
        clearInterval(heartbeat)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
