import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

// ─── Allowed types and limits ─────────────────────────────────────────────────

type FileCategory = 'audio' | 'video' | 'image'

interface FileTypeConfig {
  mimes: string[]
  exts: string[]
  maxBytes: number
}

const FILE_TYPES: Record<FileCategory, FileTypeConfig> = {
  audio: {
    mimes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/ogg', 'audio/x-wav'],
    exts: ['.mp3', '.wav', '.ogg'],
    maxBytes: 50 * 1024 * 1024, // 50 MB
  },
  video: {
    mimes: ['video/mp4', 'video/webm', 'video/x-msvideo'],
    exts: ['.mp4', '.webm'],
    maxBytes: 500 * 1024 * 1024, // 500 MB
  },
  image: {
    mimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
    maxBytes: 10 * 1024 * 1024, // 10 MB
  },
}

// ─── Filename sanitizer ───────────────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  // Strip directory traversal and special characters; keep alphanumeric, dash, underscore, dot
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.') // collapse multiple dots
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

// ─── POST /api/upload ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Auth check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data.' },
        { status: 400 },
      )
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
    const ext = path.extname(originalName).toLowerCase()
    const mimeType = file.type.toLowerCase()

    // Detect category
    const category = detectCategory(mimeType, ext)
    if (!category) {
      return NextResponse.json(
        {
          error: 'Unsupported file type.',
          details:
            'Allowed: audio (mp3/wav/ogg), video (mp4/webm), image (jpg/png/webp)',
        },
        { status: 422 },
      )
    }

    // Check size
    const cfg = FILE_TYPES[category]
    if (file.size > cfg.maxBytes) {
      const limitMB = cfg.maxBytes / (1024 * 1024)
      return NextResponse.json(
        { error: `File too large. Maximum size for ${category}: ${limitMB} MB.` },
        { status: 413 },
      )
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty.' }, { status: 422 })
    }

    // Build safe filename: uuid + sanitized original
    const safeName = sanitizeFilename(path.basename(originalName, ext))
    const uniqueName = `${randomUUID()}_${safeName}${ext}`

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', category)
    await mkdir(uploadDir, { recursive: true })

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(path.join(uploadDir, uniqueName), buffer)

    const fileUrl = `/uploads/${category}/${uniqueName}`

    return NextResponse.json(
      {
        url: fileUrl,
        filename: uniqueName,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        category,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[POST /api/upload]', error)
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 },
    )
  }
}
