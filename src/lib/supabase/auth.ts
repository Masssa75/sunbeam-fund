import { supabase } from './client'

export const auth = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign up new user (admin only should create users)
  async signUp(email: string, password: string) {
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getUser() {
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get session
  async getSession() {
    
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    
    return supabase.auth.onAuthStateChange(callback)
  },

  // Reset password
  async resetPassword(email: string) {
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    
    return { data, error }
  },

  // Update password (after clicking reset link)
  async updatePassword(newPassword: string) {
    
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) throw error
    return data
  },

  // Check if user is admin
  async isAdmin(userEmail: string): Promise<boolean> {
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_email')
      .eq('user_email', userEmail)
      .single()
    
    return !error && !!data
  }
}