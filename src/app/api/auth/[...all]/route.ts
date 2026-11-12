import { NextRequest, NextResponse } from 'next/server'
import { toNextJsHandler } from 'better-auth/next-js'
import { getAuth } from '@/lib/auth'
import { isDatabaseConfigured } from '@/lib/db'

function getHandler() {
  return toNextJsHandler(getAuth())
}

export async function GET(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    if (request.nextUrl.pathname.endsWith('/get-session')) {
      return NextResponse.json(null, { status: 200 })
    }
    return NextResponse.json({ configured: false }, { status: 200 })
  }
  return getHandler().GET(request)
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        message:
          'Database belum dikonfigurasi (DATABASE_URL kosong). Isi .env.local atau gunakan Demo Access.',
      },
      { status: 503 }
    )
  }
  return getHandler().POST(request)
}
