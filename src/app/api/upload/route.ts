import { NextRequest, NextResponse } from 'next/server'
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '@/lib/cloudinary'

export const runtime = 'nodejs'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 30 * 1024 * 1024

const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/heic',
  'image/heif',
])

const ALLOWED_VIDEO_MIME = new Set(['video/mp4', 'video/webm', 'video/quicktime'])

function sanitizeFolder(raw: unknown): string {
  if (typeof raw !== 'string') return 'jalur/uploads'
  const trimmed = raw.trim().replace(/^\/+|\/+$/g, '')
  if (/^jalur\/[a-z0-9/_-]+$/i.test(trimmed)) {
    return trimmed
  }
  return 'jalur/uploads'
}

export async function POST(request: NextRequest) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          'Cloudinary belum dikonfigurasi. Isi CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET di .env.local.',
      },
      { status: 503 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = sanitizeFolder(formData.get('folder'))

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: 'File gambar tidak ditemukan atau kosong.' },
        { status: 400 }
      )
    }

    const isVideo = file.type.startsWith('video/')
    const isAllowed = isVideo
      ? ALLOWED_VIDEO_MIME.has(file.type)
      : ALLOWED_IMAGE_MIME.has(file.type) || file.type.startsWith('image/')

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan JPG, PNG, WEBP, AVIF, atau MP4.' },
        { status: 400 }
      )
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    if (file.size > maxBytes) {
      const limitLabel = isVideo ? '30MB' : '10MB'
      return NextResponse.json(
        { error: `Ukuran file terlalu besar. Maksimal ${limitLabel}.` },
        { status: 413 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploaded = await uploadBufferToCloudinary(buffer, {
      folder,
      resourceType: isVideo ? 'video' : 'image',
    })

    return NextResponse.json({
      url: uploaded.secure_url,
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
    })
  } catch (err) {
    console.error('Cloudinary upload error:', err)
    const message =
      err instanceof Error ? err.message : 'Gagal mengunggah media ke Cloudinary.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
