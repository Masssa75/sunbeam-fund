'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string
  created_at: string
  last_sign_in?: string
  // Investor fields
  account_number?: string
  share_percentage?: number
  initial_investment?: number | null
  status?: 'active' | 'inactive' | 'suspended'
  notes?: string | null
  // Role indicators
  isAdmin?: boolean
  isInvestor?: boolean
}

export default function InvestorsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
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
      // Load all users with their roles
      const response = await fetch('/api/users-with-roles/')
      
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

  const getUserRole = (user: User): string => {
    if (user.isAdmin) return 'Admin'
    if (user.isInvestor || user.account_number) return 'Investor'
    return 'User'
  }

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800'
      case 'Investor':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleConvertToInvestor = (user: User) => {
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

  const handleUpdateInvestor = async (user: User) => {
    const newSharePercentage = prompt('Enter new share percentage:', user.share_percentage?.toString() || '')
    if (!newSharePercentage) return

    try {
      const response = await fetch(`/api/investors/${user.id}`, {
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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Users & Investors</h1>

      {/* All Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sign In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => {
              const role = getUserRole(user)
              const isInvestor = role === 'Investor'
              
              return (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.name || user.email.split('@')[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(role)}`}>
                      {role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isInvestor ? user.account_number : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isInvestor && user.share_percentage ? `${user.share_percentage}%` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isInvestor && user.initial_investment ? `$${user.initial_investment.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isInvestor && user.status ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {role === 'User' && (
                      <button
                        onClick={() => handleConvertToInvestor(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Make Investor
                      </button>
                    )}
                    {role === 'Investor' && (
                      <button
                        onClick={() => handleUpdateInvestor(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    )}
                    {role === 'Admin' && (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-gray-500 text-center py-4">No users found</p>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
          <p className="text-2xl font-bold text-gray-700">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Investors</h3>
          <p className="text-2xl font-bold text-green-700">
            {users.filter(u => getUserRole(u) === 'Investor' && u.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Administrators</h3>
          <p className="text-2xl font-bold text-purple-700">
            {users.filter(u => getUserRole(u) === 'Admin').length}
          </p>
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