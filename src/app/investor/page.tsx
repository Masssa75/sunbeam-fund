'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import InvestorDashboard from '@/components/InvestorDashboardEnhanced'
import VersionBadge from '@/components/VersionBadge'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function InvestorPage() {
  const searchParams = useSearchParams()
  const viewAsId = searchParams.get('viewAs')
  const [investorName, setInvestorName] = useState<string | null>(null)
  
  useEffect(() => {
    if (viewAsId) {
      // Fetch investor info to get their name
      fetch(`/api/investor-info?id=${viewAsId}`)
        .then(res => res.json())
        .then(data => {
          if (data.investor) {
            setInvestorName(data.investor.name || data.investor.email);
          }
        })
        .catch(err => console.error('Failed to fetch investor info:', err));
    }
  }, [viewAsId]);
  
  return (
    <>
      {viewAsId && (
        <div className="fixed top-4 right-4 z-50">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm shadow-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Viewing as {investorName || 'investor'}
          </div>
        </div>
      )}
      <ErrorBoundary>
        <InvestorDashboard viewAsId={viewAsId} />
      </ErrorBoundary>
      <VersionBadge />
    </>
  )
}