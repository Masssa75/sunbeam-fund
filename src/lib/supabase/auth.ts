import { supabase } from './client'

export const auth = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign up new user (admin only should create users)
  async signUp(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getUser() {
    if (!supabase) {
      return null
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get session
  async getSession() {
    if (!supabase) {
      return null
    }
    
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
    
    return supabase.auth.onAuthStateChange(callback)
  },

  // Check if user is admin (you can customize this based on your needs)
  async isAdmin(userId: string): Promise<boolean> {
    // For now, all authenticated users are admins
    // Later you can check user metadata or a roles table
    return true
  }
}