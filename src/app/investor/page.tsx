import InvestorDashboard from '@/components/InvestorDashboard'
import VersionBadge from '@/components/VersionBadge'
import Link from 'next/link'

export default function InvestorPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Sunbeam Fund</h1>
            <p className="text-lg text-gray-600">Portfolio Performance Overview</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              Admin View
            </Link>
            <Link href="/investor" className="px-4 py-2 bg-blue-500 text-white rounded">
              Investor View
            </Link>
          </div>
        </div>
        <InvestorDashboard />
      </div>
      <VersionBadge />
    </main>
  )
}