'use client'

import { useState } from 'react'
import PortfolioTableWithPrices from './PortfolioTableWithPrices'
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
    </div>
  )
}