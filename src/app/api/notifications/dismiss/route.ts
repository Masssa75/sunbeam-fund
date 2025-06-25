import { NextRequest, NextResponse } from 'next/server'
import { getServerAuth } from '@/lib/supabase/server-auth'
import { supabaseAdmin } from '@/lib/supabase/server-client'

export async function POST(request: NextRequest) {
  try {
    const { user } = await getServerAuth()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { tweetId } = await request.json()
    
    if (!tweetId) {
      return NextResponse.json({ error: 'Tweet ID required' }, { status: 400 })
    }
    
    // Mark notification as dismissed
    const { error } = await supabaseAdmin
      .from('user_notifications')
      .upsert({
        user_id: user.id,
        tweet_analysis_id: tweetId,
        dismissed_at: new Date().toISOString(),
        seen_at: new Date().toISOString() // Also mark as seen
      }, {
        onConflict: 'user_id,tweet_analysis_id'
      })
    
    if (error) {
      console.error('Error dismissing notification:', error)
      return NextResponse.json({ error: 'Failed to dismiss notification' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error in dismiss:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}