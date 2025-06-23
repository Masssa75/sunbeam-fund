import Dashboard from '@/components/Dashboard'
import VersionBadge from '@/components/VersionBadge'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Sunbeam Fund Management</h1>
            <p className="text-lg text-gray-600">Crypto portfolio tracking and reporting system</p>
          </div>
          <div className="flex gap-2">
            <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded">
              Admin View
            </a>
            <a href="/investor" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              Investor View
            </a>
          </div>
        </div>
        <Dashboard />
      </div>
      <VersionBadge />
    </main>
  )
}