import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Provide fallback values for build time when env vars might not be available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Only create clients if we have real values (not placeholders)
const hasValidConfig = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key'

export const supabase = hasValidConfig 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null as any

// For server-side operations (Edge Functions, API routes)
export const supabaseAdmin = hasValidConfig && serviceRoleKey !== 'placeholder-service-key'
  ? createClient<Database>(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null as any