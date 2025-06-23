'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginDebugPage() {
  const router = useRouter()
  const [email, setEmail] = useState('marc@minutevideos.com')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[LoginDebug] ${message}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLogs([])
    
    try {
      addLog('Creating Supabase client...')
      const supabase = createBrowserClient(
        'https://gualxudgbmpuhjbumfeh.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
      )
      addLog('Supabase client created')

      // Check current session before login
      addLog('Checking current session...')
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      addLog(`Current session: ${currentSession ? 'Exists' : 'None'}`)

      // Attempt sign in
      addLog(`Attempting sign in for: ${email}`)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        addLog(`Sign in error: ${error.message}`)
        throw error
      }

      addLog('Sign in successful!')
      addLog(`User ID: ${data.user?.id}`)
      addLog(`Email: ${data.user?.email}`)
      addLog(`Session: ${data.session ? 'Created' : 'Not created'}`)

      // Verify session
      addLog('Verifying session...')
      const { data: { session: newSession } } = await supabase.auth.getSession()
      addLog(`New session verified: ${newSession ? 'Yes' : 'No'}`)

      if (newSession) {
        addLog('Session confirmed! Redirecting in 2 seconds...')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        addLog('ERROR: No session after sign in!')
      }

    } catch (err: any) {
      addLog(`ERROR: ${err.message}`)
      console.error('Full error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Login Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
          </form>
        </div>

        <div className="bg-black text-green-400 rounded-lg p-4 font-mono text-sm">
          <h2 className="text-white mb-2">Debug Logs:</h2>
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Click "Test Login" to start.</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className={log.includes('ERROR') ? 'text-red-400' : ''}>
                {log}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>This debug page will show detailed logs of the login process.</p>
          <p>Check the browser console for additional information.</p>
        </div>
      </div>
    </div>
  )
}