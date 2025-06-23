import Dashboard from '@/components/Dashboard'
import VersionBadge from '@/components/VersionBadge'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Sunbeam Fund Management</h1>
        <p className="text-lg mb-8 text-gray-600">Crypto portfolio tracking and reporting system</p>
        <Dashboard />
      </div>
      <VersionBadge />
    </main>
  )
}