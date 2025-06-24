import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Server-side auth service for API routes
export class AuthService {
  private getSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4'
    
    return createClient(supabaseUrl, supabaseKey)
  }

  async getCurrentUser() {
    try {
      // Get the auth token from cookies
      const cookieStore = cookies()
      const authToken = cookieStore.get('sb-gualxudgbmpuhjbumfeh-auth-token')
      
      if (!authToken?.value) {
        return null
      }

      // Parse the token to get user info
      const token = JSON.parse(authToken.value)
      const accessToken = token[0]
      
      // Verify the token and get user
      const supabase = this.getSupabase()
      const { data: { user }, error } = await supabase.auth.getUser(accessToken)
      
      if (error || !user) {
        return null
      }

      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const supabase = this.getSupabase()
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', userId)
        .single()
      
      return !error && !!data
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }
}

export const authService = new AuthService()