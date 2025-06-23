'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function TestAuthDebug() {
  const [sessionChecked, setSessionChecked] = useState(false)
  const [apiChecked, setApiChecked] = useState(false)
  const [browserSession, setBrowserSession] = useState<any>(null)
  const [apiSession, setApiSession] = useState<any>(null)
  const [error, setError] = useState<string>('')
  
  useEffect(() => {
    // Check browser session
    const checkBrowserSession = async () => {
      try {
        const supabase = createBrowserClient(
          'https://gualxudgbmpuhjbumfeh.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
        )
        
        const { data: { session }, error } = await supabase.auth.getSession()
        setBrowserSession(session)
        setSessionChecked(true)
        
        if (error) {
          setError('Browser session error: ' + error.message)
        }
      } catch (err: any) {
        setError('Browser session exception: ' + err.message)
        setSessionChecked(true)
      }
    }
    
    // Check API session
    const checkApiSession = async () => {
      try {
        const response = await fetch('/api/auth/session/')
        const data = await response.json()
        setApiSession(data)
        setApiChecked(true)
      } catch (err: any) {
        setError(prev => prev + '\nAPI session error: ' + err.message)
        setApiChecked(true)
      }
    }
    
    checkBrowserSession()
    checkApiSession()
  }, [])
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="space-y-4">
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Browser Session Check</h2>
          <p>Status: {sessionChecked ? 'Checked' : 'Checking...'}</p>
          <p>Authenticated: {browserSession ? 'Yes' : 'No'}</p>
          {browserSession && <p>User: {browserSession.user?.email}</p>}
        </div>
        
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">API Session Check</h2>
          <p>Status: {apiChecked ? 'Checked' : 'Checking...'}</p>
          <p>Authenticated: {apiSession?.authenticated ? 'Yes' : 'No'}</p>
          {apiSession?.user && <p>User: {apiSession.user.email}</p>}
        </div>
        
        {error && (
          <div className="border border-red-500 rounded p-4 bg-red-50">
            <h2 className="font-semibold mb-2 text-red-700">Errors</h2>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
          </div>
        )}
        
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Actions</h2>
          <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
            Go to Login
          </a>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}