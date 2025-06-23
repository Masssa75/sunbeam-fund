import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET() {
  try {
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM',
      {
        cookies: {
          get(name: string) {
            // Handle chunked cookies
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
          set(name: string, value: string, options: any) {
            // For server components, we can't set cookies in GET requests
            // This is okay - we only need to read them
          },
          remove(name: string, options: any) {
            // For server components, we can't remove cookies in GET requests
          },
        },
      }
    )
    
    const { data: { session } } = await supabase.auth.getSession()
    
    return NextResponse.json({ 
      authenticated: !!session,
      user: session?.user || null 
    })
  } catch (error) {
    return NextResponse.json({ 
      authenticated: false,
      user: null 
    })
  }
}