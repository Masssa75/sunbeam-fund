import Link from 'next/link'

export default function NavigationSimple() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-semibold text-gray-900 hover:text-gray-700">
                Sunbeam Fund
              </Link>
            </div>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Portfolio
              </Link>
              <Link
                href="/admin/investors"
                className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Manage Investors
              </Link>
              <Link
                href="/report"
                className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Reports
              </Link>
              <Link
                href="/investor"
                className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Preview Investor View
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}