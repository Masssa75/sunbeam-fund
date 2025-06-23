import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  console.log('[API Route] GET /api/positions called')
  
  try {
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

    console.log('[API Route] Successfully fetched', data?.length || 0, 'positions')
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[API Route] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    )
  }
}