import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET() {
  try {
    console.log('[recent-alerts] API called')
    
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
    
    console.log(`[recent-alerts] Returning ${enrichedAlerts.length} enriched alerts`)
    return NextResponse.json({ alerts: enrichedAlerts })
    
  } catch (error) {
    console.error('Error in recent-alerts:', error)
    return NextResponse.json({ alerts: [] })
  }
}