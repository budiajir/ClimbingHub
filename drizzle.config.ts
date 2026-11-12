import 'dotenv/config'
import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Load .env.local if present so Drizzle CLI picks up local Next.js env vars
config({ path: '.env.local', override: false })

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
})
