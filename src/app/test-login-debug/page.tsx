'use client'

import { useState } from 'react'

export default function TestLoginDebug() {
  const [email, setEmail] = useState('marc@minutevideos.com')
  const [password, setPassword] = useState('123456')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // Test via API route
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      setResult({
        api: data,
        status: response.status
      })
      
      // Also test client-side
      const { createBrowserClient } = await import('@supabase/ssr')
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
      )
      
      const { data: clientData, error: clientError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      setResult(prev => ({
        ...prev,
        client: {
          success: !clientError,
          error: clientError?.message,
          user: clientData?.user?.email,
          session: !!clientData?.session
        }
      }))
      
    } catch (error: any) {
      setResult({
        error: error.message,
        stack: error.stack
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Login Debug Test</h1>
        
        <div className="bg-white p-6 rounded shadow mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
        </div>
        
        {result && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Results:</h2>
            <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p>Environment:</p>
          <ul className="list-disc list-inside">
            <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}