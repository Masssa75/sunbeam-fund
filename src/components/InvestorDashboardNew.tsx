'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

interface InvestorDashboardProps {
  viewAsId?: string | null
}

export default function InvestorDashboardNew({ viewAsId }: InvestorDashboardProps) {
  const [standing, setStanding] = useState<InvestorStanding | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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
        : '/api/investor/standing';
      
      const standingRes = await fetch(standingUrl);
      if (!standingRes.ok) {
        throw new Error('Failed to fetch investor standing');
      }
      const standingData = await standingRes.json();
      setStanding(standingData.standing);

      // Fetch investor reports
      const reportsUrl = viewAsId
        ? `/api/investor/reports?viewAs=${viewAsId}`
        : '/api/investor/reports';
        
      const reportsRes = await fetch(reportsUrl);
      if (!reportsRes.ok) {
        throw new Error('Failed to fetch investor reports');
      }
      const reportsData = await reportsRes.json();
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
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-semibold">Investor Portal</h1>
          <p className="text-gray-600 mt-1">Welcome back, {standing.name}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Current Standing Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
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
        </div>

        {/* Past Reports Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Monthly Reports</h2>
          
          <div className="space-y-3">
            {reports.map(report => (
              <div 
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  // In production, this would navigate to the report or download it
                  console.log('View report:', report.month, report.year)
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">{report.month} {report.year}</div>
                    <div className="text-sm text-gray-500">Monthly Performance Report</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`text-sm font-medium ${report.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {report.performance >= 0 ? '+' : ''}{report.performance}%
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          
          {reports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No reports available yet
            </div>
          )}
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