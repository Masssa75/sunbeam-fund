'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NavigationSimple() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session/')
        const data = await response.json()
        
        if (data.authenticated && data.user) {
          setUser(data.user)
          setIsAdmin(data.isAdmin || false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
    // Check auth status every 10 seconds
    const interval = setInterval(checkAuth, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (response.ok) {
        setUser(null)
        setIsAdmin(false)
        router.push('/login')
      }
    } catch (error) {
      console.error('Error signing out:', error)
      router.push('/login')
    }
  }
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-semibold text-gray-900 hover:text-gray-700">
                Sunbeam Fund
              </Link>
            </div>
            
          </div>

          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">
                    {user.email}
                    {isAdmin && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Sign In
                </Link>
              )}
            </div>
            
            {/* Menu button for all screen sizes */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open menu</span>
              {/* Hamburger icon */}
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Menu dropdown for all screen sizes */}
        {mobileMenuOpen && user && (
          <div className="pb-3 pt-2">
            <div className="space-y-1">
              <Link
                href="/"
                className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Portfolio
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/admin/investors"
                    className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Manage Investors
                  </Link>
                  <Link
                    href="/report"
                    className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Reports
                  </Link>
                  <Link
                    href="/investor"
                    className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Preview Investor View
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}