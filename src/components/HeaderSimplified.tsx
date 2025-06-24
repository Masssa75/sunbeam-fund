'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function HeaderSimplified() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Use API endpoint to check auth status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session/')
        const data = await response.json()
        
        if (data.authenticated && data.user) {
          setUser(data.user)
          setIsAdmin(data.isAdmin || false)
        } else {
          setUser(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Poll for auth changes every 5 seconds
    const interval = setInterval(checkAuth, 5000)

    return () => clearInterval(interval)
  }, [mounted])

  const handleSignOut = async () => {
    try {
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
      
      // Use Next.js router for navigation
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if logout fails, redirect to login
      router.push('/login')
    }
  }

  // Prevent hydration issues
  if (!mounted) {
    return (
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-lg font-semibold text-gray-900">Sunbeam Fund</div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="text-lg font-semibold text-gray-900">Sunbeam Fund</div>
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
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