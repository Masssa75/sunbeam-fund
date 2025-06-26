import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get the origin for the redirect URL
    const origin = request.headers.get('origin') || 'https://sunbeam.capital'
    const redirectTo = `${origin}/auth/reset-password`
    
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    })
    
    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send reset email' },
      { status: 500 }
    )
  }
}