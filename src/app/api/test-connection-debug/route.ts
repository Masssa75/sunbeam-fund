import { NextResponse } from 'next/server'
import { getServerAuth } from '@/lib/supabase/server-auth'
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

    // Step 1: Get auth
    const authResult = await getServerAuth()
    debug.user = authResult.user ? {
      id: authResult.user.id,
      email: authResult.user.email
    } : null
    
    if (!authResult.user) {
      debug.step = 'no-auth'
      return NextResponse.json(debug)
    }
    
    debug.step = 'has-auth'
    
    // Step 2: Check investor
    const { data: investor, error: investorError } = await supabaseAdmin
      .from('investors')
      .select('*')
      .eq('email', authResult.user.email)
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