'use client'

import { useState, useEffect } from 'react'
import { getMultipleCoinPrices } from '@/lib/coingecko'

interface Position {
  id: string
  project_id: string
  project_name: string
  symbol: string
  amount: number
  cost_basis: number
  entry_date: string
  exit_date?: string
  notes?: string
  current_price?: number
  current_value?: number
  profit_loss?: number
  profit_loss_percent?: number
}

export default function PortfolioTableEnhanced({ onPositionsChange }: any) {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [saving, setSaving] = useState(false)

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
        // Separate custom and CoinGecko positions
        const customPositions = posData.filter((p: any) => p.project_id.startsWith('custom-'))
        const coinGeckoPositions = posData.filter((p: any) => !p.project_id.startsWith('custom-'))
        
        // Get prices for CoinGecko positions
        const coinIds = coinGeckoPositions.map((p: any) => p.project_id)
        let prices: any = {}
        
        if (coinIds.length > 0) {
          try {
            prices = await getMultipleCoinPrices(coinIds)
          } catch (priceError) {
            console.error('Price fetch error:', priceError)
          }
        }
        
        // Add prices to CoinGecko positions
        const coinGeckoWithPrices = coinGeckoPositions.map((pos: any) => {
          const price = prices[pos.project_id] || 0
          const currentValue = pos.amount * price
          const totalCost = pos.cost_basis
          return {
            ...pos,
            current_price: price,
            current_value: currentValue,
            profit_loss: currentValue - totalCost,
            profit_loss_percent: totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0
          }
        })
        
        // Handle custom positions (no current price available)
        const customWithPrices = customPositions.map((pos: any) => {
          return {
            ...pos,
            current_price: 0,
            current_value: pos.cost_basis, // Show cost basis as current value for now
            profit_loss: 0,
            profit_loss_percent: 0
          }
        })
        
        // Combine all positions
        const positionsWithPrices = [...coinGeckoWithPrices, ...customWithPrices]
          
        // Sort positions by current value (highest first)
        const sortedPositions = positionsWithPrices.sort((a: any, b: any) => 
          (b.current_value || 0) - (a.current_value || 0)
        )
        
        setPositions(sortedPositions)
        if (onPositionsChange) {
          onPositionsChange(sortedPositions)
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

  const handleAddPosition = async (positionData: Omit<Position, 'id'>) => {
    setSaving(true)
    try {
      const response = await fetch('/api/positions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(positionData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to add position')
      }
      
      await loadPortfolio()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding position:', error)
      alert('Failed to add position. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEditPosition = async (updatedPosition: Position) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/positions/${updatedPosition.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPosition)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update position')
      }
      
      await loadPortfolio()
      setEditingPosition(null)
    } catch (error) {
      console.error('Error updating position:', error)
      alert('Failed to update position. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePosition = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this position?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/positions/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete position')
      }
      
      await loadPortfolio()
    } catch (error) {
      console.error('Error deleting position:', error)
      alert('Failed to delete position. Please try again.')
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
        <div className="flex gap-2">
          <button
            onClick={loadPortfolio}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
              <th className="px-4 py-2 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">
                  <div className="flex items-center gap-2">
                    {position.project_name}
                    {position.project_id.startsWith('custom-') && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Custom</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 border-b uppercase">{position.symbol}</td>
                <td className="px-4 py-2 border-b text-right">{position.amount.toLocaleString()}</td>
                <td className="px-4 py-2 border-b text-right">${position.cost_basis.toFixed(4)}</td>
                <td className="px-4 py-2 border-b text-right">
                  {position.project_id.startsWith('custom-') 
                    ? <span className="text-gray-500">N/A</span>
                    : `$${position.current_price?.toFixed(4) || '0.0000'}`}
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
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => setEditingPosition(position)}
                    className="text-blue-600 hover:text-blue-800 mr-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePosition(position.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
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
              <td className="px-4 py-2 border-t"></td>
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
          saving={saving}
        />
      )}
    </div>
  )
}

