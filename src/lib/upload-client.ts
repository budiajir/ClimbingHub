'use client'

export interface UploadedMediaResult {
  secureUrl: string
  publicId: string
  width?: number
  height?: number
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 30 * 1024 * 1024

export function validateMediaFile(
  file: File,
  options: { allowVideo?: boolean } = {}
): string | null {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')

  if (!isImage && !(options.allowVideo && isVideo)) {
    return options.allowVideo
      ? 'Format file harus berupa gambar (JPG/PNG/WEBP) atau video (MP4/WEBM).'
      : 'Format file harus berupa gambar (JPG, PNG, WEBP).'
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (file.size > maxBytes) {
    return isVideo
      ? 'Ukuran video maksimal 30MB.'
      : 'Ukuran gambar maksimal 10MB.'
  }

  return null
}

export async function uploadMediaToCloudinary(
  file: File,
  folder = 'jalur/uploads',
  options: { allowVideo?: boolean } = {}
): Promise<UploadedMediaResult> {
  const validationError = validateMediaFile(file, options)
  if (validationError) {
    throw new Error(validationError)
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const payload = (await response.json().catch(() => ({}))) as {
    secure_url?: string
    url?: string
    public_id?: string
    width?: number
    height?: number
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.error || 'Gagal mengunggah gambar ke Cloudinary.')
  }

  const secureUrl = payload.secure_url || payload.url
  if (!secureUrl) {
    throw new Error('Respons upload tidak mengandung URL gambar.')
  }

  return {
    secureUrl,
    publicId: payload.public_id || '',
    width: payload.width,
    height: payload.height,
  }
}

export async function canvasToJpegFile(
  canvas: HTMLCanvasElement,
  filename = 'video-thumb.jpg'
): Promise<File> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((result) => resolve(result), 'image/jpeg', 0.85)
  )

  if (!blob) {
    throw new Error('Gagal membuat thumbnail gambar dari video.')
  }

  return new File([blob], filename, { type: 'image/jpeg' })
}
