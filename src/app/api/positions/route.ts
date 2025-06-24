import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

const ADMIN_EMAILS = [
  'marc@cyrator.com',
  'marc@minutevideos.com',
  'claude.admin@sunbeam.capital'
]

export async function GET(request: NextRequest) {
  console.log('[API Route] GET /api/positions called')
  
  const searchParams = request.nextUrl.searchParams
  const viewAsId = searchParams.get('viewAs')
  
  try {
    const cookieStore = cookies()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Ufcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.KBm6Q-s4y6sQFGGYvwF4KXdE4xCVK0k-OMOiR-vByH4'
    
    // Use service role key if viewAs is provided (admin viewing as investor)
    const supabaseKey = viewAsId ? supabaseServiceKey : supabaseAnonKey
    
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseKey,
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
    
    // If viewAs parameter is provided, validate admin access first
    if (viewAsId) {
      // When using viewAs, we still need to check the session for admin validation
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('[API Route] No session - unauthorized viewAs attempt')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      const isAdmin = ADMIN_EMAILS.includes(session.user.email || '')
      
      if (!isAdmin) {
        console.log('[API Route] Non-admin trying to use viewAs - forbidden')
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
      
      console.log('[API Route] Admin viewing as investor:', viewAsId)
      
      // Get investor details to verify they exist
      const { data: investor, error: investorError } = await supabase
        .from('investors')
        .select('*')
        .eq('id', viewAsId)
        .single()
      
      if (investorError || !investor) {
        console.log('[API Route] Investor not found:', viewAsId)
        return NextResponse.json(
          { error: 'Investor not found' },
          { status: 404 }
        )
      }
      
      // For now, return the same positions for all investors
      // In a real implementation, you might have investor-specific positions
    } else {
      // Normal authentication check when not using viewAs
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('[API Route] No session - returning empty array')
        return NextResponse.json([])
      }
      
      console.log('[API Route] Authenticated user:', session.user.email)
    }
    
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