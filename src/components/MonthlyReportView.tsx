'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import type { Position } from '@/lib/types'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
)

interface MonthlyReportViewProps {
  positions: Position[]
  reportMonth: string
  investorName?: string
  investorAccount?: string
  investorSharePercentage?: number
}

interface PortfolioHolding {
  name: string
  symbol: string
  percentage: number
  thesis: string
  color: string
}

const DEFAULT_HOLDINGS_THESIS: Record<string, string> = {
  'kaspa': 'Fastest Layer 1 blockchain with revolutionary blockDAG technology',
  'bittensor': 'Decentralized AI network creating the foundation for open-source intelligence',
  'sui': 'Next-gen Layer 1 with parallel processing and superior developer experience',
  'the-open-network': 'Telegram\'s blockchain bringing crypto to 900M+ users worldwide',
  'celestia': 'Modular blockchain architecture enabling scalable data availability',
  'render-token': 'Decentralized GPU network powering the future of AI and rendering',
  'arbitrum': 'Leading Ethereum Layer 2 with dominant DeFi ecosystem',
  'near-protocol': 'User-friendly blockchain with chain abstraction innovation',
  'sei-network': 'Fastest Layer 1 optimized for trading and DeFi',
  'injective-protocol': 'First blockchain built for finance with MEV-resistant orderbook',
  'dymension': 'RollApp ecosystem enabling easy blockchain deployment',
  'akash-network': 'Decentralized cloud computing marketplace'
}

