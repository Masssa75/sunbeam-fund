import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2UfixvbGUiLCJpYXQiOjE3MTEzMTQ4MjEsImV4cCI6MjAyNjg5MDgyMX0.CX7lJI1o5XxOMwKHOqYBnoNNBpeQnvT4-E9SY6OeyH4',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // Generate a password reset link using the admin API
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://sunbeam.capital/reset-password'
      }
    })
    
    if (error) {
      console.error('Error generating reset link:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    if (!data || !data.properties?.action_link) {
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 })
    }
    
    // Log the reset link for manual sending (temporary solution)
    console.log('🔗 Password Reset Link Generated:')
    console.log('Email:', email)
    console.log('Reset Link:', data.properties.action_link)
    console.log('Expires in 1 hour')
    
    // Since we can't send emails directly without SMTP configuration,
    // we'll return the link in development mode
    const isDevelopment = process.env.NODE_ENV !== 'production'
    
    return NextResponse.json({ 
      success: true,
      message: 'Password reset link generated successfully',
      // Only include the link in development for testing
      ...(isDevelopment && { resetLink: data.properties.action_link })
    })
    
  } catch (err: any) {
    console.error('Custom reset password error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}