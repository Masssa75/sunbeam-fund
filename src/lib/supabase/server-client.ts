// This file should ONLY be imported in server-side code (API routes, server components)
// NEVER import this in client components

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Server-side only - these will not be exposed to the client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4'

// This client bypasses RLS and should only be used in secure server environments
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)