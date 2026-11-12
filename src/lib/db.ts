import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from '@/db/schema'

let cachedDb: NeonHttpDatabase<typeof schema> | null = null

/**
 * Returns true when DATABASE_URL is configured (non-empty) in the server environment.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
}

/**
 * Lazily initializes and caches the Neon + Drizzle ORM instance.
 * Defers reading DATABASE_URL until runtime so Next.js build succeeds without an active DB.
 */
export function getDb(): NeonHttpDatabase<typeof schema> {
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not configured. Add your Neon PostgreSQL connection string to .env.local.'
    )
  }

  if (!cachedDb) {
    const sql = neon(connectionString)
    cachedDb = drizzle(sql, { schema })
  }

  return cachedDb
}

/**
 * Lazy proxy for standard Drizzle usage (`import { db } from '@/lib/db'`).
 */
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver)
  },
})

export * from '@/db/schema'
