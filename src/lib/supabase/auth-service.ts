import { supabaseAdmin } from './server-client'
import { cookies } from 'next/headers'

// Server-side auth service for API routes
export class AuthService {

  async getCurrentUser() {
    try {
      // Get the auth token from cookies
      const cookieStore = await cookies()
      
      // Try different cookie patterns
      const authToken = cookieStore.get('sb-gualxudgbmpuhjbumfeh-auth-token') ||
                       cookieStore.get('sb-gualxudgbmpuhjbumfeh-auth-token.0') ||
                       cookieStore.get('sb-access-token') ||
                       cookieStore.get('sb-refresh-token')
      
      if (!authToken?.value) {
        console.log('No auth token found in cookies')
        return null
      }

      let accessToken: string
      
      // Handle different token formats
      try {
        const parsed = JSON.parse(authToken.value)
        accessToken = Array.isArray(parsed) ? parsed[0] : parsed
      } catch (e) {
        // Token might already be a string
        accessToken = authToken.value
      }
      
      // For chunked cookies, check if we need to combine them
      const authToken0 = cookieStore.get('sb-gualxudgbmpuhjbumfeh-auth-token.0')
      const authToken1 = cookieStore.get('sb-gualxudgbmpuhjbumfeh-auth-token.1')
      
      if (authToken0 && authToken1) {
        try {
          const combined = authToken0.value + authToken1.value
          const parsed = JSON.parse(combined)
          accessToken = parsed[0]
        } catch (e) {
          console.error('Error parsing chunked cookies:', e)
        }
      }
      
      // Verify the token and get user
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken)
      
      if (error || !user) {
        console.error('Error verifying token:', error)
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
      const { data, error } = await supabaseAdmin
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