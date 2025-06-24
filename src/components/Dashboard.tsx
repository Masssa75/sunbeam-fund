'use client'

import { useState } from 'react'
import Link from 'next/link'
import PortfolioTableWithPrices from './PortfolioTableSimplified'
import ReportGenerator from './ReportGenerator'

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

export default function Dashboard() {
  const [positions, setPositions] = useState<Position[]>([])

  return (
    <div>
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
    </div>
  )
}