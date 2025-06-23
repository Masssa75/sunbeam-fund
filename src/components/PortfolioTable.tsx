'use client'

import { useState } from 'react'

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

export default function PortfolioTable() {
  const [positions, setPositions] = useState<Position[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)

  const handleAddPosition = (position: Omit<Position, 'id'>) => {
    const newPosition = {
      ...position,
      id: Date.now().toString(),
    }
    setPositions([...positions, newPosition])
    setShowAddModal(false)
  }

  const handleEditPosition = (updatedPosition: Position) => {
    setPositions(positions.map(p => p.id === updatedPosition.id ? updatedPosition : p))
    setEditingPosition(null)
  }

  const handleDeletePosition = (id: string) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      setPositions(positions.filter(p => p.id !== id))
    }
  }

  const totalValue = positions.reduce((sum, p) => sum + (p.current_value || 0), 0)
  const totalCost = positions.reduce((sum, p) => sum + (p.cost_basis || 0), 0)
  const totalProfitLoss = totalValue - totalCost
  const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Portfolio Positions</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Position
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
              <th className="px-4 py-2 border-b text-left">Entry Date</th>
              <th className="px-4 py-2 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(position => (
              <tr key={position.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{position.project_name}</td>
                <td className="px-4 py-2 border-b">{position.symbol}</td>
                <td className="px-4 py-2 border-b text-right">{position.amount.toLocaleString()}</td>
                <td className="px-4 py-2 border-b text-right">${position.cost_basis.toLocaleString()}</td>
                <td className="px-4 py-2 border-b text-right">
                  ${position.current_price?.toFixed(4) || '-'}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  ${position.current_value?.toLocaleString() || '-'}
                </td>
                <td className={`px-4 py-2 border-b text-right ${
                  position.profit_loss && position.profit_loss > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${position.profit_loss?.toLocaleString() || '-'}
                </td>
                <td className={`px-4 py-2 border-b text-right ${
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
              <td className="px-4 py-2 border-t text-right">${totalValue.toLocaleString()}</td>
              <td className={`px-4 py-2 border-t text-right ${
                totalProfitLoss > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${totalProfitLoss.toLocaleString()}
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
    amount: position?.amount || 0,
    cost_basis: position?.cost_basis || 0,
    entry_date: position?.entry_date || new Date().toISOString().split('T')[0],
    exit_date: position?.exit_date || '',
    notes: position?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...position,
      ...formData,
      amount: Number(formData.amount),
      cost_basis: Number(formData.cost_basis),
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {position ? 'Edit Position' : 'Add New Position'}
        </h3>
        <form onSubmit={handleSubmit}>
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
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Cost Basis (USD)</label>
            <input
              type="number"
              step="any"
              value={formData.cost_basis}
              onChange={(e) => setFormData({ ...formData, cost_basis: parseFloat(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              required
            />
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