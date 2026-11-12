import { desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured, waitlist } from '@/lib/db'

export const dynamic = 'force-dynamic'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function jsonResponse(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...CORS_HEADERS,
      ...(init?.headers || {}),
    },
  })
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } } | null
  return e?.code === '23505' || e?.cause?.code === '23505'
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!name || name.length < 2) {
      return jsonResponse(
        { success: false, message: 'Please enter your name.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return jsonResponse(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    if (!isDatabaseConfigured()) {
      return jsonResponse(
        { success: false, message: 'Database connection is not configured yet.' },
        { status: 503 }
      )
    }

    const db = getDb()
    try {
      await db.insert(waitlist).values({
        name,
        email,
        source: 'jalur.world',
      })

      return jsonResponse({
        success: true,
        message: 'Thank you! You have been successfully added to the Jalur beta testing waitlist.',
        destination: 'waitlist',
      })
    } catch (insertErr) {
      if (isUniqueViolation(insertErr)) {
        return jsonResponse({
          success: true,
          isExisting: true,
          message: 'Your email is already registered on the Jalur beta testing waitlist!',
          destination: 'waitlist',
        })
      }
      throw insertErr
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred on the server.'
    console.error('API Waitlist error:', err)
    return jsonResponse(
      { success: false, message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return jsonResponse({
        success: true,
        sourceTable: 'unconfigured',
        total: 0,
        items: [],
      })
    }

    const db = getDb()
    const items = await db
      .select({
        id: waitlist.id,
        name: waitlist.name,
        email: waitlist.email,
        created_at: waitlist.createdAt,
        source: waitlist.source,
      })
      .from(waitlist)
      .orderBy(desc(waitlist.createdAt))

    return jsonResponse({
      success: true,
      sourceTable: 'waitlist',
      total: items.length,
      items,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch waitlist entries.'
    return jsonResponse(
      { success: false, message },
      { status: 500 }
    )
  }
}
