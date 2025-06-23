import { NextResponse } from 'next/server'
import { portfolioService } from '@/lib/supabase/portfolio'

export async function GET() {
  console.log('[API Route] GET /api/positions called')
  
  try {
    // The portfolio service already checks authentication
    const positions = await portfolioService.getPositions()
    
    console.log('[API Route] Returning', positions.length, 'positions')
    
    return NextResponse.json(positions)
  } catch (error) {
    console.error('[API Route] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    )
  }
}