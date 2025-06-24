'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import VersionBadge from '@/components/VersionBadge'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/session/')
      const data = await response.json()
      setAuthenticated(data.authenticated)
    } catch (error) {
      setAuthenticated(false)
    }
  }

  // Show loading during SSR and initial client load
  if (!mounted || authenticated === null) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Only show header for authenticated users */}
        {authenticated && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Sunbeam Fund Management</h1>
            <p className="text-lg text-gray-600">Crypto portfolio tracking and reporting system</p>
          </div>
        )}
        <ErrorBoundary>
          <Dashboard />
        </ErrorBoundary>
      </div>
      <VersionBadge />
    </main>
  )
}