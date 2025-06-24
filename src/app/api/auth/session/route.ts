import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 })
        },
      },
    }
  )

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return NextResponse.json({ authenticated: false })
    }
    
    // Check if user is admin
    let isAdmin = false
    
    // First check hardcoded admin emails
    if (session.user.email === 'marc@cyrator.com' || session.user.email === 'marc@minutevideos.com') {
      isAdmin = true
    } else if (session.user.id) {
      // Fall back to admin_users table
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', session.user.id)
        .single()
      
      isAdmin = !!data
    }
    
    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email
      },
      isAdmin
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}