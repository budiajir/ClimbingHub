import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
}

function jsonResponse(data: any, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...CORS_HEADERS,
      ...(init?.headers || {}),
    },
  })
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

    const supabase = getSupabaseServerClient()

    // 1. Try to insert into dedicated 'waitlist' table first
    const { data: waitlistData, error: waitlistError } = await supabase
      .from('waitlist')
      .insert({
        name,
        email,
        source: 'jalur.world',
      })
      .select()

    if (!waitlistError && waitlistData) {
      return jsonResponse({
        success: true,
        message: 'Thank you! You have been successfully added to the Jalur beta testing waitlist.',
        destination: 'waitlist',
      })
    }

    // If waitlist table exists and returned duplicate key error (code 23505)
    if (waitlistError && waitlistError.code === '23505') {
      return jsonResponse({
        success: true,
        isExisting: true,
        message: 'Your email is already registered on the Jalur beta testing waitlist!',
        destination: 'waitlist',
      })
    }

    // 2. Fallback to existing 'users' table with role 'guest' & grade_max tag
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        role: 'guest',
        grade_max: 'Beta Tester (jalur.world)',
        ascents_count: 0,
      })
      .select()

    if (!userError && userData) {
      return jsonResponse({
        success: true,
        message: 'Thank you! You have been successfully added to the Jalur beta testing waitlist.',
        destination: 'users',
      })
    }

    // If users table returned unique email violation (code 23505)
    if (userError && userError.code === '23505') {
      return jsonResponse({
        success: true,
        isExisting: true,
        message: 'Your email is already registered in our system!',
        destination: 'users',
      })
    }

    // If both failed with another error, report failure
    console.error('Waitlist submission error:', { waitlistError, userError })
    return jsonResponse(
      {
        success: false,
        message: userError?.message || waitlistError?.message || 'Failed to save data to database.',
      },
      { status: 500 }
    )
  } catch (err: any) {
    console.error('API Waitlist error:', err)
    return jsonResponse(
      { success: false, message: err?.message || 'An error occurred on the server.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()

    // Try fetching from waitlist table first
    const { data: waitlistItems, error: waitlistErr } = await supabase
      .from('waitlist')
      .select('id, name, email, created_at, source')
      .order('created_at', { ascending: false })

    if (!waitlistErr && waitlistItems) {
      return jsonResponse({
        success: true,
        sourceTable: 'waitlist',
        total: waitlistItems.length,
        items: waitlistItems,
      })
    }

    // Fallback: fetch from users table where role is 'guest' or grade_max contains 'Beta'
    const { data: guestUsers, error: userErr } = await supabase
      .from('users')
      .select('id, name, email, created_at, grade_max')
      .or('role.eq.guest,grade_max.ilike.%Beta%')
      .order('created_at', { ascending: false })

    if (!userErr && guestUsers) {
      return jsonResponse({
        success: true,
        sourceTable: 'users',
        total: guestUsers.length,
        items: guestUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          created_at: u.created_at,
          source: u.grade_max || 'jalur.world',
        })),
      })
    }

    return jsonResponse({
      success: false,
      message: 'No registered waitlist entries found.',
      total: 0,
      items: [],
    })
  } catch (err: any) {
    return jsonResponse(
      { success: false, message: err?.message || 'Failed to fetch waitlist entries.' },
      { status: 500 }
    )
  }
}