function PositionModal({ position, onSave, onClose, saving }: {
  position: Position | null
  onSave: (position: any) => void
  onClose: () => void
  saving: boolean
}) {
  const [formData, setFormData] = useState({
    project_id: position?.project_id || '',
    project_name: position?.project_name || '',
    symbol: position?.symbol || '',
    amount: position?.amount || 0,
    cost_basis: position?.cost_basis || 0,
    entry_date: position?.entry_date || new Date().toISOString().split('T')[0],
    exit_date: position?.exit_date || '',
    notes: position?.notes || '',
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [isCustomEntry, setIsCustomEntry] = useState(false)

  // Fetch current price when editing a position
  useEffect(() => {
    if (position?.project_id) {
      fetchCurrentPrice(position.project_id)
    }
  }, [position])

  // Search for projects when typing
  useEffect(() => {
    if (searchQuery.length > 2 && !position) {
      const timer = setTimeout(() => {
        searchProjects()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])
  
  const fetchCurrentPrice = async (projectId: string) => {
    setFetchingPrice(true)
    try {
      const response = await fetch(`/api/coingecko/price?ids=${projectId}`)
      if (response.ok) {
        const prices = await response.json()
        setCurrentPrice(prices[projectId] || 0)
      }
    } catch (error) {
      console.error('Error fetching price:', error)
    } finally {
      setFetchingPrice(false)
    }
  }

  const searchProjects = async () => {
    setSearching(true)
    try {
      const response = await fetch(`/api/coingecko/search?query=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.coins || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleProjectSelect = async (coin: any) => {
    setFormData({
      ...formData,
      project_id: coin.id,
      project_name: coin.name,
      symbol: coin.symbol.toUpperCase()
    })
    setSearchQuery('')
    setSearchResults([])
    
    // Fetch current price to calculate cost basis
    setFetchingPrice(true)
    try {
      const response = await fetch(`/api/coingecko/price?ids=${coin.id}`)
      if (response.ok) {
        const prices = await response.json()
        const currentPrice = prices[coin.id] || 0
        
        // Store the current price for later calculations
        setCurrentPrice(currentPrice)
        
        // Update cost basis if amount is already entered
        if (formData.amount > 0) {
          setFormData(prev => ({
            ...prev,
            project_id: coin.id,
            project_name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            cost_basis: Number((prev.amount * currentPrice).toFixed(2))
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching price:', error)
    } finally {
      setFetchingPrice(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let finalFormData = {
      ...position,
      ...formData,
      amount: Number(formData.amount),
      cost_basis: Number(formData.cost_basis),
    }
    
    // For custom entries, generate a unique project_id if not already set
    if (isCustomEntry && !formData.project_id && !position) {
      finalFormData.project_id = `custom-${formData.symbol.toLowerCase()}-${Date.now()}`
    }
    
    onSave(finalFormData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {position ? 'Edit Position' : 'Add New Position'}
        </h3>
        <form onSubmit={handleSubmit}>
          {!position && (
            <>
              <div className="mb-4">
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomEntry(false)
                      setFormData({
                        ...formData,
                        project_id: '',
                        project_name: '',
                        symbol: ''
                      })
                      setCurrentPrice(0)
                    }}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                      !isCustomEntry 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Search CoinGecko
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomEntry(true)
                      setSearchQuery('')
                      setSearchResults([])
                      setCurrentPrice(0)
                    }}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                      isCustomEntry 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Custom Entry (Presale/Other)
                  </button>
                </div>
                
                {!isCustomEntry ? (
                  <>
                    <label className="block text-sm font-medium mb-1">Search Project</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or symbol..."
                      className="w-full border rounded px-3 py-2"
                    />
                    {searching && (
                      <p className="text-sm text-gray-500 mt-1">Searching...</p>
                    )}
                    {searchResults.length > 0 && (
                      <div className="mt-2 border rounded max-h-40 overflow-y-auto">
                        {searchResults.map((coin: any) => (
                          <button
                            key={coin.id}
                            type="button"
                            onClick={() => handleProjectSelect(coin)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                          >
                            {coin.thumb && (
                              <img src={coin.thumb} alt="" className="w-6 h-6" />
                            )}
                            <div>
                              <div className="font-medium">{coin.name}</div>
                              <div className="text-sm text-gray-500">{coin.symbol.toUpperCase()}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                    Enter custom details for presale investments, private rounds, or tokens not listed on CoinGecko.
                  </p>
                )}
              </div>
            </>
          )}
          
          {(formData.project_name || position || isCustomEntry) && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className={`w-full border rounded px-3 py-2 ${!position && !isCustomEntry ? 'bg-gray-50' : ''}`}
                  required
                  readOnly={!position && !isCustomEntry}
                  placeholder={isCustomEntry ? "e.g., Project X Presale" : ""}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Symbol</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className={`w-full border rounded px-3 py-2 ${!position && !isCustomEntry ? 'bg-gray-50' : ''}`}
                  required
                  readOnly={!position && !isCustomEntry}
                  placeholder={isCustomEntry ? "e.g., PROJX" : ""}
                />
              </div>
            </>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              step="any"
              value={formData.amount}
              onChange={(e) => {
                const newAmount = parseFloat(e.target.value) || 0
                setFormData({ 
                  ...formData, 
                  amount: newAmount,
                  cost_basis: currentPrice > 0 && !isCustomEntry ? Number((newAmount * currentPrice).toFixed(2)) : formData.cost_basis
                })
              }}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Total Cost Basis (USD)</label>
            <input
              type="number"
              step="any"
              value={formData.cost_basis}
              onChange={(e) => setFormData({ ...formData, cost_basis: parseFloat(e.target.value) || 0 })}
              className={`w-full border rounded px-3 py-2 ${currentPrice > 0 && !isCustomEntry ? 'bg-gray-50' : ''}`}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {isCustomEntry
                ? 'Enter the total investment amount in USD'
                : fetchingPrice 
                  ? 'Fetching current price...'
                  : currentPrice > 0 
                    ? `Auto-calculated based on current price: $${currentPrice.toFixed(4)}`
                    : 'Enter the total amount paid'}
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Entry Date</label>
            <input
              type="date"
              value={formData.entry_date}
              onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder={isCustomEntry ? "e.g., Presale Round 1, Vesting 12 months" : ""}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={saving || (!position && !formData.project_id)}
            >
              {saving ? 'Saving...' : (position ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}