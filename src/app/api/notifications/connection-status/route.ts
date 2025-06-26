import { NextResponse } from 'next/server'
import { getServerAuth } from '@/lib/supabase/server-auth'
import { supabaseAdmin } from '@/lib/supabase/server-client'

export async function GET() {
  try {
    const authResult = await getServerAuth()
    
    if (!authResult.user) {
      console.log('[connection-status] No authenticated user')
      return NextResponse.json({ is_connected: false })
    }
    
    console.log('[connection-status] Checking for user:', authResult.user.email)
    
    const supabase = supabaseAdmin
    
    // Check if user has an investor record
    const { data: investor, error: investorError } = await supabase
      .from('investors')
      .select('id')
      .eq('email', authResult.user.email)
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