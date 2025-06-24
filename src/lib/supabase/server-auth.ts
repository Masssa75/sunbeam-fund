import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from './types'

// Server-side authentication helper for API routes
export async function getServerAuth() {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get('sb-auth-token')
    
    if (!authCookie?.value) {
      return { user: null, isAdmin: false }
    }

    // Parse the chunked cookie
    let token = authCookie.value
    let i = 0
    let chunk
    while ((chunk = cookieStore.get(`sb-auth-token.${i}`)?.value)) {
      token += chunk
      i++
    }

    const accessToken = JSON.parse(decodeURIComponent(token)).access_token
    if (!accessToken) {
      return { user: null, isAdmin: false }
    }

    // Create a Supabase client with the user's token
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    )

    // Get the user
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return { user: null, isAdmin: false }
    }

    // Check if user is admin
    const isAdmin = user.email === 'marc@cyrator.com' || user.email === 'marc@minutevideos.com'

    return { user, isAdmin }
  } catch (error) {
    console.error('Error in getServerAuth:', error)
    return { user: null, isAdmin: false }
  }
}