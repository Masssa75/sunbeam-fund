import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Create a direct client with hardcoded values
    const supabase = createClient(
      'https://gualxudgbmpuhjbumfeh.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
    )

    // Try a simple query
    console.log('Testing database connection...')
    const { data, error, count } = await supabase
      .from('positions')
      .select('*', { count: 'exact' })
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        config: {
          url: 'https://gualxudgbmpuhjbumfeh.supabase.co',
          hasKey: true
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      recordCount: count,
      hasData: !!data && data.length > 0,
      config: {
        url: 'https://gualxudgbmpuhjbumfeh.supabase.co',
        hasKey: true
      }
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: 'Exception occurred',
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    }, { status: 500 })
  }
}