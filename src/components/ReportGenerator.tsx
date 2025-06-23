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
  current_price?: number
  current_value?: number
  profit_loss?: number
  profit_loss_percent?: number
}

interface ReportGeneratorProps {
  positions: Position[]
}

export default function ReportGenerator({ positions }: ReportGeneratorProps) {
  const [generatingReport, setGeneratingReport] = useState(false)
  const [reportMonth, setReportMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  )

  const generateReport = async () => {
    setGeneratingReport(true)
    
    try {
      // Calculate portfolio metrics
      const totalValue = positions.reduce((sum, p) => sum + (p.current_value || 0), 0)
      const totalCost = positions.reduce((sum, p) => sum + (p.cost_basis || 0), 0)
      const totalProfitLoss = totalValue - totalCost
      const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0
      
      // Group positions by performance
      const winners = positions
        .filter(p => p.profit_loss && p.profit_loss > 0)
        .sort((a, b) => (b.profit_loss_percent || 0) - (a.profit_loss_percent || 0))
      
      const losers = positions
        .filter(p => p.profit_loss && p.profit_loss < 0)
        .sort((a, b) => (a.profit_loss_percent || 0) - (b.profit_loss_percent || 0))
      
      const report = {
        reportMonth,
        generatedAt: new Date().toISOString(),
        portfolio: {
          totalPositions: positions.length,
          totalValue,
          totalCost,
          totalProfitLoss,
          totalProfitLossPercent,
        },
        topPerformers: winners.slice(0, 5).map(p => ({
          name: p.project_name,
          symbol: p.symbol,
          profitLossPercent: p.profit_loss_percent,
          profitLoss: p.profit_loss,
        })),
        worstPerformers: losers.slice(0, 5).map(p => ({
          name: p.project_name,
          symbol: p.symbol,
          profitLossPercent: p.profit_loss_percent,
          profitLoss: p.profit_loss,
        })),
        positions: positions.map(p => ({
          ...p,
          // Include all position data for detailed report
        })),
      }
      
      // For now, just download as JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sunbeam-report-${reportMonth}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      alert('Report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">Generate Monthly Report</h3>
      
      <div className="flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Report Month</label>
          <input
            type="month"
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        
        <button
          onClick={generateReport}
          disabled={generatingReport || positions.length === 0}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {generatingReport ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
      
      {positions.length === 0 && (
        <p className="text-gray-500 mt-4">Add positions to generate a report</p>
      )}
    </div>
  )
}