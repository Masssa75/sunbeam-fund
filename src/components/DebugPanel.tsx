'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function DebugPanel() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // Test 1: Check environment
      const envCheck = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hardcodedUrl: 'https://gualxudgbmpuhjbumfeh.supabase.co'
      }
      
      console.log('[Debug] Environment check:', envCheck)
      
      // Test 2: Create client directly
      const testClient = createClient(
        'https://gualxudgbmpuhjbumfeh.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
      )
      
      console.log('[Debug] Testing simple query...')
      
      // Test 3: Simple query with timeout
      const { data, error, count } = await testClient
        .from('positions')
        .select('id', { count: 'exact' })
        .limit(1)
        .single()
      
      console.log('[Debug] Query result:', { data, error, count })
      
      setResult({
        success: !error,
        environment: envCheck,
        queryResult: { data, error: error?.message, count },
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error('[Debug] Exception:', err)
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md">
      <h3 className="font-bold mb-2">Debug Panel</h3>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 mb-4"
      >
        {loading ? 'Testing...' : 'Test Supabase Connection'}
      </button>
      
      {result && (
        <div className="text-xs">
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}