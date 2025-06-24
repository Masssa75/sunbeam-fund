'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ParsedReport {
  month: string
  positions: Array<{
    project_name: string
    symbol: string
    amount: number
    cost_basis: number
    entry_date: string
  }>
  total_value?: number
  notes?: string
}

export default function UploadReportsPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [parsedReport, setParsedReport] = useState<ParsedReport | null>(null)
  const [reportMonth, setReportMonth] = useState('')
  const [fileContent, setFileContent] = useState('')

  const parseReportContent = (content: string, filename: string) => {
    try {
      // Try JSON first
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        const data = JSON.parse(content)
        return extractReportData(data, filename)
      }
      
      // Try CSV
      if (content.includes(',') && content.includes('\n')) {
        return parseCSV(content, filename)
      }
      
      // Try plain text with patterns
      return parseTextReport(content, filename)
    } catch (error) {
      console.error('Parse error:', error)
      throw new Error('Could not parse report format')
    }
  }

  const extractReportData = (data: any, filename: string): ParsedReport => {
    // Extract month from filename or data
    let month = reportMonth
    if (!month) {
      // Try to extract from filename (e.g., "report-2024-01.json")
      const monthMatch = filename.match(/(\d{4})[-_](\d{2})/)
      if (monthMatch) {
        month = `${monthMatch[1]}-${monthMatch[2]}`
      }
    }

    // Handle different JSON structures
    let positions = []
    
    if (Array.isArray(data)) {
      positions = data
    } else if (data.positions) {
      positions = data.positions
    } else if (data.portfolio) {
      positions = data.portfolio
    }

    return {
      month: month || new Date().toISOString().slice(0, 7),
      positions: positions.map((pos: any) => ({
        project_name: pos.project_name || pos.name || pos.project,
        symbol: pos.symbol || pos.ticker || '',
        amount: parseFloat(pos.amount || pos.quantity || '0'),
        cost_basis: parseFloat(pos.cost_basis || pos.cost || pos.total_cost || '0'),
        entry_date: pos.entry_date || pos.date || ''
      })),
      total_value: data.total_value,
      notes: data.notes || data.summary
    }
  }

  const parseCSV = (content: string, filename: string): ParsedReport => {
    const lines = content.trim().split('\n')
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
    
    const positions = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const position: any = {}
      
      headers.forEach((header, index) => {
        if (header.includes('name') || header.includes('project')) {
          position.project_name = values[index]
        } else if (header.includes('symbol') || header.includes('ticker')) {
          position.symbol = values[index]
        } else if (header.includes('amount') || header.includes('quantity')) {
          position.amount = parseFloat(values[index] || '0')
        } else if (header.includes('cost') || header.includes('basis')) {
          position.cost_basis = parseFloat(values[index] || '0')
        } else if (header.includes('date')) {
          position.entry_date = values[index]
        }
      })
      
      return position
    })

    return {
      month: reportMonth || new Date().toISOString().slice(0, 7),
      positions: positions.filter(p => p.project_name)
    }
  }

  const parseTextReport = (content: string, filename: string): ParsedReport => {
    // Simple text parser - looks for patterns like "Bitcoin: 0.5 BTC @ $30,000"
    const positions: any[] = []
    const lines = content.split('\n')
    
    lines.forEach(line => {
      // Match patterns like "ProjectName (SYMBOL): amount @ cost"
      const match = line.match(/(.+?)\s*\(([A-Z]+)\):\s*([\d.]+)\s*@\s*\$?([\d,]+)/)
      if (match) {
        positions.push({
          project_name: match[1].trim(),
          symbol: match[2],
          amount: parseFloat(match[3]),
          cost_basis: parseFloat(match[4].replace(/,/g, ''))
        })
      }
    })

    return {
      month: reportMonth || new Date().toISOString().slice(0, 7),
      positions
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setFileContent(content)
      
      try {
        const parsed = parseReportContent(content, file.name)
        setParsedReport(parsed)
        setMessage(`Parsed ${parsed.positions.length} positions from ${file.name}`)
      } catch (error) {
        setMessage(`Error parsing file: ${error}`)
        setParsedReport(null)
      }
    }
    reader.readAsText(file)
  }

  const handleSaveReport = async () => {
    if (!parsedReport) return

    setUploading(true)
    try {
      // Save to database
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_month: parsedReport.month,
          report_data: {
            positions: parsedReport.positions,
            upload_date: new Date().toISOString(),
            original_format: 'uploaded',
            notes: parsedReport.notes
          },
          report_type: 'historical'
        })
      })

      if (!response.ok) throw new Error('Failed to save report')

      setMessage('Report saved successfully!')
      setTimeout(() => {
        router.push(`/report?month=${parsedReport.month}`)
      }, 1500)
    } catch (error) {
      setMessage(`Error saving report: ${error}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Historical Reports</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Report File</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Month (YYYY-MM)
            </label>
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="2024-01"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Report File (JSON, CSV, or Text)
            </label>
            <input
              type="file"
              accept=".json,.csv,.txt"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="text-sm text-gray-600 mb-4">
            <p className="font-semibold mb-2">Supported formats:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>JSON: Array of positions or object with positions array</li>
              <li>CSV: Headers should include name/project, symbol, amount, cost</li>
              <li>Text: Format like "Bitcoin (BTC): 0.5 @ $30,000"</li>
            </ul>
          </div>

          {message && (
            <div className={`p-3 rounded-md mb-4 ${
              message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        {parsedReport && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Parsed Report Preview</h3>
            <p className="text-sm text-gray-600 mb-4">Month: {parsedReport.month}</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Basis</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedReport.positions.map((pos, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pos.project_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pos.symbol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pos.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${pos.cost_basis.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSaveReport}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Saving...' : 'Save Report'}
              </button>
              
              <button
                onClick={() => {
                  setParsedReport(null)
                  setFileContent('')
                  setMessage('')
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {fileContent && !parsedReport && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Raw File Content</h3>
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-xs">
              {fileContent.slice(0, 1000)}
              {fileContent.length > 1000 && '\n...(truncated)'}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}