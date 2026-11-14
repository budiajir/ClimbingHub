'use server'

import { neon } from '@neondatabase/serverless'
import { hashPassword } from 'better-auth/crypto'

/**
 * Server action to update user profile details in Neon Postgres.
 */
export async function updateCurrentUserProfileAction(data: {
  userId?: string
  name: string
  handle?: string
  role?: string
  hometown?: string
  countryOfOrigin?: string
}): Promise<{ success: boolean; error?: string }> {
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) {
    return { success: false, error: 'Database belum terkonfigurasi' }
  }

  try {
    let targetUserId = data.userId
    const sql = neon(connectionString)

    if (!targetUserId) {
      // Find latest registered or fallback
      const recentUsers = await sql`SELECT id FROM "user" ORDER BY created_at DESC LIMIT 1`
      if (recentUsers.length > 0) {
        targetUserId = recentUsers[0].id
      }
    }

    if (!targetUserId) {
      return { success: false, error: 'Sesi pengguna tidak ditemukan' }
    }

    // Normalize handle with @
    let normalizedHandle = data.handle?.trim()
    if (normalizedHandle && !normalizedHandle.startsWith('@')) {
      normalizedHandle = '@' + normalizedHandle
    }

    await sql`
      UPDATE "user"
      SET
        name = ${data.name.trim()},
        handle = COALESCE(${normalizedHandle || null}, handle),
        hometown = COALESCE(${data.hometown?.trim() || null}, hometown),
        country_of_origin = COALESCE(${data.countryOfOrigin?.trim() || 'Indonesia'}, country_of_origin),
        updated_at = NOW()
      WHERE id = ${targetUserId}
    `

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui profil'
    return { success: false, error: message }
  }
}

/**
 * Check if an email exists in user table and whether it has a password set.
 */
export async function checkEmailStatusAction(email: string): Promise<{
  exists: boolean
  hasPassword: boolean
  role?: string
}> {
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) {
    return { exists: false, hasPassword: false }
  }

  try {
    const sql = neon(connectionString)
    const normalizedEmail = email.trim().toLowerCase()

    const userRows = await sql`
      SELECT id, role FROM "user" WHERE LOWER(email) = ${normalizedEmail} LIMIT 1
    `

    if (userRows.length === 0) {
      return { exists: false, hasPassword: false }
    }

    const userId = userRows[0].id
    const accountRows = await sql`
      SELECT id, password FROM "account" WHERE user_id = ${userId} AND provider_id = 'credential' LIMIT 1
    `

    const hasPassword = accountRows.length > 0 && Boolean(accountRows[0].password)
    return {
      exists: true,
      hasPassword,
      role: userRows[0].role as string | undefined,
    }
  } catch {
    return { exists: false, hasPassword: false }
  }
}

/**
 * Server action to automatically activate users who previously joined via waitlist (e.g. jalur.world)
 * but do not yet have a credential password in the "account" table.
 */
export async function activateWaitlistUserAction(email: string, password: string, name?: string) {
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) {
    return { success: false, error: 'Database belum terkonfigurasi' }
  }

  try {
    const sql = neon(connectionString)
    const normalizedEmail = email.trim().toLowerCase()

    const userRows = await sql`
      SELECT id, name, role FROM "user" WHERE LOWER(email) = ${normalizedEmail} LIMIT 1
    `

    if (userRows.length === 0) {
      return { success: false, isWaitlist: false }
    }

    const user = userRows[0]

    // Check if account already exists with password
    const accountRows = await sql`
      SELECT id, password FROM "account" WHERE user_id = ${user.id} AND provider_id = 'credential' LIMIT 1
    `

    if (accountRows.length > 0 && accountRows[0].password) {
      return {
        success: false,
        isWaitlist: false,
        error: 'Akun ini sudah memiliki password. Silakan langsung masuk di tab Login.',
      }
    }

    // Hash the password and set it in account table
    const hashedPassword = await hashPassword(password)
    const accountId = 'acc_' + Math.random().toString(36).slice(2) + Date.now().toString(36)

    if (accountRows.length > 0) {
      await sql`
        UPDATE "account" SET password = ${hashedPassword}, updated_at = NOW() WHERE id = ${accountRows[0].id}
      `
    } else {
      await sql`
        INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
        VALUES (${accountId}, ${user.id}, 'credential', ${user.id}, ${hashedPassword}, NOW(), NOW())
      `
    }

    if (name && name.trim() && (!user.name || user.name === 'Jalur Climber')) {
      await sql`
        UPDATE "user" SET name = ${name.trim()}, updated_at = NOW() WHERE id = ${user.id}
      `
    }

    return { success: true, isWaitlist: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengaktifkan akun waitlist'
    return { success: false, error: message }
  }
}

export interface RegisteredClimberItem {
  id: string
  name: string
  handle: string
  city: string
  grade: string
  avatar: string
  status: string
}

/**
 * Fetch real registered climbers from Neon PostgreSQL database.
 */
export async function getRegisteredClimbersAction(): Promise<RegisteredClimberItem[]> {
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) return []

  try {
    const sql = neon(connectionString)
    const rows = await sql`
      SELECT id, name, handle, hometown, role, image_url, grade_max
      FROM "user"
      ORDER BY created_at DESC
      LIMIT 30
    `

    const fallbackAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=180&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=180&q=80',
    ]

    return rows
      .filter((u) => u.name && u.name.trim().length > 0 && !u.name.startsWith('+62'))
      .map((u, i) => {
        const cleanName = u.name.trim()
        const cleanHandle = u.handle || `@${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}`
        return {
          id: u.id,
          name: cleanName,
          handle: cleanHandle,
          city: u.hometown?.trim() || 'Indonesia',
          grade: u.grade_max || 'V4 / 5.11a',
          avatar: u.image_url || fallbackAvatars[i % fallbackAvatars.length],
          status: i % 3 === 0 ? 'Outdoor' : i % 3 === 1 ? 'At Gym' : 'Active',
        }
      })
  } catch (err) {
    console.error('getRegisteredClimbersAction error:', err)
    return []
  }
}
