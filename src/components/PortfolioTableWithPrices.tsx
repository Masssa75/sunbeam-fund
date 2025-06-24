'use client'

import { useState, useEffect } from 'react'
import { searchCoins, getMultipleCoinPrices, getCoinPrice, getHistoricalPrice, CoinPrice } from '@/lib/coingecko'
import { portfolioService } from '@/lib/supabase/portfolio'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

type StoredPosition = Database['public']['Tables']['positions']['Row']

interface Position extends StoredPosition {
  current_price?: number
  current_value?: number
  profit_loss?: number
  profit_loss_percent?: number
}

interface PortfolioTableWithPricesProps {
  onPositionsChange?: (positions: Position[]) => void
}

export default function PortfolioTableWithPrices({ onPositionsChange }: PortfolioTableWithPricesProps = {}) {
  const [positions, setPositions] = useState<Position[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [loading, setLoading] = useState(true) // Start with loading true
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false) // Track if we've checked auth
  const [mounted, setMounted] = useState(false) // Track if component is mounted

  // Check authentication and load positions
  const checkAuthAndLoadPositions = async () => {
    setLoading(true)
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setIsAuthenticated(false)
      setAuthChecked(true)
    }, 10000) // 10 second timeout
    
    try {
      // Check authentication directly via Supabase client
      const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      
      clearTimeout(timeoutId)
      
      setIsAuthenticated(!!session)
      setAuthChecked(true)
      
      if (session) {
        // Load positions if authenticated
        const savedPositions = await portfolioService.getPositions()
        clearTimeout(timeoutId) // Clear timeout on success
        
        setPositions(savedPositions as Position[])
        setLoading(false)
      } else {
        clearTimeout(timeoutId)
        setLoading(false)
      }
    } catch (error) {
      clearTimeout(timeoutId)
      setError(error instanceof Error ? error.message : 'Failed to load portfolio')
      setAuthChecked(true)
      setLoading(false)
    }
  }

  // Track mount status and load positions on mount
  useEffect(() => {
    setMounted(true)
    
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
    )

    // Check initial session and load positions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true)
        setAuthChecked(true)
        checkAuthAndLoadPositions()
      } else {
        setIsAuthenticated(false)
        setAuthChecked(true)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true)
        setAuthChecked(true)
        checkAuthAndLoadPositions()
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setPositions([])
        setAuthChecked(true)
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setIsAuthenticated(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch prices for all positions
  const fetchPrices = async () => {
    if (positions.length === 0) return
    
    setLoading(true)
    try {
      const coinIds = positions.map(p => p.project_id).filter(Boolean)
      const prices = await getMultipleCoinPrices(coinIds)
      
      setPositions(positions.map(position => {
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
      }))
      
      setLastUpdate(new Date())
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  // Fetch prices on mount and when positions change
  useEffect(() => {
    if (positions.length > 0) {
      fetchPrices()
    }
  }, [positions.length])

  // Notify parent of position changes
  useEffect(() => {
    onPositionsChange?.(positions)
  }, [positions, onPositionsChange])

  const handleAddPosition = async (position: Omit<Position, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Clean up the data before sending
      const cleanedPosition = {
        project_id: position.project_id,
        project_name: position.project_name,
        symbol: position.symbol,
        amount: Number(position.amount) || 0,
        cost_basis: Number(position.cost_basis) || 0,
        entry_date: position.entry_date,
        exit_date: position.exit_date || null,
        notes: position.notes || null
      }
      
      
      const newPosition = await portfolioService.addPosition(cleanedPosition)
      setPositions([...positions, newPosition])
      setShowAddModal(false)
    } catch (error: any) {
      alert(`Failed to add position: ${error.message || 'Unknown error'}`)
    }
  }

  const handleEditPosition = async (updatedPosition: Position) => {
    try {
      const updated = await portfolioService.updatePosition(updatedPosition.id, {
        project_id: updatedPosition.project_id,
        project_name: updatedPosition.project_name,
        symbol: updatedPosition.symbol,
        amount: updatedPosition.amount,
        cost_basis: updatedPosition.cost_basis,
        entry_date: updatedPosition.entry_date,
        exit_date: updatedPosition.exit_date,
        notes: updatedPosition.notes
      })
      setPositions(positions.map(p => p.id === updated.id ? { ...updated, current_price: p.current_price, current_value: p.current_value, profit_loss: p.profit_loss, profit_loss_percent: p.profit_loss_percent } : p))
      setEditingPosition(null)
    } catch (error) {
      alert('Failed to update position. Please try again.')
    }
  }

  const handleDeletePosition = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        await portfolioService.deletePosition(id)
        setPositions(positions.filter(p => p.id !== id))
      } catch (error) {
          alert('Failed to delete position. Please try again.')
      }
    }
  }

  const totalValue = positions.reduce((sum, p) => sum + (p.current_value || 0), 0)
  const totalCost = positions.reduce((sum, p) => sum + (p.cost_basis || 0), 0)
  const totalProfitLoss = totalValue - totalCost
  const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0


  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // Show loading state
  if (loading && !authChecked && positions.length === 0) {
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
  
  // Show login prompt if not authenticated after auth check
  if (authChecked && !isAuthenticated && positions.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">Authentication Required</h3>
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

  // Show error state
  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-semibold text-red-800 mb-2">Failed to Load Portfolio</h3>
          <p className="text-sm text-red-700 mb-4">Error: {error}</p>
          <details className="text-xs text-red-600">
            <summary className="cursor-pointer">Technical Details</summary>
            <pre className="mt-2 p-2 bg-red-100 rounded overflow-x-auto">
              Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}
              Has Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}
              Environment: {process.env.NODE_ENV}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Positions</h2>
          {lastUpdate && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Refresh Prices'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Position
          </button>
        </div>
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
              <th className="px-4 py-2 border-b text-left">Entry Date</th>
              <th className="px-4 py-2 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(position => (
              <tr key={position.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{position.project_name}</td>
                <td className="px-4 py-2 border-b font-mono">{position.symbol.toUpperCase()}</td>
                <td className="px-4 py-2 border-b text-right">{position.amount.toLocaleString()}</td>
                <td className="px-4 py-2 border-b text-right">${position.cost_basis.toLocaleString()}</td>
                <td className="px-4 py-2 border-b text-right">
                  ${position.current_price?.toFixed(4) || '-'}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  ${position.current_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'}
                </td>
                <td className={`px-4 py-2 border-b text-right font-medium ${
                  position.profit_loss && position.profit_loss > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${position.profit_loss?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'}
                </td>
                <td className={`px-4 py-2 border-b text-right font-medium ${
                  position.profit_loss_percent && position.profit_loss_percent > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {position.profit_loss_percent?.toFixed(2) || '-'}%
                </td>
                <td className="px-4 py-2 border-b">{position.entry_date}</td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => setEditingPosition(position)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePosition(position.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td colSpan={3} className="px-4 py-2 border-t">Total</td>
              <td className="px-4 py-2 border-t text-right">${totalCost.toLocaleString()}</td>
              <td className="px-4 py-2 border-t"></td>
              <td className="px-4 py-2 border-t text-right">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className={`px-4 py-2 border-t text-right ${
                totalProfitLoss > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className={`px-4 py-2 border-t text-right ${
                totalProfitLossPercent > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalProfitLossPercent.toFixed(2)}%
              </td>
              <td colSpan={2} className="px-4 py-2 border-t"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {(showAddModal || editingPosition) && (
        <PositionModal
          position={editingPosition}
          onSave={editingPosition ? handleEditPosition : handleAddPosition}
          onClose={() => {
            setShowAddModal(false)
            setEditingPosition(null)
          }}
        />
      )}
    </div>
  )
}

function PositionModal({ position, onSave, onClose }: {
  position: Position | null
  onSave: (position: any) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    project_id: position?.project_id || '',
    project_name: position?.project_name || '',
    symbol: position?.symbol || '',
    amount: position?.amount || '',
    cost_basis: position?.cost_basis || '',
    entry_date: position?.entry_date || new Date().toISOString().split('T')[0],
    exit_date: position?.exit_date || '',
    notes: position?.notes || '',
  })
  const [searchResults, setSearchResults] = useState<CoinPrice[]>([])
  const [searching, setSearching] = useState(false)
  const [useCurrentPrice, setUseCurrentPrice] = useState(!position) // Default to true for new positions
  const [useMay31Date, setUseMay31Date] = useState(false) // Option to use May 31st as entry date
  const [manualPrice, setManualPrice] = useState(0) // Manual price for May 31st

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    
    setSearching(true)
    try {
      const results = await searchCoins(query)
      setSearchResults(results)
    } catch (error) {
    } finally {
      setSearching(false)
    }
  }

  const handleSelectCoin = (coin: CoinPrice) => {
    const amount = parseFloat(String(formData.amount)) || 0
    const newCostBasis = useCurrentPrice && amount > 0 
      ? coin.current_price * amount 
      : formData.cost_basis
    
    setFormData({
      ...formData,
      project_id: coin.id,
      project_name: coin.name,
      symbol: coin.symbol,
      cost_basis: newCostBasis,
    })
    setSearchResults([])
  }

  // Update cost basis when amount changes and useCurrentPrice is true
  useEffect(() => {
    const amount = parseFloat(String(formData.amount)) || 0
    
    // Add a delay to prevent too many API calls
    const timeoutId = setTimeout(() => {
      if (useCurrentPrice && formData.project_id && amount > 0 && !useMay31Date) {
        // Only fetch current price if not using May 31st date
        getCoinPrice(formData.project_id).then(price => {
          if (price) {
            setFormData(prev => ({
              ...prev,
              cost_basis: price * amount
            }))
          }
        })
      } else if (useCurrentPrice && useMay31Date && manualPrice > 0 && amount > 0) {
        // Use manual price for May 31st
        setFormData(prev => ({
          ...prev,
          cost_basis: manualPrice * amount
        }))
      }
    }, 500) // Wait 500ms after user stops typing
    
    return () => clearTimeout(timeoutId)
  }, [formData.amount, useCurrentPrice, formData.project_id, useMay31Date, manualPrice])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.project_id || !formData.project_name || !formData.symbol) {
      alert('Please select a project from the search results')
      return
    }
    
    if (!formData.amount || parseFloat(String(formData.amount)) <= 0) {
      alert('Please enter a valid amount')
      return
    }
    
    onSave({
      ...position,
      ...formData,
      amount: parseFloat(String(formData.amount)) || 0,
      cost_basis: parseFloat(String(formData.cost_basis)) || 0,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {position ? 'Edit Position' : 'Add New Position'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Search Project</label>
            <input
              type="text"
              placeholder="Search by name or symbol..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {searching && <p className="text-sm text-gray-500 mt-1">Searching...</p>}
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded max-h-40 overflow-y-auto">
                {searchResults.map(coin => (
                  <button
                    key={coin.id}
                    type="button"
                    onClick={() => handleSelectCoin(coin)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                  >
                    <div className="font-medium">{coin.name}</div>
                    <div className="text-sm text-gray-500">
                      {coin.symbol.toUpperCase()} - ${coin.current_price.toFixed(4)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              value={formData.project_name}
              onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Symbol</label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              step="any"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              <input
                type="checkbox"
                checked={useCurrentPrice}
                onChange={(e) => setUseCurrentPrice(e.target.checked)}
                className="mr-2"
              />
              Use current price as cost basis
            </label>
            {useMay31Date && useCurrentPrice && (
              <div className="mt-2 mb-2">
                <label className="block text-sm font-medium mb-1">May 31st Price (per token)</label>
                <input
                  type="number"
                  step="any"
                  value={manualPrice}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0
                    setManualPrice(price)
                    const amount = parseFloat(String(formData.amount)) || 0
                    if (amount > 0) {
                      setFormData({ ...formData, cost_basis: price * amount })
                    }
                  }}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter May 31st price"
                />
              </div>
            )}
            <input
              type="number"
              step="any"
              value={formData.cost_basis}
              onChange={(e) => setFormData({ ...formData, cost_basis: e.target.value })}
              className="w-full border rounded px-3 py-2 mt-2"
              disabled={useCurrentPrice}
              placeholder={useCurrentPrice ? (useMay31Date ? "Total cost (price × amount)" : "Will be calculated from current price") : "Enter cost basis"}
              required
            />
            {useCurrentPrice && formData.project_name && (
              <p className="text-sm text-gray-500 mt-1">
                Cost basis will be: ${(parseFloat(String(formData.cost_basis)) || 0).toFixed(2)}
                {useMay31Date ? ' (using manual May 31st price)' : ' (using current price)'}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Entry Date</label>
            <div className="flex items-center gap-4 mb-2">
              <label className="text-sm">
                <input
                  type="checkbox"
                  checked={useMay31Date}
                  onChange={(e) => {
                    setUseMay31Date(e.target.checked)
                    if (e.target.checked) {
                      setFormData({ ...formData, entry_date: '2025-05-31' })
                    } else {
                      setFormData({ ...formData, entry_date: new Date().toISOString().split('T')[0] })
                    }
                  }}
                  className="mr-2"
                />
                Use May 31st, 2025
              </label>
            </div>
            <input
              type="date"
              value={formData.entry_date}
              onChange={(e) => {
                setFormData({ ...formData, entry_date: e.target.value })
                setUseMay31Date(e.target.value === '2025-05-31')
              }}
              className="w-full border rounded px-3 py-2"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {useMay31Date ? 'Using May 31st for portfolio snapshot' : 'Defaults to today\'s date'}
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              {position ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}