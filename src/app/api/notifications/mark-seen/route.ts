import { NextRequest, NextResponse } from 'next/server'
import { getServerAuth } from '@/lib/supabase/server-auth'
import { supabaseAdmin } from '@/lib/supabase/server-client'

export async function POST(request: NextRequest) {
  try {
    const { user } = await getServerAuth()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { tweetIds } = await request.json()
    
    if (!tweetIds || !Array.isArray(tweetIds)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    // Mark notifications as seen
    const notifications = tweetIds.map(tweetId => ({
      user_id: user.id,
      tweet_analysis_id: tweetId,
      seen_at: new Date().toISOString()
    }))
    
    const { error } = await supabaseAdmin
      .from('user_notifications')
      .upsert(notifications, {
        onConflict: 'user_id,tweet_analysis_id',
        ignoreDuplicates: false
      })
    
    if (error) {
      console.error('Error marking notifications as seen:', error)
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error in mark-seen:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}