'use client'

import { useState, useEffect } from 'react'
import { getMultipleCoinPrices } from '@/lib/coingecko'

export default function PortfolioTableSimplified({ onPositionsChange }: any) {
  const [positions, setPositions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  // Load everything in one simple effect
  useEffect(() => {
    loadPortfolio()
  }, [])

  async function loadPortfolio() {
    try {
      // Check auth via API
      const authResponse = await fetch('/api/auth/session/')
      const authData = await authResponse.json()
      
      if (!authData.authenticated) {
        setAuthenticated(false)
        setLoading(false)
        return
      }
      
      setAuthenticated(true)
      
      // Load positions
      const posResponse = await fetch('/api/positions/')
      const posData = await posResponse.json()
      
      if (Array.isArray(posData) && posData.length > 0) {
        // Get prices
        const coinIds = posData.map((p: any) => p.project_id)
        try {
          const prices = await getMultipleCoinPrices(coinIds)
          
          // Add prices to positions
          const positionsWithPrices = posData.map((pos: any) => {
            const price = prices[pos.project_id] || 0
            const currentValue = pos.amount * price
            // cost_basis is already the total cost, not per-unit
            const totalCost = pos.cost_basis
            return {
              ...pos,
              current_price: price,
              current_value: currentValue,
              profit_loss: currentValue - totalCost,
              profit_loss_percent: totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0
            }
          })
          
          // Sort positions by current value (highest first)
          const sortedPositions = positionsWithPrices.sort((a: any, b: any) => 
            (b.current_value || 0) - (a.current_value || 0)
          )
          
          setPositions(sortedPositions)
          if (onPositionsChange) {
            onPositionsChange(sortedPositions)
          }
        } catch (priceError) {
          console.error('Price fetch error:', priceError)
          setPositions(posData)
        }
      } else {
        setPositions([])
      }
    } catch (error) {
      console.error('Portfolio load error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
            <div>
              <h3 className="font-semibold text-yellow-800">Loading Portfolio...</h3>
              <p className="text-sm text-yellow-700 mt-1">Connecting to database and fetching positions</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="w-full">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">Login Required</h3>
          <p className="text-sm text-blue-700 mb-4">Please log in to view portfolio positions.</p>
          <a 
            href="/login" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Log In
          </a>
        </div>
      </div>
    )
  }

  const totalValue = positions.reduce((sum, p) => sum + (p.current_value || 0), 0)
  const totalCost = positions.reduce((sum, p) => sum + p.cost_basis, 0)
  const totalPL = totalValue - totalCost
  const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Positions</h2>
          <p className="text-sm text-gray-500">
            {positions.length} positions • Total Value: ${totalValue.toFixed(2)}
          </p>
        </div>
        <button
          onClick={loadPortfolio}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left">Project</th>
              <th className="px-4 py-2 border-b text-left">Symbol</th>
              <th className="px-4 py-2 border-b text-right">Amount</th>
              <th className="px-4 py-2 border-b text-right">Cost Basis</th>
              <th className="px-4 py-2 border-b text-right">Current Price</th>
              <th className="px-4 py-2 border-b text-right">Current Value</th>
              <th className="px-4 py-2 border-b text-right">P&L</th>
              <th className="px-4 py-2 border-b text-right">P&L %</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{position.project_name}</td>
                <td className="px-4 py-2 border-b uppercase">{position.symbol}</td>
                <td className="px-4 py-2 border-b text-right">{position.amount.toLocaleString()}</td>
                <td className="px-4 py-2 border-b text-right">${position.cost_basis.toFixed(4)}</td>
                <td className="px-4 py-2 border-b text-right">
                  ${position.current_price?.toFixed(4) || '0.0000'}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  ${position.current_value?.toFixed(2) || '0.00'}
                </td>
                <td className={`px-4 py-2 border-b text-right ${
                  (position.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${position.profit_loss?.toFixed(2) || '0.00'}
                </td>
                <td className={`px-4 py-2 border-b text-right ${
                  (position.profit_loss_percent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {position.profit_loss_percent?.toFixed(2) || '0.00'}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-medium bg-gray-50">
              <td colSpan={5} className="px-4 py-2 border-t">Total</td>
              <td className="px-4 py-2 border-t text-right">${totalValue.toFixed(2)}</td>
              <td className={`px-4 py-2 border-t text-right ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalPL.toFixed(2)}
              </td>
              <td className={`px-4 py-2 border-t text-right ${totalPLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPLPercent.toFixed(2)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}