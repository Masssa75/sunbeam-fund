import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server-client'

export async function GET() {
  try {
    const debug = {
      step: 'start',
      user: null,
      investor: null,
      telegram: null,
      errors: []
    }

    // Step 1: Get auth using same approach as session API
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
    
    debug.user = session?.user ? {
      id: session.user.id,
      email: session.user.email
    } : null
    
    if (error || !session) {
      debug.step = 'no-auth'
      return NextResponse.json(debug)
    }
    
    debug.step = 'has-auth'
    
    // Step 2: Check investor
    const { data: investor, error: investorError } = await supabaseAdmin
      .from('investors')
      .select('*')
      .eq('email', session.user.email)
      .single()
    
    if (investorError) {
      debug.errors.push({ step: 'investor', error: investorError.message })
    }
    
    debug.investor = investor
    debug.step = investor ? 'has-investor' : 'no-investor'
    
    if (!investor) {
      return NextResponse.json(debug)
    }
    
    // Step 3: Check telegram
    const { data: telegram, error: telegramError } = await supabaseAdmin
      .from('investor_telegram')
      .select('*')
      .eq('investor_id', investor.id)
      .eq('is_active', true)
      .single()
    
    if (telegramError) {
      debug.errors.push({ step: 'telegram', error: telegramError.message })
    }
    
    debug.telegram = telegram
    debug.step = telegram ? 'has-telegram' : 'no-telegram'
    
    return NextResponse.json(debug)
    
  } catch (error) {
    return NextResponse.json({
      step: 'error',
      error: error.message
    })
  }
}