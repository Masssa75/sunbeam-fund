'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/supabase/auth'
import { sessionManager } from '@/lib/supabase/session-manager'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Get initial user
    auth.getUser().then(async user => {
      setUser(user)
      if (user?.email) {
        const adminStatus = await auth.isAdmin(user.email)
        setIsAdmin(adminStatus)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // Listen to auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      if (session?.user?.email) {
        const adminStatus = await auth.isAdmin(session.user.email)
        setIsAdmin(adminStatus)
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      // Use API endpoint to ensure proper cookie cleanup
      const response = await fetch('/api/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!response.ok) {
        throw new Error('Logout failed')
      }
      
      // Clear local state
      setUser(null)
      setIsAdmin(false)
      
      // Force a hard redirect to clear any client-side cache
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if logout fails, redirect to login
      window.location.href = '/login'
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-lg font-semibold text-gray-900 hover:text-gray-700">
              Sunbeam Fund
            </Link>
            {user ? (
              <span className="text-sm text-gray-700">
                Signed in as: <span className="font-medium">{user.email}</span>
              </span>
            ) : (
              <span className="text-sm text-gray-500">Not signed in</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user && isAdmin && (
              <div className="flex items-center gap-2 text-sm">
                <Link
                  href="/"
                  className={`px-3 py-1 rounded ${
                    pathname === '/' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  Admin View
                </Link>
                <Link
                  href="/investor"
                  className={`px-3 py-1 rounded ${
                    pathname === '/investor' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  Investor View
                </Link>
              </div>
            )}
            {user ? (
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}