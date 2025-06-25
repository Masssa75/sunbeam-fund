import { NextResponse } from 'next/server'
import { getServerAuth } from '@/lib/supabase/server-auth'
import { supabaseAdmin } from '@/lib/supabase/server-client'

export async function GET() {
  try {
    const authResult = await getServerAuth()
    
    if (!authResult.user) {
      return NextResponse.json({ is_connected: false })
    }
    
    const supabase = supabaseAdmin
    
    // Check if user has an investor record
    const { data: investor } = await supabase
      .from('investors')
      .select('id')
      .eq('id', authResult.user.id)
      .single()
    
    if (!investor) {
      return NextResponse.json({ is_connected: false })
    }
    
    // Check Telegram connection
    const { data: telegramConnection } = await supabase
      .from('investor_telegram')
      .select('telegram_username, is_active')
      .eq('investor_id', investor.id)
      .eq('is_active', true)
      .single()
    
    if (!telegramConnection) {
      return NextResponse.json({ is_connected: false })
    }
    
    return NextResponse.json({
      is_connected: true,
      telegram_username: telegramConnection.telegram_username
    })
    
  } catch (error) {
    console.error('Error checking connection status:', error)
    return NextResponse.json({ is_connected: false })
  }
}