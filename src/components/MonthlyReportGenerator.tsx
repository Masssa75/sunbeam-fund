'use client'

import { useState } from 'react'
import Link from 'next/link'
import { generateMonthlyReport } from '@/lib/reports/generator'
import type { Position } from '@/lib/types'

interface MonthlyReportGeneratorProps {
  positions: Position[]
}

export default function MonthlyReportGenerator({ positions }: MonthlyReportGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const handleGenerateReport = async () => {
    setGenerating(true)
    try {
      const report = await generateMonthlyReport(positions, selectedMonth)
      
      // Create a blob and download
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sunbeam-report-${selectedMonth}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">Monthly Report Generator</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg"
            max={new Date().toISOString().slice(0, 7)}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleGenerateReport}
            disabled={generating || positions.length === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            {generating ? 'Generating...' : 'Download JSON Report'}
          </button>
          
          <Link
            href={`/report?month=${selectedMonth}`}
            className={`px-6 py-2 rounded-lg ${
              positions.length === 0 
                ? 'bg-gray-300 text-gray-500 pointer-events-none' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            target="_blank"
          >
            View Visual Report
          </Link>
        </div>

        {positions.length === 0 && (
          <p className="text-sm text-gray-500">Add positions to generate a report</p>
        )}
        
        {positions.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> Customize the visual report by adding URL parameters:
            </p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-2 overflow-x-auto">
              /report?month={selectedMonth}&name=Investor%20Name&account=001&share=100
            </code>
          </div>
        )}
      </div>
    </div>
  )
}