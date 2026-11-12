import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary'

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  )
}

export function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary belum dikonfigurasi. Tambahkan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET di .env.local.'
    )
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })

  return cloudinary
}

export interface UploadBufferOptions {
  folder?: string
  resourceType?: 'image' | 'video' | 'auto'
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: UploadBufferOptions = {}
): Promise<UploadApiResponse> {
  const client = getCloudinary()
  const resourceType = options.resourceType || 'auto'

  const uploadOptions: UploadApiOptions = {
    folder: options.folder || 'jalur/uploads',
    resource_type: resourceType,
    quality: 'auto',
    ...(resourceType !== 'video' ? { fetch_format: 'auto' } : {}),
  }

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error || !result) {
        reject(error || new Error('Cloudinary upload failed without result.'))
        return
      }
      resolve(result)
    })

    stream.end(buffer)
  })
}
