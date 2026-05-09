import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ─── Validation schema ────────────────────────────────────────────────────────

const scoreSchema = z.object({
  wordId: z.string().cuid(),
  transcription: z.string().min(1).max(500).trim(),
  recordingUrl: z.string().url().optional().default('/uploads/audio/placeholder.wav'),
})

// ─── String similarity (Levenshtein-based) ────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[m][n]
}

function stringSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim()
  const s2 = b.toLowerCase().trim()

  if (s1 === s2) return 1.0
  if (s1.length === 0 || s2.length === 0) return 0.0

  const maxLen = Math.max(s1.length, s2.length)
  const distance = levenshtein(s1, s2)
  return 1 - distance / maxLen
}

// ─── Scoring logic ────────────────────────────────────────────────────────────

interface ScoreResult {
  score: number
  feedback: string
}

function calculateScore(
  transcription: string,
  correctPronunciation: string,
  word: string,
): ScoreResult {
  // Primary comparison: transcription vs correct pronunciation
  const phoneticsScore = stringSimilarity(transcription, correctPronunciation)

  // Secondary: transcription vs the word itself (fallback if no pronunciation guide)
  const wordScore = stringSimilarity(transcription, word)

  // Use the best match
  const similarity = Math.max(phoneticsScore, wordScore)
  const score = Math.round(similarity * 100)

  let feedback: string
  if (score >= 95) {
    feedback = 'Perfect! Your pronunciation is excellent. You sound like a native speaker!'
  } else if (score >= 85) {
    feedback = `Great job! Your pronunciation is very good. Try to sharpen the ${correctPronunciation ? 'phonetics' : 'tonal quality'} slightly.`
  } else if (score >= 70) {
    feedback = `Good effort! You are on the right track. The correct pronunciation is "${correctPronunciation || word}". Keep practicing!`
  } else if (score >= 50) {
    feedback = `Keep going! Pronunciation takes practice. Listen carefully to the audio guide and try again. Target: "${correctPronunciation || word}"`
  } else {
    feedback = `Don't give up! This is a challenging sound pattern. Try breaking it into syllables. Reference: "${correctPronunciation || word}"`
  }

  return { score, feedback }
}

// ─── POST /api/pronunciation/score ───────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    const parsed = scoreSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    const { wordId, transcription, recordingUrl } = parsed.data
    const userId = session.user.id

    // Fetch the word with pronunciation reference
    const word = await prisma.word.findUnique({
      where: { id: wordId },
      select: {
        id: true,
        word: true,
        pronunciation: true,
        meaning: true,
        language: {
          select: { name: true, code: true },
        },
      },
    })

    if (!word) {
      return NextResponse.json({ error: 'Word not found.' }, { status: 404 })
    }

    const correctPronunciation = word.pronunciation ?? word.word
    const { score, feedback } = calculateScore(transcription, correctPronunciation, word.word)

    // Save the pronunciation attempt
    const attempt = await prisma.pronunciationAttempt.create({
      data: {
        userId,
        wordId,
        recordingUrl,
        score,
        feedback,
      },
    })

    // Award XP for perfect score
    if (score === 100) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: 20 } }, // XP_REWARDS.PRONUNCIATION_PERFECT
      })
    }

    return NextResponse.json({
      attemptId: attempt.id,
      score,
      feedback,
      word: {
        id: word.id,
        word: word.word,
        pronunciation: word.pronunciation,
        meaning: word.meaning,
        language: word.language,
      },
      transcription,
    })
  } catch (error) {
    console.error('[POST /api/pronunciation/score]', error)
    return NextResponse.json({ error: 'Failed to score pronunciation attempt.' }, { status: 500 })
  }
}
