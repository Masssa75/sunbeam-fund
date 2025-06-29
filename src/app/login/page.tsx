'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/supabase/auth'

type AuthMode = 'signin' | 'signup' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if user is already authenticated and set mode from URL
  useEffect(() => {
    // Set mode from URL parameter
    const urlMode = searchParams.get('mode')
    if (urlMode === 'signup' || urlMode === 'forgot') {
      setMode(urlMode as AuthMode)
    }
    
    const checkAuth = async () => {
      try {
        const session = await auth.getSession()
        if (session) {
          // User is already logged in, redirect to home
          router.push('/')
        }
      } catch (err) {
        // Ignore errors, just show login page
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setError('Request timed out. Please try again.')
      setLoading(false)
    }, 15000) // 15 second timeout

    try {
      if (mode === 'signin') {
        let result;
        try {
          // Clear any existing session first to ensure clean login
          try {
            await auth.signOut()
          } catch (signOutError) {
            // Ignore signout errors, proceed with login
          }
          
          // Try client-side auth first
          result = await auth.signIn(email, password)
        } catch (signInError: any) {
          // Fallback to API endpoint
          const apiResponse = await fetch('/api/auth/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          
          const apiData = await apiResponse.json()
          if (!apiData.success) {
            throw new Error(apiData.error || 'Login failed')
          }
          
          // Force a page reload to pick up the session
          window.location.href = '/'
          return
        }
        
        // Check if we actually got a session
        let session;
        try {
          session = await auth.getSession()
        } catch (sessionError: any) {
          throw new Error('Failed to verify session after sign in. Please try again.')
        }
        
        if (!session) {
          throw new Error('Sign in succeeded but no session was created. Please try again.')
        }
        clearTimeout(timeoutId) // Clear the timeout
        setLoading(false) // Stop the loading state
        
        // Use router.push for client-side navigation
        router.push('/')
        // Also refresh the page after a short delay to ensure session is loaded
        setTimeout(() => {
          router.refresh()
        }, 500)
      } else if (mode === 'signup') {
        const data = await auth.signUp(email, password)
        if (data?.user?.identities?.length === 0) {
          setError('This email is already registered. Please sign in.')
          setMode('signin')
        } else {
          setMessage('Check your email for the confirmation link!')
        }
        clearTimeout(timeoutId)
        setLoading(false)
      } else if (mode === 'forgot') {
        const { error } = await auth.resetPassword(email)
        if (error) throw error
        setMessage('Check your email for the password reset link!')
        clearTimeout(timeoutId)
        setLoading(false)
      }
    } catch (err: any) {
      clearTimeout(timeoutId) // Clear timeout on error
      
      // Provide helpful error messages
      let errorMessage = err.message || 'An error occurred'
      
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.'
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.'
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.'
      }
      
      setError(errorMessage)
      setLoading(false)
    }
  }

  // Show loading while checking auth status
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'signin' && 'Sign in to Sunbeam Capital'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'signin' && (
              <>
                Or{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  create a new account
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <>
                Remember your password?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            {mode !== 'forgot' && (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            )}
          </div>

          {mode === 'signin' && (
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (
                <>
                  {mode === 'signin' && 'Sign in'}
                  {mode === 'signup' && 'Sign up'}
                  {mode === 'forgot' && 'Send reset email'}
                </>
              )}
            </button>
          </div>

          {mode === 'signup' && (
            <p className="mt-2 text-center text-xs text-gray-600">
              By signing up, you agree to our terms and privacy policy.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}