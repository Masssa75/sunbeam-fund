import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server-client'

// Force dynamic rendering to access cookies
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Use the same approach as the session API
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

    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      console.log('[connection-status] No session found')
      return NextResponse.json({ is_connected: false })
    }
    
    console.log('[connection-status] Checking for user:', session.user.email)
    
    // Check if user has an investor record using admin client
    const { data: investor, error: investorError } = await supabaseAdmin
      .from('investors')
      .select('id')
      .eq('email', session.user.email)
      .single()
    
    if (investorError || !investor) {
      console.log('[connection-status] No investor record found:', investorError?.message)
      return NextResponse.json({ is_connected: false })
    }
    
    console.log('[connection-status] Found investor:', investor.id)
    
    // Check Telegram connection
    const { data: telegramConnection, error: telegramError } = await supabase
      .from('investor_telegram')
      .select('telegram_username, is_active')
      .eq('investor_id', investor.id)
      .eq('is_active', true)
      .single()
    
    if (telegramError || !telegramConnection) {
      console.log('[connection-status] No active Telegram connection:', telegramError?.message)
      return NextResponse.json({ is_connected: false })
    }
    
    console.log('[connection-status] Found Telegram connection:', telegramConnection)
    
    return NextResponse.json({
      is_connected: true,
      telegram_username: telegramConnection.telegram_username
    })
    
  } catch (error) {
    console.error('[connection-status] Error:', error)
    return NextResponse.json({ is_connected: false })
  }
}