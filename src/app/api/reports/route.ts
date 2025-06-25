import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server-client'
import { getServerAuth } from '@/lib/supabase/server-auth'

export async function GET(request: NextRequest) {
  try {
    // Get month parameter
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')

    let query = supabaseAdmin.from('reports').select('*').order('report_month', { ascending: false })
    
    if (month) {
      query = query.eq('report_month', `${month}-01`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const auth = await getServerAuth()
    if (!auth.user || !auth.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { report_month, report_data, report_type = 'monthly' } = body

    // Ensure report_month is in DATE format (YYYY-MM-DD)
    const formattedMonth = report_month.includes('-01') ? report_month : `${report_month}-01`

    // Check if report already exists for this month
    const { data: existing } = await supabaseAdmin
      .from('reports')
      .select('id')
      .eq('report_month', formattedMonth)
      .single()

    if (existing) {
      // Update existing report
      const { data, error } = await supabaseAdmin
        .from('reports')
        .update({
          report_data,
          report_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating report:', error)
        return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
      }

      return NextResponse.json(data)
    } else {
      // Create new report
      const { data, error } = await supabaseAdmin
        .from('reports')
        .insert({
          report_month: formattedMonth,
          report_data,
          report_type
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating report:', error)
        return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Error in POST /api/reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}