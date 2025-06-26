import { getSupabaseClient, sessionManager } from './session-manager'
import type { Database } from './types'

export const auth = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign up new user (admin only should create users)
  async signUp(email: string, password: string) {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const supabase = getSupabaseClient()
    
    // Clear any stored session data
    if (typeof window !== 'undefined') {
      // Clear localStorage items that might contain auth data
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      )
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getUser() {
    const supabase = getSupabaseClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get session
  async getSession() {
    const supabase = getSupabaseClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = getSupabaseClient()
    
    return supabase.auth.onAuthStateChange(callback)
  },

  // Reset password
  async resetPassword(email: string) {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    
    return { data, error }
  },

  // Custom reset password (alternative method)
  async customResetPassword(email: string) {
    try {
      const response = await fetch('/api/auth/custom-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reset email')
      }
      
      return { data: result, error: null }
    } catch (err: any) {
      return { data: null, error: err }
    }
  },

  // Update password (after clicking reset link)
  async updatePassword(newPassword: string) {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) throw error
    return data
  },

  // Check if user is admin
  async isAdmin(userEmail: string): Promise<boolean> {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_email')
      .eq('user_email', userEmail)
      .single()
    
    return !error && !!data
  }
}