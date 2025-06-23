import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

export async function GET() {
  console.log('[API Route] GET /api/positions called')
  
  try {
    const cookieStore = cookies()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
    
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            // Handle chunked cookies
            const cookie = cookieStore.get(name)
            if (cookie) return cookie.value
            
            // Check for chunked cookies (.0, .1, etc)
            const chunks: string[] = []
            for (let i = 0; ; i++) {
              const chunk = cookieStore.get(`${name}.${i}`)
              if (!chunk) break
              chunks.push(chunk.value)
            }
            
            if (chunks.length > 0) {
              return chunks.join('')
            }
            
            return undefined
          },
          set(name: string, value: string, options: CookieOptions) {
            // For server components, we can't set cookies in GET requests
          },
          remove(name: string, options: CookieOptions) {
            // For server components, we can't remove cookies in GET requests
          },
        },
      }
    )
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.log('[API Route] No session - returning empty array')
      return NextResponse.json([])
    }
    
    console.log('[API Route] Authenticated user:', session.user.email)
    
    // Fetch positions with authenticated context
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .order('entry_date', { ascending: false })

    if (error) {
      console.error('[API Route] Error fetching positions:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('[API Route] Successfully fetched', data?.length || 0, 'positions')
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[API Route] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    )
  }
}