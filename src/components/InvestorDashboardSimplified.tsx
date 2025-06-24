'use client'

import { useState, useEffect } from 'react'

type Position = {
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

interface InvestorDashboardProps {
  viewAsId?: string | null
}

export default function InvestorDashboardSimplified({ viewAsId }: InvestorDashboardProps) {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M')
  const [showReports, setShowReports] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Calculate portfolio metrics
  const totalValue = positions.reduce((sum, p) => sum + (p.current_value || 0), 0)
  const totalCost = positions.reduce((sum, p) => sum + (p.cost_basis || 0), 0)
  const totalProfitLoss = totalValue - totalCost
  const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadPortfolio()
  }, [mounted, viewAsId])

  const loadPortfolio = async () => {
    console.log('[InvestorDashboard] Starting to load portfolio...')
    setError(null)
    try {
      setLoading(true)
      
      // Check if authenticated (skip if viewing as another user)
      if (!viewAsId) {
        const authResponse = await fetch('/api/auth/session/')
        const authData = await authResponse.json()
        
        if (!authData.authenticated) {
          console.log('[InvestorDashboard] Not authenticated')
          setError('Please sign in to view your portfolio')
          setLoading(false)
          return
        }
      }
      
      // Fetch positions from API
      console.log('[InvestorDashboard] Fetching positions...')
      const url = viewAsId ? `/api/positions/?viewAs=${viewAsId}` : '/api/positions/'
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch positions: ${response.statusText}`)
      }
      
      const savedPositions = await response.json()
      console.log('[InvestorDashboard] Loaded positions:', savedPositions.length)
      
      if (savedPositions.length > 0) {
        // Get current prices
        const coinIds = savedPositions.map((p: Position) => p.project_id).filter(Boolean)
        console.log('[InvestorDashboard] Fetching prices for coins:', coinIds)
        
        const priceResponse = await fetch('/api/coingecko/price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coinIds })
        })
        
        if (!priceResponse.ok) {
          console.warn('[InvestorDashboard] Failed to fetch prices')
          setPositions(savedPositions)
          return
        }
        
        const prices = await priceResponse.json()
        console.log('[InvestorDashboard] Fetched prices:', Object.keys(prices).length)
        
        // Calculate values
        const positionsWithValues = savedPositions.map((position: Position) => {
          const currentPrice = prices[position.project_id] || 0
          const currentValue = currentPrice * position.amount
          const profitLoss = currentValue - position.cost_basis
          const profitLossPercent = position.cost_basis > 0 
            ? (profitLoss / position.cost_basis) * 100 
            : 0
          
          return {
            ...position,
            current_price: currentPrice,
            current_value: currentValue,
            profit_loss: profitLoss,
            profit_loss_percent: profitLossPercent,
          }
        })
        
        setPositions(positionsWithValues)
      } else {
        setPositions([])
      }
    } catch (error) {
      console.error('[InvestorDashboard] Error loading portfolio:', error)
      setError(error instanceof Error ? error.message : 'Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }

  // Prevent hydration issues
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
            <div>
              <h3 className="font-semibold text-yellow-800">Loading Portfolio...</h3>
              <p className="text-sm text-yellow-700 mt-1">Fetching positions and current prices</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="font-semibold text-red-800 mb-2">Failed to Load Portfolio</h3>
          <p className="text-sm text-red-700 mb-4">Error: {error}</p>
          <button 
            onClick={loadPortfolio} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-2">No Positions</h3>
          <p className="text-sm text-gray-600">Your portfolio is currently empty.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Portfolio Value Header - inspired by wireframe */}
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 text-center">
        <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">Portfolio Value</div>
        <div className="text-6xl font-light mb-2">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        <div className={`text-3xl font-light ${totalProfitLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {totalProfitLossPercent >= 0 ? '+' : ''}{totalProfitLossPercent.toFixed(1)}%
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <p className="text-lg text-center text-gray-700 leading-relaxed">
          This month, your portfolio {totalProfitLoss >= 0 ? 'gained' : 'lost'}{' '}
          <span className="font-semibold text-green-500">
            ${Math.abs(totalProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          {positions.length > 0 && (
            <>
              , led by strong performance in{' '}
              <span className="font-semibold text-green-500">
                {positions.sort((a, b) => (b.profit_loss_percent || 0) - (a.profit_loss_percent || 0))[0]?.project_name}
              </span>
            </>
          )}
          .
        </p>
      </div>

      {/* Time Selector for Charts */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Portfolio Performance</h3>
        <div className="flex justify-center gap-2 mb-6">
          {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(timeframe => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
        
        {/* Chart Placeholder */}
        <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
          <span className="text-gray-400">Chart visualization coming soon</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Value</div>
            <div className="text-xl font-semibold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Invested</div>
            <div className="text-xl font-semibold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total P&L</div>
            <div className={`text-xl font-semibold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Positions</div>
            <div className="text-xl font-semibold">{positions.length}</div>
          </div>
        </div>
      </div>

      {/* Holdings Overview */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Your Holdings</h3>
        <div className="space-y-3">
          {positions.map(position => (
            <div key={position.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <div className="font-medium">{position.project_name}</div>
                <div className="text-sm text-gray-500">{position.symbol.toUpperCase()}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">${position.current_value?.toLocaleString()}</div>
                <div className={`text-sm ${position.profit_loss_percent && position.profit_loss_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {position.profit_loss_percent && position.profit_loss_percent >= 0 ? '+' : ''}
                  {position.profit_loss_percent?.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Reports Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Monthly Reports</h3>
        
        {/* Latest Report Card */}
        <div className="bg-gray-50 rounded-xl p-6 text-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-lg font-semibold mb-1">June 2025</div>
          <div className="text-sm text-gray-500 mb-4">Latest Report</div>
          <button 
            onClick={() => setShowReports(!showReports)}
            className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            View Reports
          </button>
        </div>

        {/* Reports List */}
        {showReports && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <div className="font-medium">May 2025</div>
                <div className="text-sm text-green-500">+12.4% performance</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <div className="font-medium">April 2025</div>
                <div className="text-sm text-green-500">+8.7% performance</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}