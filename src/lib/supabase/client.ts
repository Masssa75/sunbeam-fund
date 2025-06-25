import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Client-side safe values only
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'

if (typeof window !== 'undefined') {
  console.log('[Supabase Client] Configuration:', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET',
    environment: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production'
  })
  
  // Warn if configuration is missing
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Client] WARNING: Missing configuration!', {
      supabaseUrl: supabaseUrl || 'MISSING',
      supabaseAnonKey: supabaseAnonKey ? 'SET' : 'MISSING'
    })
  }
}

// Singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null
let supabaseAdminInstance: ReturnType<typeof createClient<Database>> | null = null

// Create singleton client
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined
        }
      }
    )
  }
  return supabaseInstance
})()

// DEPRECATED: Use import from '@/lib/supabase/server-client' instead
// This export is kept temporarily for backward compatibility
export const supabaseAdmin = null as any