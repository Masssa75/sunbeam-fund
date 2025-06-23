import InvestorDashboard from '@/components/InvestorDashboard'
import VersionBadge from '@/components/VersionBadge'
import Header from '@/components/Header'

export default function InvestorPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Sunbeam Fund</h1>
          <p className="text-lg mb-8 text-gray-600">Portfolio Performance Overview</p>
          <InvestorDashboard />
        </div>
        <VersionBadge />
      </main>
    </>
  )
}