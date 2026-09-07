import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykhgdptnhbahvosfzhfd.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraGdkcHRuaGJhaHZvc2Z6aGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODYzNzEsImV4cCI6MjA5NDg2MjM3MX0.nZ3CqW9QgtVfsmqX6JuKnXMj1l-s8HCoqF6646biQ0s'

// Browser client (singleton) — safe for client components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let browserClient: any = null

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
}

// Server client — creates a new instance per request for isolation
export function getSupabaseServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}
