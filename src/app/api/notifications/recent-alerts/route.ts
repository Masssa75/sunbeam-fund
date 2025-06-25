import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server-client'
import { getServerAuth } from '@/lib/supabase/server-auth'

export async function GET() {
  try {
    console.log('[recent-alerts] API called')
    
    // Get current user
    const { user } = await getServerAuth()
    const userId = user?.id
    
    // Use the admin client that has hardcoded fallbacks
    const supabase = supabaseAdmin
    
    // Get recent high-importance tweets (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    console.log('[recent-alerts] Fetching tweets since:', twentyFourHoursAgo)
    
    const { data: alerts, error } = await supabase
      .from('tweet_analyses')
      .select('id, project_id, importance_score, summary, created_at')
      .gte('importance_score', 9)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('[recent-alerts] Error fetching alerts:', error)
      return NextResponse.json({ alerts: [] })
    }
    
    console.log(`[recent-alerts] Found ${alerts?.length || 0} alerts with score 9+`)
    
    // Get project names
    const projectIds = Array.from(new Set(alerts?.map(a => a.project_id) || []))
    const { data: projects } = await supabase
      .from('monitored_projects')
      .select('project_id, project_name')
      .in('project_id', projectIds)
    
    // Map project names to alerts
    const projectMap = new Map(projects?.map(p => [p.project_id, p.project_name]) || [])
    
    const enrichedAlerts = alerts?.map(alert => ({
      ...alert,
      project_name: projectMap.get(alert.project_id) || alert.project_id
    })) || []
    
    // If user is logged in and table exists, get their notification states
    let notificationStates = new Map()
    if (userId) {
      const { data: userNotifications } = await supabase
        .from('user_notifications')
        .select('tweet_analysis_id, seen_at, dismissed_at')
        .eq('user_id', userId)
        .in('tweet_analysis_id', enrichedAlerts.map(a => a.id))
      
      if (userNotifications) {
        notificationStates = new Map(
          userNotifications.map(n => [n.tweet_analysis_id, n])
        )
      }
    }
    
    // Add notification state to each alert and filter out dismissed ones
    const alertsWithState = enrichedAlerts
      .map(alert => {
        const state = notificationStates.get(alert.id)
        return {
          ...alert,
          is_seen: !!state?.seen_at,
          is_dismissed: !!state?.dismissed_at
        }
      })
      .filter(alert => !alert.is_dismissed) // Don't show dismissed notifications
    
    console.log(`[recent-alerts] Returning ${alertsWithState.length} alerts (filtered from ${enrichedAlerts.length})`)
    return NextResponse.json({ alerts: alertsWithState })
    
  } catch (error) {
    console.error('Error in recent-alerts:', error)
    return NextResponse.json({ alerts: [] })
  }
}