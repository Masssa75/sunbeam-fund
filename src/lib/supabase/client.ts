import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Use environment variables with proper fallbacks
// TEMPORARY: Hardcode values if env vars are missing (remove after Netlify is configured)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.8V_9hWPPzQqWfMgGqnCXlzZNbZcAdowOk9kHWPNJb0s'

// Log configuration status for debugging
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

// For server-side operations (Edge Functions, API routes)
export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient<Database>(
      supabaseUrl || 'https://placeholder.supabase.co',
      serviceRoleKey || 'placeholder-service-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  return supabaseAdminInstance
})()