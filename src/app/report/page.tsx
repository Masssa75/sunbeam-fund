'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import MonthlyReportView from '@/components/MonthlyReportView'
import { getPortfolioService } from '@/lib/supabase/portfolio'
import type { Position } from '@/lib/types'
import './print.css'

export default function ReportPage() {
  const searchParams = useSearchParams()
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get parameters from URL
  const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)
  const investorName = searchParams.get('name') || 'Investor'
  const investorAccount = searchParams.get('account') || '001'
  const investorShare = parseFloat(searchParams.get('share') || '100')

  useEffect(() => {
    const loadPositions = async () => {
      try {
        setLoading(true)
        const portfolioService = getPortfolioService()
        const data = await portfolioService.getPositions()
        setPositions(data)
      } catch (err) {
        console.error('Error loading positions:', err)
        setError('Failed to load portfolio data')
      } finally {
        setLoading(false)
      }
    }

    loadPositions()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <MonthlyReportView
        positions={positions}
        reportMonth={month}
        investorName={investorName}
        investorAccount={investorAccount}
        investorSharePercentage={investorShare}
      />
      
      {/* Print button */}
      <div className="text-center mt-8 no-print">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Print Report
        </button>
      </div>
    </div>
  )
}