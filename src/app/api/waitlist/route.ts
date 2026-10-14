import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Mohon masukkan nama Anda dengan benar.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Mohon masukkan format email yang valid.' },
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
      return NextResponse.json({
        success: true,
        message: 'Terima kasih! Kamu sudah berhasil terdaftar dalam antrean beta testing Jalur.',
        destination: 'waitlist',
      })
    }

    // If waitlist table exists and returned duplicate key error (code 23505)
    if (waitlistError && waitlistError.code === '23505') {
      return NextResponse.json({
        success: true,
        isExisting: true,
        message: 'Email kamu sudah terdaftar sebelumnya di antrean beta testing Jalur!',
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
      return NextResponse.json({
        success: true,
        message: 'Terima kasih! Kamu sudah berhasil terdaftar dalam antrean beta testing Jalur.',
        destination: 'users',
      })
    }

    // If users table returned unique email violation (code 23505)
    if (userError && userError.code === '23505') {
      return NextResponse.json({
        success: true,
        isExisting: true,
        message: 'Email kamu sudah pernah terdaftar di sistem kami!',
        destination: 'users',
      })
    }

    // If both failed with another error, report failure
    console.error('Waitlist submission error:', { waitlistError, userError })
    return NextResponse.json(
      {
        success: false,
        message: userError?.message || waitlistError?.message || 'Gagal menyimpan data ke database.',
      },
      { status: 500 }
    )
  } catch (err: any) {
    console.error('API Waitlist error:', err)
    return NextResponse.json(
      { success: false, message: err?.message || 'Terjadi kesalahan pada server.' },
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
      return NextResponse.json({
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
      return NextResponse.json({
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

    return NextResponse.json({
      success: false,
      message: 'Belum ada data pendaftar.',
      total: 0,
      items: [],
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Gagal mengambil data waitlist' },
      { status: 500 }
    )
  }
}
