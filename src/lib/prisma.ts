import { PrismaClient } from '@/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

function resolveConnectionString(): string {
  // DIRECT_DATABASE_URL takes precedence when available (needed for PrismaPg adapter)
  if (process.env.DIRECT_DATABASE_URL) return process.env.DIRECT_DATABASE_URL

  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set')

  // prisma+postgres:// URLs embed the real postgres URL in the base64 api_key param
  if (url.startsWith('prisma+postgres://')) {
    try {
      const apiKey = new URL(url).searchParams.get('api_key') ?? ''
      const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString('utf8'))
      if (decoded.databaseUrl) return decoded.databaseUrl
    } catch {
      // fall through to raw URL
    }
  }

  return url
}

function createPrismaClient() {
  const connectionString = resolveConnectionString()
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
