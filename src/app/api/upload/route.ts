import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

// ─── File type config ─────────────────────────────────────────────────────────

type FileCategory = 'audio' | 'video' | 'image'

interface FileTypeConfig {
  mimes: string[]
  exts: string[]
  maxBytes: number
}

const FILE_TYPES: Record<FileCategory, FileTypeConfig> = {
  audio: {
    mimes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/ogg', 'audio/x-wav', 'audio/webm'],
    exts: ['.mp3', '.wav', '.ogg', '.webm'],
    maxBytes: 50 * 1024 * 1024,
  },
  video: {
    mimes: ['video/mp4', 'video/webm', 'video/x-msvideo', 'video/quicktime'],
    exts: ['.mp4', '.webm', '.mov'],
    maxBytes: 500 * 1024 * 1024,
  },
  image: {
    mimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
    maxBytes: 10 * 1024 * 1024,
  },
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 200)
}

function detectCategory(mimeType: string, ext: string): FileCategory | null {
  for (const [cat, cfg] of Object.entries(FILE_TYPES) as [FileCategory, FileTypeConfig][]) {
    if (cfg.mimes.includes(mimeType) && cfg.exts.includes(ext.toLowerCase())) {
      return cat
    }
  }
  return null
}

// ─── Supabase Storage upload (used when env vars are set) ────────────────────

async function uploadToSupabase(
  buffer: Buffer,
  uniqueName: string,
  category: FileCategory,
  mimeType: string,
): Promise<string> {
  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey    = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const bucket         = process.env.SUPABASE_STORAGE_BUCKET ?? 'sikkimverse-media'
  const objectPath     = `${category}/${uniqueName}`

  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': mimeType,
      'x-upsert': 'false',
    },
    body: buffer as unknown as BodyInit,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase upload failed: ${err}`)
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`
}

// ─── Local filesystem upload (fallback / development) ────────────────────────

async function uploadLocally(
  buffer: Buffer,
  uniqueName: string,
  category: FileCategory,
): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', category)
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, uniqueName), buffer)
  return `/uploads/${category}/${uniqueName}`
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Request must be multipart/form-data.' }, { status: 400 })
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Failed to parse form data.' }, { status: 400 })
    }

    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const originalName = file.name ?? 'upload'
    const ext          = path.extname(originalName).toLowerCase()
    const mimeType     = file.type.toLowerCase()

    const category = detectCategory(mimeType, ext)
    if (!category) {
      return NextResponse.json({
        error: 'Unsupported file type.',
        details: 'Allowed: audio (mp3/wav/ogg/webm), video (mp4/webm/mov), image (jpg/png/webp)',
      }, { status: 422 })
    }

    const cfg = FILE_TYPES[category]
    if (file.size > cfg.maxBytes) {
      return NextResponse.json({
        error: `File too large. Maximum for ${category}: ${cfg.maxBytes / (1024 * 1024)} MB.`,
      }, { status: 413 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty.' }, { status: 422 })
    }

    const safeName   = sanitizeFilename(path.basename(originalName, ext))
    const uniqueName = `${randomUUID()}_${safeName}${ext}`
    const bytes      = await file.arrayBuffer()
    const buffer     = Buffer.from(bytes)

    // Use Supabase if configured, otherwise fall back to local filesystem
    const useSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY

    const url = useSupabase
      ? await uploadToSupabase(buffer, uniqueName, category, file.type)
      : await uploadLocally(buffer, uniqueName, category)

    return NextResponse.json(
      { url, filename: uniqueName, originalName: file.name, size: file.size, mimeType: file.type, category },
      { status: 201 },
    )
  } catch (error) {
    console.error('[POST /api/upload]', error)
    return NextResponse.json({ error: 'Failed to upload file. Please try again.' }, { status: 500 })
  }
}
