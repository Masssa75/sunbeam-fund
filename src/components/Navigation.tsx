'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInvestor, setIsInvestor] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session/')
        const data = await response.json()
        
        if (data.authenticated && data.user) {
          setUser(data.user)
          setIsAdmin(data.isAdmin || false)
          
          // Check if user is an investor
          if (!data.isAdmin) {
            const investorResponse = await fetch(`/api/investors/${data.user.id}`)
            setIsInvestor(investorResponse.ok)
          }
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
    const interval = setInterval(checkAuth, 10000)
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
      
      setUser(null)
      setIsAdmin(false)
      setIsInvestor(false)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      router.push('/login')
    }
  }

  if (!mounted || loading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-lg font-semibold text-gray-900">Sunbeam Fund</div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  const adminLinks = [
    { href: '/', label: 'Portfolio', exact: true },
    { href: '/admin/investors', label: 'Manage Investors', exact: false },
    { href: '/report', label: 'Reports', exact: false },
  ]

  const investorLinks = [
    { href: '/investor', label: 'My Portfolio', exact: true },
    { href: '/investor/reports', label: 'My Reports', exact: false },
  ]

  const publicLinks = [
    { href: '/login', label: 'Sign In' },
  ]

  const currentLinks = isAdmin ? adminLinks : (isInvestor ? investorLinks : [])

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-semibold text-gray-900 hover:text-gray-700">
                Sunbeam Fund
              </Link>
            </div>
            
            {/* Desktop navigation */}
            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {currentLinks.map(link => {
                  const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
                
                {/* Admin-only: Preview investor view */}
                {isAdmin && (
                  <Link
                    href="/investor"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === '/investor'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Preview Investor View
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block">
                  <span className="text-sm text-gray-700">
                    {user.email}
                    {isAdmin && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                    {isInvestor && !isAdmin && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Investor
                      </span>
                    )}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {publicLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden ml-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open menu</span>
              <ChevronDownIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && user && (
          <div className="sm:hidden pb-3 pt-2">
            <div className="space-y-1">
              {currentLinks.map(link => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
              
              {isAdmin && (
                <Link
                  href="/investor"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    pathname === '/investor'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Preview Investor View
                </Link>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="px-4 text-sm text-gray-700">
                {user.email}
                {isAdmin && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Admin
                  </span>
                )}
                {isInvestor && !isAdmin && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Investor
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}