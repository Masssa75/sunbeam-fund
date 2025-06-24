'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PortfolioTableWithPrices from './PortfolioTableSimplified'
import ReportGenerator from './ReportGenerator'

interface Position {
  id: string
  project_id: string
  project_name: string
  symbol: string
  amount: number
  cost_basis: number
  entry_date: string
  current_price?: number
  current_value?: number
  profit_loss?: number
  profit_loss_percent?: number
}

export default function Dashboard() {
  const [positions, setPositions] = useState<Position[]>([])
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
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  // Show welcome message for non-authenticated users
  if (!authenticated) {
    return (
      <div className="bg-white p-8 rounded-lg shadow max-w-md mx-auto">
        {/* Main Content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Welcome to Sunbeam Capital</h2>
          
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
            
            <Link
              href="/login?mode=signup"
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show full dashboard for authenticated users
  return (
    <div>
      <PortfolioTableWithPrices onPositionsChange={setPositions} />
      <ReportGenerator positions={positions} />
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Report Management</h3>
        <div className="flex gap-4">
          <Link
            href="/admin/reports"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View All Reports
          </Link>
          <Link
            href="/admin/reports/upload"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Upload Historical Report
          </Link>
        </div>
      </div>
    </div>
  )
}