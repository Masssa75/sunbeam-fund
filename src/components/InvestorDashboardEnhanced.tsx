'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

interface InvestorStanding {
  name: string
  accountNumber: string
  sharePercentage: number
  initialInvestment: number
  currentValue: number
  totalReturn: number
  totalReturnPercent: number
  monthlyReturn: number
  monthlyReturnPercent: number
  status: string
}

interface Report {
  id: string
  month: string
  year: number
  performance: number
  downloadUrl?: string
}

interface PortfolioHolding {
  name: string
  symbol: string
  percentage: number
  thesis: string
  color: string
}

interface ImportantTweet {
  id: string
  project: string
  content: string
  timestamp: string
  importance: number
}

interface InvestorDashboardProps {
  viewAsId?: string | null
}

export default function InvestorDashboardEnhanced({ viewAsId }: InvestorDashboardProps) {
  const [standing, setStanding] = useState<InvestorStanding | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Mock data for portfolio composition - will be replaced with real data
  const portfolioData: PortfolioHolding[] = [
    {
      name: 'Kaspa',
      symbol: 'KAS',
      percentage: 18.2,
      thesis: 'Fastest Layer 1 blockchain with revolutionary blockDAG technology',
      color: '#3b82f6'
    },
    {
      name: 'Bittensor',
      symbol: 'TAO',
      percentage: 15.7,
      thesis: 'Decentralized AI network creating the foundation for open-source intelligence',
      color: '#8b5cf6'
    },
    {
      name: 'Sui',
      symbol: 'SUI',
      percentage: 14.3,
      thesis: 'Next-gen Layer 1 with parallel processing and superior developer experience',
      color: '#10b981'
    },
    {
      name: 'Toncoin',
      symbol: 'TON',
      percentage: 12.8,
      thesis: 'Telegram\'s blockchain bringing crypto to 900M+ users worldwide',
      color: '#f59e0b'
    },
    {
      name: 'Other Holdings',
      symbol: '',
      percentage: 39.0,
      thesis: 'Diversified selection including Celestia, Render, Arbitrum, and other high-conviction projects',
      color: '#6b7280'
    }
  ]

  // Placeholder tweets - will be replaced with real data from Twitter monitoring
  const placeholderTweets: ImportantTweet[] = [
    {
      id: '1',
      project: 'Kaspa',
      content: '[PLACEHOLDER] Important update about Kaspa will appear here',
      timestamp: '2h ago',
      importance: 8
    },
    {
      id: '2',
      project: 'Bittensor',
      content: '[PLACEHOLDER] Significant Bittensor announcement will show here',
      timestamp: '5h ago',
      importance: 9
    },
    {
      id: '3',
      project: 'Sui',
      content: '[PLACEHOLDER] Major Sui development update will display here',
      timestamp: '1d ago',
      importance: 7
    }
  ]

  const chartData = {
    labels: portfolioData.map(h => h.symbol ? `${h.name} (${h.symbol})` : h.name),
    datasets: [{
      data: portfolioData.map(h => h.percentage),
      backgroundColor: portfolioData.map(h => h.color),
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

  useEffect(() => {
    loadInvestorData()
  }, [viewAsId])

  const loadInvestorData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check authentication first (unless viewing as admin)
      if (!viewAsId) {
        const authRes = await fetch('/api/auth/session/')
        const authData = await authRes.json()
        
        if (!authData.authenticated) {
          router.push('/login')
          return
        }
      }

      // Fetch investor standing
      const standingUrl = viewAsId 
        ? `/api/investor/standing?viewAs=${viewAsId}`
        : '/api/investor/standing'
      
      const standingRes = await fetch(standingUrl)
      if (!standingRes.ok) {
        throw new Error('Failed to fetch investor standing')
      }
      const standingData = await standingRes.json()
      setStanding(standingData.standing)

      // Fetch investor reports
      const reportsUrl = viewAsId
        ? `/api/investor/reports?viewAs=${viewAsId}`
        : '/api/investor/reports'
        
      const reportsRes = await fetch(reportsUrl)
      if (!reportsRes.ok) {
        throw new Error('Failed to fetch investor reports')
      }
      const reportsData = await reportsRes.json()
      setReports(reportsData.reports)

    } catch (err) {
      console.error('Error loading investor data:', err)
      setError('Failed to load investor data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !standing) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 rounded-lg p-6 text-center">
            <p className="text-red-600">{error || 'Unable to load investor data'}</p>
            <button 
              onClick={loadInvestorData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const fundTotalValue = Math.round(standing.currentValue / (standing.sharePercentage / 100))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-semibold">Investor Portal</h1>
          <p className="text-gray-600 mt-1">Welcome back, {standing.name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Standing Section */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-semibold mb-6">Your Current Standing</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Account Info */}
                <div>
                  <div className="mb-6">
                    <div className="text-sm text-gray-500">Account Number</div>
                    <div className="text-lg font-medium">{standing.accountNumber}</div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-sm text-gray-500">Your Share</div>
                    <div className="text-lg font-medium">{standing.sharePercentage}%</div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-sm text-gray-500">Initial Investment</div>
                    <div className="text-lg font-medium">${standing.initialInvestment.toLocaleString()}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {standing.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Performance */}
                <div>
                  <div className="mb-6">
                    <div className="text-sm text-gray-500">Current Value</div>
                    <div className="text-3xl font-semibold">${standing.currentValue.toLocaleString()}</div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-sm text-gray-500">Total Return</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-medium text-green-600">
                        +${standing.totalReturn.toLocaleString()}
                      </span>
                      <span className="text-sm text-green-600">
                        (+{standing.totalReturnPercent}%)
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">This Month</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-medium text-green-600">
                        +${standing.monthlyReturn.toLocaleString()}
                      </span>
                      <span className="text-sm text-green-600">
                        (+{standing.monthlyReturnPercent}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fund Overview */}
              <div className="mt-8 pt-8 border-t grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Total Fund Value</div>
                  <div className="text-lg font-semibold">${fundTotalValue.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Number of Positions</div>
                  <div className="text-lg font-semibold">12</div>
                </div>
              </div>
            </div>

            {/* Portfolio Composition */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-semibold mb-6">Portfolio Composition</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative h-64">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 mb-4">Holdings & Investment Thesis</h3>
                  {portfolioData.map((holding, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div 
                        className="w-5 h-5 rounded mt-0.5 flex-shrink-0" 
                        style={{ backgroundColor: holding.color }}
                      ></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {holding.percentage}% - {holding.name} {holding.symbol && `(${holding.symbol})`}
                        </div>
                        <div className="text-xs text-gray-600 italic mt-1">
                          {holding.thesis}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investment Philosophy */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-gray-700">
                  <strong>Investment Philosophy:</strong> We maintain a concentrated portfolio of projects we believe will define the future of blockchain technology. 
                  Each position is held with a 3-5 year horizon, focusing on revolutionary technology rather than short-term price movements.
                </p>
              </div>
            </div>

            {/* Important Updates */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-semibold mb-6">Important Project Updates</h2>
              
              <div className="space-y-4">
                {placeholderTweets.map(tweet => (
                  <div key={tweet.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{tweet.project}</span>
                        <span className="text-xs text-gray-500">{tweet.timestamp}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        Importance: {tweet.importance}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{tweet.content}</p>
                  </div>
                ))}
              </div>
              
              <p className="mt-4 text-xs text-gray-500 text-center">
                Twitter monitoring integration coming soon
              </p>
            </div>
          </div>

          {/* Right Column - Reports */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Monthly Reports</h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reports.map(report => (
                  <div 
                    key={report.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      console.log('View report:', report.month, report.year)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{report.month} {report.year}</div>
                        <div className={`text-xs ${report.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {report.performance >= 0 ? '+' : ''}{report.performance}%
                        </div>
                      </div>
                    </div>
                    
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
              
              {reports.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No reports available yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <p className="text-gray-700">
            Questions about your investment? Contact us at{' '}
            <a href="mailto:investors@sunbeam.capital" className="text-blue-600 hover:underline">
              investors@sunbeam.capital
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}