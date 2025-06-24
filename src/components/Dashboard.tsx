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
      <div className="bg-white p-12 rounded-lg shadow text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Sunbeam Capital</h2>
          <p className="text-lg text-gray-600 mb-6">
            Professional crypto fund management and portfolio tracking system
          </p>
          <p className="text-gray-500 mb-8">
            Please log in to access your portfolio, view reports, and manage investments.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In to Continue
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Authorized investors and administrators only</p>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Portfolio Tracking</h3>
              <p className="text-sm text-gray-600">Real-time crypto portfolio monitoring and performance analytics</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Monthly Reports</h3>
              <p className="text-sm text-gray-600">Comprehensive investment reports and market analysis</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional Management</h3>
              <p className="text-sm text-gray-600">Expert fund management with institutional-grade tools</p>
            </div>
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