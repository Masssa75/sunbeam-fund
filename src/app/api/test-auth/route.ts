import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Create a new Supabase client for this request
    const supabase = createClient(
      'https://gualxudgbmpuhjbumfeh.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
    )
    
    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: {
          code: error.code,
          status: error.status,
        }
      }, { status: 400 })
    }
    
    // Check session
    const { data: { session } } = await supabase.auth.getSession()
    
    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      session: !!session,
      sessionDetails: session ? {
        accessToken: session.access_token.substring(0, 20) + '...',
        expiresAt: session.expires_at,
      } : null
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error.message
    }, { status: 500 })
  }
}