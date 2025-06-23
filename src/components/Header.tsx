'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/supabase/auth'

export default function Header() {
  const router = useRouter()
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
      await auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
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
            <a href="/" className="text-lg font-semibold text-gray-900 hover:text-gray-700">
              Sunbeam Fund
            </a>
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
                <a
                  href="/"
                  className={`px-3 py-1 rounded ${
                    window.location.pathname === '/' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  Admin View
                </a>
                <a
                  href="/investor"
                  className={`px-3 py-1 rounded ${
                    window.location.pathname === '/investor' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  Investor View
                </a>
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
              <a
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Sign in
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}