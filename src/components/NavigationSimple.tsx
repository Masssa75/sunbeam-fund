'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NavigationSimple() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [isInvestor, setIsInvestor] = useState(false)

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mounted) return
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session/')
        const data = await response.json()
        
        if (data.authenticated && data.user) {
          setUser(data.user)
          setIsAdmin(data.isAdmin || false)
          setIsInvestor(data.isInvestor || false)
        } else {
          setUser(null)
          setIsAdmin(false)
          setIsInvestor(false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
        setIsAdmin(false)
        setIsInvestor(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
    // Check auth status every 5 seconds
    const interval = setInterval(checkAuth, 5000)
    return () => clearInterval(interval)
  }, [mounted])

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
  
  // Show minimal nav during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold text-gray-900">Sunbeam Fund</Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Hide navigation for regular users (non-admin, non-investor)
  if (user && !isAdmin && !isInvestor) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative" ref={menuRef}>
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
            {/* Menu button for all screen sizes */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open menu</span>
              {/* Hamburger icon */}
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Menu dropdown - positioned absolutely and right-aligned */}
      {mobileMenuOpen && (
        <div className="absolute right-4 top-14 w-64 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
            {user ? (
              <>
                {/* User info section */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-900">{user.email}</div>
                  {isAdmin && (
                    <div className="text-xs text-gray-500 mt-1">Administrator</div>
                  )}
                </div>
                
                {/* Navigation links */}
                <div className="py-1">
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Portfolio
                  </Link>
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin/investors"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Manage Investors
                      </Link>
                      <Link
                        href="/admin/reports"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Reports
                      </Link>
                      <Link
                        href="/investor"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Preview Investor View
                      </Link>
                    </>
                  )}
                </div>
                
                {/* Sign out section */}
                <div className="border-t border-gray-200">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleSignOut()
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              /* Not authenticated - show sign in */
              <div className="py-2">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
        </div>
      )}
    </nav>
  )
}