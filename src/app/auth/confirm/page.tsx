'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EmailConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Supabase will handle the email confirmation automatically
    // and redirect here with the result in the URL hash
    const hash = window.location.hash
    
    if (hash && hash.includes('error_description')) {
      setStatus('error')
      const errorMatch = hash.match(/error_description=([^&]+)/)
      if (errorMatch) {
        setMessage(decodeURIComponent(errorMatch[1].replace(/\+/g, ' ')))
      } else {
        setMessage('Email confirmation failed')
      }
    } else if (hash && hash.includes('access_token')) {
      setStatus('success')
      setMessage('Email confirmed successfully! Redirecting to login...')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else {
      setStatus('error')
      setMessage('Invalid confirmation link')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Confirmation
          </h2>
        </div>
        
        <div className="mt-8">
          {status === 'verifying' && (
            <div className="text-gray-600">
              <p>Verifying your email...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}
          
          {status === 'error' && (
            <>
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <p className="text-sm text-red-800">{message}</p>
              </div>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}