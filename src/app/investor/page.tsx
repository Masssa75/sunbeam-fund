import InvestorDashboard from '@/components/InvestorDashboardSimplified'
import VersionBadge from '@/components/VersionBadge'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function InvestorPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Sunbeam Fund</h1>
          <p className="text-lg text-gray-600">Portfolio Performance Overview</p>
        </div>
        <ErrorBoundary>
          <InvestorDashboard />
        </ErrorBoundary>
      </div>
      <VersionBadge />
    </main>
  )
}