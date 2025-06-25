import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Get user session
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get recent high-importance tweets (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: alerts, error } = await supabase
      .from('tweet_analyses')
      .select('id, project_id, importance_score, summary, created_at')
      .gte('importance_score', 9)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('Error fetching alerts:', error)
      return NextResponse.json({ alerts: [] })
    }
    
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
    
    return NextResponse.json({ alerts: enrichedAlerts })
    
  } catch (error) {
    console.error('Error in recent-alerts:', error)
    return NextResponse.json({ alerts: [] })
  }
}