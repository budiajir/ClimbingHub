'use server'

import { neon } from '@neondatabase/serverless'
import { hashPassword } from 'better-auth/crypto'

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