export default function MonthlyReportView({
  positions,
  reportMonth,
  investorName = 'Investor',
  investorAccount = '001',
  investorSharePercentage = 100
}: MonthlyReportViewProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)

  // Calculate portfolio metrics
  const totalValue = positions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0)
  const totalCost = positions.reduce((sum, pos) => sum + (pos.amount * pos.costBasis), 0)
  const totalPnL = totalValue - totalCost
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

  // Sort positions by value and prepare holdings data
  const sortedPositions = [...positions].sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0))
  
  // Take top 4 positions and group the rest
  const topHoldings: PortfolioHolding[] = sortedPositions.slice(0, 4).map((pos, index) => ({
    name: pos.projectName,
    symbol: pos.symbol.toUpperCase(),
    percentage: totalValue > 0 ? ((pos.currentValue || 0) / totalValue) * 100 : 0,
    thesis: DEFAULT_HOLDINGS_THESIS[pos.projectId] || 'High-conviction investment in blockchain innovation',
    color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index]
  }))

  // Calculate "Others" percentage
  const othersValue = sortedPositions.slice(4).reduce((sum, pos) => sum + (pos.currentValue || 0), 0)
  const othersPercentage = totalValue > 0 ? (othersValue / totalValue) * 100 : 0
  const othersCount = sortedPositions.length - 4

  if (othersCount > 0) {
    topHoldings.push({
      name: 'Other Holdings',
      symbol: `${othersCount} positions`,
      percentage: othersPercentage,
      thesis: 'Diversified selection including Celestia, Render, Arbitrum, and other high-conviction projects',
      color: '#6b7280'
    })
  }

  // Chart data
  const chartData = {
    labels: topHoldings.map(h => h.name),
    datasets: [{
      data: topHoldings.map(h => h.percentage.toFixed(1)),
      backgroundColor: topHoldings.map(h => h.color),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.label + ': ' + context.parsed + '%'
          }
        }
      }
    }
  }

  // Format date
  const reportDate = new Date(reportMonth + '-01')
  const monthName = reportDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Calculate investor-specific values
  const investorValue = totalValue * (investorSharePercentage / 100)
  const investorPnL = totalPnL * (investorSharePercentage / 100)
  const performanceFee = investorPnL > 0 ? investorPnL * 0.3 : 0
  const netInvestorValue = investorValue - performanceFee
  const netInvestorPnLPercent = totalPnLPercent * 0.7 // After 30% performance fee

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-16">
      {/* Header */}
      <div className="text-center mb-10 pb-8 border-b-2 border-gray-200">
        <h1 className="text-4xl font-light tracking-wider mb-3">SUNBEAM CAPITAL</h1>
        <h2 className="text-lg text-gray-600 mb-5">Monthly Performance Statement</h2>
        <p className="text-gray-600">For the Month Ending: {monthName}</p>
      </div>

      {/* Investor Information */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">Investor Information</h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <div className="text-sm text-gray-600 mb-1">Name</div>
            <div className="font-semibold">{investorName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Account Number</div>
            <div className="font-semibold">{investorAccount}</div>
          </div>
        </div>
      </div>

      {/* Fund Overview */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">Fund Overview</h3>
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600 mb-1">Total Fund Value</div>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600 mb-1">Number of Positions</div>
            <div className="text-2xl font-bold">{positions.length}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600 mb-1">Performance This Month</div>
            <div className={`text-2xl font-bold ${totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600 mb-1">Year-to-Date Performance</div>
            <div className={`text-2xl font-bold ${totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Composition */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200">Portfolio Composition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="h-80">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          <div>
            <h4 className="font-semibold mb-5">Portfolio Holdings & Investment Thesis</h4>
            {topHoldings.map((holding, index) => (
              <div key={index} className="flex items-start mb-4">
                <div 
                  className="w-5 h-5 rounded mr-3 mt-1 flex-shrink-0" 
                  style={{ backgroundColor: holding.color }}
                />
                <div className="flex-1">
                  <div className="font-semibold">
                    {holding.percentage.toFixed(1)}% - {holding.name} ({holding.symbol})
                  </div>
                  <div className="text-sm text-gray-600 italic">{holding.thesis}</div>
                </div>
              </div>
            ))}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm">
                <strong>Investment Philosophy:</strong> We maintain a concentrated portfolio of projects we believe will define the future of blockchain technology. 
                Each position is held with a 3-5 year horizon, focusing on revolutionary technology rather than short-term price movements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Commentary */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">Market Commentary</h3>
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h4 className="font-semibold mb-3">November Highlights</h4>
          <p className="mb-3">The portfolio experienced exceptional growth this month, with all sectors contributing positively to returns. Key drivers included:</p>
          <ul className="list-disc ml-5 mb-3 space-y-1">
            <li><strong>Regulatory Clarity:</strong> Post-election developments have created a favorable environment for digital assets</li>
            <li><strong>Institutional Adoption:</strong> Major protocols in our portfolio saw increased institutional interest</li>
            <li><strong>Technical Innovation:</strong> Several holdings released significant upgrades and partnerships</li>
            <li><strong>Market Rotation:</strong> Capital flow from Bitcoin into alternative assets benefited our diversified approach</li>
          </ul>
          <p className="font-semibold mb-2">Notable Achievements:</p>
          <ul className="list-disc ml-5 mb-3 space-y-1">
            <li>Our top Layer 1 position gained 68% following a major network upgrade</li>
            <li>AI-focused holdings averaged 35% returns amid growing adoption</li>
            <li>DeFi positions benefited from increased trading volumes</li>
          </ul>
          <p className="mt-4">
            Looking forward, we maintain a bullish outlook while actively managing risk through position sizing 
            and sector diversification. We expect continued strength in Q1 2025 as regulatory frameworks clarify 
            and institutional adoption accelerates.
          </p>
        </div>
      </div>

      {/* Individual Performance */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">Your Individual Performance</h3>
        <div className="bg-gray-50 p-5 rounded">
          <table className="w-full text-lg">
            <tbody>
              <tr>
                <td>Value of Your Investment:</td>
                <td className="text-right font-bold">${investorValue.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Less: 30% Performance Fee:</td>
                <td className="text-right text-red-600">-${performanceFee.toLocaleString()}</td>
              </tr>
              <tr className="border-t-2 border-gray-700 text-xl font-bold">
                <td className="pt-3">Net Value of Your Investment:</td>
                <td className="text-right pt-3">${netInvestorValue.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div className="grid grid-cols-2 gap-5 mt-5">
            <div>
              <div className="text-sm text-gray-600 mb-1">Your Monthly Performance</div>
              <div className={`text-xl font-bold ${netInvestorPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netInvestorPnLPercent >= 0 ? '+' : ''}{netInvestorPnLPercent.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Your Year-to-Date Performance</div>
              <div className={`text-xl font-bold ${netInvestorPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netInvestorPnLPercent >= 0 ? '+' : ''}{netInvestorPnLPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-200 text-xs text-gray-600">
        <div className="mb-5">
          <strong>Disclaimer:</strong> This statement is for informational purposes only and does not constitute investment advice. Past performance is not indicative of future results. Please consult your financial advisor before making any investment decisions.
        </div>
        <div>
          <strong>Confidentiality Notice:</strong> This document is confidential and intended solely for the use of the individual to whom it is addressed. Unauthorized use, disclosure, or copying is strictly prohibited.
        </div>
      </div>
    </div>
  )
}