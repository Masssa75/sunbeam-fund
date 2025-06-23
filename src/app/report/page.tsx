'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import MonthlyReportView from '@/components/MonthlyReportView'
import { portfolioService } from '@/lib/supabase/portfolio'
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
        const data = await portfolioService.getPositions()
        
        // Fetch current prices
        const projectIds = data.map(pos => pos.project_id).join(',')
        try {
          const priceResponse = await fetch(`/api/coingecko/price?ids=${projectIds}`)
          const prices = await priceResponse.json()
          
          // Map to Position type with calculated values
          const mappedPositions: Position[] = data.map(pos => {
            const currentPrice = prices[pos.project_id]?.usd || 0
            const currentValue = pos.amount * currentPrice
            const costBasis = pos.cost_basis || 0
            const totalCost = pos.amount * costBasis
            const profitLoss = currentValue - totalCost
            const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0
            
            return {
              ...pos,
              current_price: currentPrice,
              current_value: currentValue,
              profit_loss: profitLoss,
              profit_loss_percent: profitLossPercent
            }
          })
          setPositions(mappedPositions)
        } catch (err) {
          console.error('Error fetching prices:', err)
          // Still set positions even if prices fail
          const mappedPositions: Position[] = data.map(pos => ({
            ...pos,
            current_price: 0,
            current_value: 0,
            profit_loss: 0,
            profit_loss_percent: 0
          }))
          setPositions(mappedPositions)
        }
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