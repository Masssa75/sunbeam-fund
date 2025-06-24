'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { InvestorWithAuth } from '@/lib/supabase/investor-types'

export default function InvestorsPage() {
  const [users, setUsers] = useState<InvestorWithAuth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<InvestorWithAuth | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    account_number: '',
    share_percentage: '',
    initial_investment: '',
    notes: ''
  })
  const router = useRouter()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      // Try the simple endpoint first
      let response = await fetch('/api/users-simple/')
      
      // Fallback to original endpoint if simple one doesn't exist yet
      if (response.status === 404) {
        response = await fetch('/api/users/')
      }
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to load users')
      }
      
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConvertToInvestor = (user: InvestorWithAuth) => {
    setSelectedUser(user)
    setFormData({
      name: user.name || user.email,
      account_number: '',
      share_percentage: '',
      initial_investment: '',
      notes: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      const response = await fetch('/api/investors/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          email: selectedUser.email,
          name: formData.name,
          account_number: formData.account_number,
          share_percentage: parseFloat(formData.share_percentage),
          initial_investment: formData.initial_investment ? parseFloat(formData.initial_investment) : null,
          notes: formData.notes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create investor')
      }

      setSelectedUser(null)
      await loadUsers()
    } catch (err) {
      alert('Failed to create investor')
      console.error(err)
    }
  }

  const handleUpdateInvestor = async (investor: InvestorWithAuth) => {
    const newSharePercentage = prompt('Enter new share percentage:', investor.share_percentage.toString())
    if (!newSharePercentage) return

    try {
      const response = await fetch(`/api/investors/${investor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          share_percentage: parseFloat(newSharePercentage)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update investor')
      }

      await loadUsers()
    } catch (err) {
      alert('Failed to update investor')
      console.error(err)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  const investors = users.filter(u => u.account_number)
  const nonInvestors = users.filter(u => !u.account_number)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Investors</h1>

      {/* Current Investors */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Current Investors</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial Investment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investors.map(investor => (
                <tr key={investor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{investor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{investor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{investor.account_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{investor.share_percentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {investor.initial_investment ? `$${investor.initial_investment.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      investor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {investor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleUpdateInvestor(investor)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {investors.length === 0 && (
            <p className="text-gray-500 text-center py-4">No investors yet</p>
          )}
        </div>
      </div>

      {/* Registered Users */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Registered Users (Not Investors)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sign In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nonInvestors.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleConvertToInvestor(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Make Investor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {nonInvestors.length === 0 && (
            <p className="text-gray-500 text-center py-4">No non-investor users</p>
          )}
        </div>
      </div>

      {/* Convert to Investor Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Convert to Investor</h3>
            <p className="text-gray-600 mb-4">Converting: {selectedUser.email}</p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., INV001"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Share Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.share_percentage}
                  onChange={(e) => setFormData({...formData, share_percentage: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., 10.5"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Investment (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.initial_investment}
                  onChange={(e) => setFormData({...formData, initial_investment: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., 50000"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Investor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}