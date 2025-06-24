'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ParsedInvestor {
  name: string
  account: string
  sharePercentage: number
  monthlyPerformance: number
  ytdPerformance: number
  investmentValue: number
  performanceFee: number
  netValue: number
}

interface ParsedReport {
  month: string
  fundTotalValue: number
  fundMonthlyPerformance: number
  fundYtdPerformance: number
  investors: ParsedInvestor[]
  highlights: string
}

export default function ImportGoogleDocsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [googleDocLinks, setGoogleDocLinks] = useState('')
  const [parsedReports, setParsedReports] = useState<ParsedReport[]>([])
  const [processing, setProcessing] = useState(false)

  const parseGoogleDocContent = (content: string): ParsedInvestor => {
    // Extract investor info
    const nameMatch = content.match(/Name:\s*(.+)/)
    const accountMatch = content.match(/Account Number:\s*(\d+)/)
    
    // Extract fund overview
    const fundValueMatch = content.match(/Total Fund Value:\s*\$?([\d,]+)/)
    const monthlyPerfMatch = content.match(/Performance This Month:\s*([\d.-]+)%/)
    const ytdPerfMatch = content.match(/Year-to-Date Performance:\s*([\d.-]+)%/)
    
    // Extract individual performance
    const investmentValueMatch = content.match(/Value of Your Investment:\s*\$?([\d,]+)/)
    const perfFeeMatch = content.match(/performance fee:\s*\$?([\d,]+)/)
    const netValueMatch = content.match(/Net Value of Your Investment:\s*\$?([\d,]+)/)
    const yourMonthlyMatch = content.match(/Your Monthly Performance:\s*\+([\d.-]+)%/)
    const yourYtdMatch = content.match(/Your Year-to-Date Performance:\s*\+([\d.-]+)%/)
    
    // Extract highlights section
    const highlightsMatch = content.match(/Highlights\s*([\s\S]*?)Individual Performance:/);
    
    // Calculate share percentage from investment value and fund total
    const fundTotal = parseFloat(fundValueMatch?.[1]?.replace(/,/g, '') || '0')
    const investmentValue = parseFloat(investmentValueMatch?.[1]?.replace(/,/g, '') || '0')
    const sharePercentage = fundTotal > 0 ? (investmentValue / fundTotal) * 100 : 0

    return {
      name: nameMatch?.[1]?.trim() || 'Unknown',
      account: accountMatch?.[1]?.trim() || '000',
      sharePercentage: Math.round(sharePercentage * 10) / 10,
      monthlyPerformance: parseFloat(yourMonthlyMatch?.[1] || '0'),
      ytdPerformance: parseFloat(yourYtdMatch?.[1] || '0'),
      investmentValue: investmentValue,
      performanceFee: parseFloat(perfFeeMatch?.[1]?.replace(/,/g, '') || '0'),
      netValue: parseFloat(netValueMatch?.[1]?.replace(/,/g, '') || '0'),
    }
  }

  const fetchAndParseDoc = async (link: string): Promise<{ investor: ParsedInvestor, month: string, fundData: any, highlights: string } | null> => {
    try {
      // Extract document ID from the link
      const docIdMatch = link.match(/\/d\/([a-zA-Z0-9-_]+)/)
      if (!docIdMatch) {
        throw new Error('Invalid Google Doc link')
      }
      
      const docId = docIdMatch[1]
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`
      
      // Fetch via our API to avoid CORS
      const response = await fetch('/api/fetch-google-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: exportUrl })
      })
      
      if (!response.ok) throw new Error('Failed to fetch document')
      
      const content = await response.text()
      
      // Extract month
      const monthMatch = content.match(/Month Ending:\s*(\w+\s+\d{4})/)
      const month = monthMatch?.[1] || 'Unknown'
      
      // Extract fund data
      const fundValueMatch = content.match(/Total Fund Value:\s*\$?([\d,]+)/)
      const monthlyPerfMatch = content.match(/Performance This Month:\s*([\d.-]+)%/)
      const ytdPerfMatch = content.match(/Year-to-Date Performance:\s*([\d.-]+)%/)
      
      // Extract highlights
      const highlightsMatch = content.match(/Highlights\s*([\s\S]*?)Individual Performance:/);
      const highlights = highlightsMatch?.[1]?.trim() || ''
      
      const investor = parseGoogleDocContent(content)
      
      return {
        investor,
        month,
        fundData: {
          totalValue: parseFloat(fundValueMatch?.[1]?.replace(/,/g, '') || '0'),
          monthlyPerformance: parseFloat(monthlyPerfMatch?.[1] || '0'),
          ytdPerformance: parseFloat(ytdPerfMatch?.[1] || '0')
        },
        highlights
      }
    } catch (error) {
      console.error('Error parsing document:', error)
      return null
    }
  }

  const handleImport = async () => {
    setProcessing(true)
    setMessage('')
    
    const links = googleDocLinks
      .split('\n')
      .map(link => link.trim())
      .filter(link => link.includes('docs.google.com'))
    
    if (links.length === 0) {
      setMessage('Please enter at least one Google Doc link')
      setProcessing(false)
      return
    }
    
    setMessage(`Processing ${links.length} documents...`)
    
    // Process all documents
    const results = await Promise.all(links.map(link => fetchAndParseDoc(link)))
    const validResults = results.filter(r => r !== null) as Array<{
      investor: ParsedInvestor, 
      month: string, 
      fundData: any, 
      highlights: string
    }>
    
    // Group by month
    const reportsByMonth = validResults.reduce((acc, result) => {
      const monthKey = result.month
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          fundTotalValue: result.fundData.totalValue,
          fundMonthlyPerformance: result.fundData.monthlyPerformance,
          fundYtdPerformance: result.fundData.ytdPerformance,
          investors: [],
          highlights: result.highlights
        }
      }
      acc[monthKey].investors.push(result.investor)
      return acc
    }, {} as Record<string, ParsedReport>)
    
    const reports = Object.values(reportsByMonth)
    setParsedReports(reports)
    setMessage(`Successfully parsed ${validResults.length} documents into ${reports.length} monthly reports`)
    setProcessing(false)
  }

  const handleSaveReports = async () => {
    setLoading(true)
    try {
      for (const report of parsedReports) {
        // Convert month name to YYYY-MM format
        const monthMap: Record<string, string> = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        }
        
        const [monthName, year] = report.month.split(' ')
        const monthNum = monthMap[monthName] || '01'
        const formattedMonth = `${year}-${monthNum}`
        
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            report_month: formattedMonth,
            report_data: {
              fund_overview: {
                total_value: report.fundTotalValue,
                monthly_performance: report.fundMonthlyPerformance,
                ytd_performance: report.fundYtdPerformance
              },
              investors: report.investors,
              highlights: report.highlights,
              positions: [] // Will be populated from current portfolio
            },
            report_type: 'historical'
          })
        })
        
        if (!response.ok) throw new Error('Failed to save report')
      }
      
      setMessage('All reports saved successfully!')
      setTimeout(() => {
        router.push('/admin/reports')
      }, 1500)
    } catch (error) {
      setMessage(`Error saving reports: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Import Google Docs Reports</h1>
          <Link
            href="/admin/reports"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Reports
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Paste Google Doc Links</h2>
          <p className="text-gray-600 mb-4">
            Enter one Google Doc link per line. Each document should be a monthly investor report.
          </p>
          
          <textarea
            value={googleDocLinks}
            onChange={(e) => setGoogleDocLinks(e.target.value)}
            placeholder="https://docs.google.com/document/d/1H1m4S-F80OuH5ZwXrzL1HCOOAwMZPS4ccj6j9xjU1Rw/edit
https://docs.google.com/document/d/another-doc-id/edit"
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md"
          />
          
          <button
            onClick={handleImport}
            disabled={processing || !googleDocLinks.trim()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Parse Documents'}
          </button>
          
          {message && (
            <div className={`mt-4 p-3 rounded-md ${
              message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        {parsedReports.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: Review Parsed Reports</h2>
            
            {parsedReports.map((report, idx) => (
              <div key={idx} className="mb-6 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{report.month}</h3>
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Fund Total:</span>
                    <span className="ml-2 font-medium">${report.fundTotalValue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Monthly Performance:</span>
                    <span className="ml-2 font-medium">{report.fundMonthlyPerformance}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">YTD Performance:</span>
                    <span className="ml-2 font-medium">{report.fundYtdPerformance}%</span>
                  </div>
                </div>
                
                <h4 className="font-medium mb-2">Investors:</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Name</th>
                      <th className="text-left py-1">Account</th>
                      <th className="text-right py-1">Share %</th>
                      <th className="text-right py-1">Net Value</th>
                      <th className="text-right py-1">Monthly %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.investors.map((investor, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-1">{investor.name}</td>
                        <td className="py-1">{investor.account}</td>
                        <td className="text-right py-1">{investor.sharePercentage}%</td>
                        <td className="text-right py-1">${investor.netValue.toLocaleString()}</td>
                        <td className="text-right py-1">{investor.monthlyPerformance}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSaveReports}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : `Save ${parsedReports.length} Reports`}
              </button>
              
              <button
                onClick={() => {
                  setParsedReports([])
                  setGoogleDocLinks('')
                  setMessage('')
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}