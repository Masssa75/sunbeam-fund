import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    console.log('[Test Login API] Attempting login for:', email)
    
    // Create a fresh Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
    )
    
    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('[Test Login API] Login error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: {
            code: error.code,
            status: error.status
          }
        },
        { status: 401 }
      )
    }
    
    console.log('[Test Login API] Login successful for:', email)
    
    return NextResponse.json({
      success: true,
      user: data.user?.email,
      session: !!data.session,
      sessionData: {
        accessToken: data.session?.access_token?.substring(0, 20) + '...',
        expiresAt: data.session?.expires_at
      }
    })
    
  } catch (error: any) {
    console.error('[Test Login API] Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}