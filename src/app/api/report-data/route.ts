import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export async function GET() {
  console.log('[API Route] GET /api/report-data called - PUBLIC ENDPOINT')
  
  try {
    // Use service role key for public report data access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co'
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.d5CtuQD_R6MkjrD6LuSshNLiYaB7XP7BaU8Kn6EqQQg'
    
    const supabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    )
    
    // Fetch all positions using service role
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .order('entry_date', { ascending: false })

    if (error) {
      console.error('[API Route] Error fetching positions:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('[API Route] Successfully fetched', data?.length || 0, 'positions for report')
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[API Route] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    )
  }
}