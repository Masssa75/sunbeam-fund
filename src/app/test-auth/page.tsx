'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestAuthPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [positions, setPositions] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const testAPI = async () => {
    setError(null)
    try {
      const response = await fetch('/api/positions')
      if (response.ok) {
        const data = await response.json()
        setPositions(data)
      } else {
        setError(`API error: ${response.status}`)
      }
    } catch (err) {
      setError(`Fetch error: ${err}`)
    }
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'marc@minutevideos.com',
      password: '123456'
    })
    if (error) setError(error.message)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setPositions([])
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="mb-4">
        <p>Session: {session ? `Logged in as ${session.user.email}` : 'Not logged in'}</p>
      </div>

      <div className="flex gap-2 mb-4">
        {!session ? (
          <button onClick={signIn} className="px-4 py-2 bg-blue-500 text-white rounded">
            Sign In (marc@minutevideos.com)
          </button>
        ) : (
          <button onClick={signOut} className="px-4 py-2 bg-red-500 text-white rounded">
            Sign Out
          </button>
        )}
        <button onClick={testAPI} className="px-4 py-2 bg-green-500 text-white rounded">
          Test API
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">API Response:</h2>
        {positions.length > 0 ? (
          <>
            <p>Found {positions.length} positions:</p>
            {positions.map((pos, i) => (
              <div key={i}>{pos.project_name} - {pos.amount} {pos.symbol}</div>
            ))}
          </>
        ) : (
          <p>No positions returned (empty array)</p>
        )}
      </div>
    </div>
  )
}