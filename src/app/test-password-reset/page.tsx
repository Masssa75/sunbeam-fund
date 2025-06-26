'use client'

import { useState } from 'react'
import { auth } from '@/lib/supabase/auth'

export default function TestPasswordReset() {
  const [email, setEmail] = useState('marc@minutevideos.com')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  
  const testDefaultReset = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      const { data, error } = await auth.resetPassword(email)
      
      if (error) {
        setError(error.message)
      } else {
        setResult({
          method: 'Default Supabase',
          message: 'Check your email (including spam folder)',
          data
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const testCustomReset = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      const { data, error } = await auth.customResetPassword(email)
      
      if (error) {
        setError(error.message)
      } else {
        setResult({
          method: 'Custom API',
          message: data.message,
          resetLink: data.resetLink
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Password Reset</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Email Configuration Status</h2>
          <div className="space-y-2 text-sm">
            <p>✅ Password reset functionality is implemented</p>
            <p>⚠️ Using Supabase default email service (limited to 3/hour)</p>
            <p>📧 Emails may go to spam folder</p>
            <p>🔧 Custom SMTP not configured</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Test Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter email address"
            />
          </div>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={testDefaultReset}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Test Default Reset
            </button>
            <button
              onClick={testCustomReset}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Test Custom Reset
            </button>
          </div>
          
          {loading && (
            <div className="text-center py-4">
              <p className="text-gray-500">Sending reset email...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                {result.method} - Success!
              </h3>
              <p className="text-green-700 text-sm mb-2">{result.message}</p>
              
              {result.resetLink && (
                <div className="mt-4 p-3 bg-white rounded border border-green-300">
                  <p className="text-sm font-medium mb-1">Reset Link (Dev Only):</p>
                  <p className="text-xs break-all text-gray-600">{result.resetLink}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.resetLink)}
                    className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Quick Fix Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Check spam/junk folder for reset emails</li>
            <li>Add noreply@mail.app.supabase.io to contacts</li>
            <li>Configure custom SMTP in Supabase dashboard for reliable delivery</li>
            <li>See EMAIL-SETUP-GUIDE.md for detailed instructions</li>
          </ol>
        </div>
      </div>
    </div>
  )
}