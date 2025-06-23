'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/supabase/auth'
import { storageService } from '@/lib/storage-service'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if Supabase is configured
    if (!storageService.isUsingSupabase()) {
      setLoading(false)
      return
    }

    // Get initial user
    auth.getUser().then(user => {
      setUser(user)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // Listen to auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
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

  // Don't show auth UI if Supabase is not configured
  if (!storageService.isUsingSupabase()) {
    return null
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
          <div>
            {user ? (
              <span className="text-sm text-gray-700">
                Signed in as: <span className="font-medium">{user.email}</span>
              </span>
            ) : (
              <span className="text-sm text-gray-500">Not signed in</span>
            )}
          </div>
          <div>
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