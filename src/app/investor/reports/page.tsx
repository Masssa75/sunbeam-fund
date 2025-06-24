'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InvestorReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session/')
      const data = await response.json()
      
      if (!data.authenticated) {
        router.push('/login')
        return
      }

      // For now, just show placeholder
      setReports([])
      setLoading(false)
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Reports</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">No reports available yet</p>
            <p className="text-sm">Your monthly reports will appear here once they are generated.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800">Coming Soon</h3>
        <div className="mt-2 text-sm text-blue-700">
          <ul className="list-disc list-inside space-y-1">
            <li>Monthly performance reports</li>
            <li>Portfolio allocation breakdowns</li>
            <li>Historical performance charts</li>
            <li>Downloadable PDF statements</li>
          </ul>
        </div>
      </div>
    </div>
  )
}