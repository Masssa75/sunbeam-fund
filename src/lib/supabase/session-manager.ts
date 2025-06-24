import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

// Create a singleton Supabase client
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance && typeof window !== 'undefined') {
    supabaseInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
    )
  }
  return supabaseInstance!
}

// Session refresh manager
class SessionManager {
  private static instance: SessionManager
  private refreshTimer: NodeJS.Timeout | null = null
  private lastRefresh: number = 0
  private listeners: Set<() => void> = new Set()

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for visibility changes
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
      
      // Listen for focus events
      window.addEventListener('focus', this.handleFocus)
      
      // Listen for storage events (cross-tab communication)
      window.addEventListener('storage', this.handleStorageChange)
      
      // Set up periodic refresh
      this.setupPeriodicRefresh()
    }
  }

  private handleVisibilityChange = () => {
    if (!document.hidden) {
      this.refreshSession()
    }
  }

  private handleFocus = () => {
    this.refreshSession()
  }

  private handleStorageChange = (e: StorageEvent) => {
    // Check if auth-related storage changed
    if (e.key && (e.key.includes('supabase') || e.key.includes('auth'))) {
      this.refreshSession()
    }
  }

  private setupPeriodicRefresh() {
    // Refresh session every 30 minutes
    this.refreshTimer = setInterval(() => {
      this.refreshSession()
    }, 30 * 60 * 1000)
  }

  async refreshSession() {
    // Prevent too frequent refreshes
    const now = Date.now()
    if (now - this.lastRefresh < 5000) return // 5 second cooldown
    
    this.lastRefresh = now
    const supabase = getSupabaseClient()
    
    try {
      // Refresh the session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session refresh error:', error)
        return
      }
      
      // If session exists but is about to expire, refresh it
      if (session && session.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000)
        const now = new Date()
        const timeUntilExpiry = expiresAt.getTime() - now.getTime()
        
        // Refresh if less than 5 minutes until expiry
        if (timeUntilExpiry < 5 * 60 * 1000) {
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.error('Token refresh error:', refreshError)
          }
        }
      }
      
      // Notify listeners
      this.notifyListeners()
    } catch (error) {
      console.error('Session refresh failed:', error)
    }
  }

  addListener(callback: () => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback())
  }

  destroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    window.removeEventListener('focus', this.handleFocus)
    window.removeEventListener('storage', this.handleStorageChange)
  }
}

export const sessionManager = SessionManager.getInstance()