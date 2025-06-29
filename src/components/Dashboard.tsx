'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PortfolioTableWithPrices from './PortfolioTableEnhanced'
import ReportGenerator from './ReportGenerator'
import InvestorDashboard from './InvestorDashboardNew'
import WelcomeMessage from './WelcomeMessage'

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

interface SessionData {
  authenticated: boolean
  user?: {
    id: string
    email: string
  }
  isAdmin?: boolean
  isInvestor?: boolean
}

export default function Dashboard() {
  const [positions, setPositions] = useState<Position[]>([])
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/session/')
        const data = await response.json()
        setSessionData(data)
      } catch (error) {
        console.error('Failed to check session:', error)
        setSessionData({ authenticated: false })
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!sessionData?.authenticated || !sessionData.user) {
    return <div>Not authenticated</div>
  }

  // Admin users see the full dashboard
  if (sessionData.isAdmin) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Sunbeam Fund Management</h1>
            <p className="text-lg text-gray-600">Crypto portfolio tracking and reporting system</p>
          </div>
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

          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Notifications & Communications</h3>
            <div className="flex gap-4">
              <Link
                href="/admin/telegram"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Telegram Notifications
              </Link>
              <Link
                href="/admin/twitter-monitoring"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Twitter Monitoring
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Investor users see the investor dashboard
  if (sessionData.isInvestor) {
    return <InvestorDashboard />
  }

  // Regular users see the welcome message
  return <WelcomeMessage userEmail={sessionData.user.email} />
}