import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

const ADMIN_EMAILS = [
  'marc@cyrator.com',
  'marc@minutevideos.com',
  'claude.admin@sunbeam.capital'
]

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API Route] PUT /api/positions/[id] called for id:', params.id)
  
  try {
    const cookieStore = cookies()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
    
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            if (cookie) return cookie.value
            
            // Check for chunked cookies (.0, .1, etc)
            const chunks: string[] = []
            for (let i = 0; ; i++) {
              const chunk = cookieStore.get(`${name}.${i}`)
              if (!chunk) break
              chunks.push(chunk.value)
            }
            
            if (chunks.length > 0) {
              return chunks.join('')
            }
            
            return undefined
          },
          set(name: string, value: string, options: CookieOptions) {
            // For server components, we can't set cookies
          },
          remove(name: string, options: CookieOptions) {
            // For server components, we can't remove cookies
          },
        },
      }
    )
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.log('[API Route] No session - unauthorized')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Only admins can update positions
    const isAdmin = ADMIN_EMAILS.includes(session.user.email || '')
    
    if (!isAdmin) {
      console.log('[API Route] Non-admin trying to update position - forbidden')
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    console.log('[API Route] Updating position:', params.id, body)
    
    // Update the position
    const { data, error } = await supabase
      .from('positions')
      .update({
        project_id: body.project_id,
        project_name: body.project_name,
        symbol: body.symbol,
        amount: body.amount,
        cost_basis: body.cost_basis,
        entry_date: body.entry_date,
        exit_date: body.exit_date || null,
        notes: body.notes || null
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      console.error('[API Route] Error updating position:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    console.log('[API Route] Successfully updated position:', data.id)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API Route] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to update position' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API Route] DELETE /api/positions/[id] called for id:', params.id)
  
  try {
    const cookieStore = cookies()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
    
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            if (cookie) return cookie.value
            
            // Check for chunked cookies (.0, .1, etc)
            const chunks: string[] = []
            for (let i = 0; ; i++) {
              const chunk = cookieStore.get(`${name}.${i}`)
              if (!chunk) break
              chunks.push(chunk.value)
            }
            
            if (chunks.length > 0) {
              return chunks.join('')
            }
            
            return undefined
          },
          set(name: string, value: string, options: CookieOptions) {
            // For server components, we can't set cookies
          },
          remove(name: string, options: CookieOptions) {
            // For server components, we can't remove cookies
          },
        },
      }
    )
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.log('[API Route] No session - unauthorized')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Only admins can delete positions
    const isAdmin = ADMIN_EMAILS.includes(session.user.email || '')
    
    if (!isAdmin) {
      console.log('[API Route] Non-admin trying to delete position - forbidden')
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    console.log('[API Route] Deleting position:', params.id)
    
    // Delete the position
    const { error } = await supabase
      .from('positions')
      .delete()
      .eq('id', params.id)
    
    if (error) {
      console.error('[API Route] Error deleting position:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    console.log('[API Route] Successfully deleted position:', params.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Route] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to delete position' },
      { status: 500 }
    )
  }
}