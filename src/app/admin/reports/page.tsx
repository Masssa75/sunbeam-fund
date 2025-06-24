'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Report {
  id: string
  report_month: string
  report_type: string
  report_data: any
  created_at: string
  is_published: boolean
}

export default function ReportsListPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports')
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  const handleViewReport = (month: string) => {
    // Format month for URL (YYYY-MM)
    const formattedMonth = month.slice(0, 7)
    router.push(`/report?month=${formattedMonth}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Monthly Reports</h1>
          <div className="flex gap-4">
            <Link
              href="/admin/reports/upload"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Upload Historical Report
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Generate New Report
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No reports found</p>
            <Link
              href="/admin/reports/upload"
              className="text-blue-600 hover:text-blue-800"
            >
              Upload your first historical report
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Positions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatMonth(report.report_month)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.report_type === 'historical' 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {report.report_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.report_data?.positions?.length || 0} positions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewReport(report.report_month)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Add share functionality
                          const month = report.report_month.slice(0, 7)
                          const shareUrl = `${window.location.origin}/report?month=${month}`
                          navigator.clipboard.writeText(shareUrl)
                          alert('Report URL copied to clipboard!')
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Share
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Report URL Format</h3>
          <p className="text-sm text-blue-700">
            Share reports using: <code className="bg-blue-100 px-2 py-1 rounded">/report?month=YYYY-MM&name=InvestorName&account=XXX&share=XX.X</code>
          </p>
        </div>
      </div>
    </div>
  )
}