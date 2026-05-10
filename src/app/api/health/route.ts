import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const results: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {}

  // DB ping
  const dbStart = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    results.db = { ok: true, latencyMs: Date.now() - dbStart }
  } catch (e) {
    results.db = { ok: false, error: String(e) }
  }

  // Auth config check (NextAuth relies on NEXTAUTH_SECRET)
  results.auth = {
    ok: Boolean(process.env.NEXTAUTH_SECRET),
    error: process.env.NEXTAUTH_SECRET ? undefined : 'NEXTAUTH_SECRET not configured',
  }

  // AI config check
  results.ai = {
    ok: Boolean(process.env.OPENAI_API_KEY),
    error: process.env.OPENAI_API_KEY ? undefined : 'OPENAI_API_KEY not configured — AI tutor in offline mode',
  }

  const allOk = Object.values(results).every((r) => r.ok)

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      services: results,
      checkedAt: new Date().toISOString(),
    },
    { status: allOk ? 200 : 207 },
  )
}
