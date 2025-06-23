'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary] Caught error:', error)
    return { 
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Error details:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorBoundary: errorInfo.digest
    })
    
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600">The application encountered an unexpected error</p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-red-800 mb-2">Error Message:</h2>
              <p className="text-sm text-red-700 font-mono">
                {this.state.error?.toString() || 'Unknown error'}
              </p>
            </div>

            <details className="mb-6">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Show technical details
              </summary>
              <div className="mt-4 bg-gray-100 rounded p-4 overflow-x-auto">
                <pre className="text-xs">
{`Environment: ${process.env.NODE_ENV}
Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}
Has Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}

Error Stack:
${this.state.error?.stack || 'No stack trace available'}

Component Stack:
${this.state.errorInfo?.componentStack || 'No component stack available'}`}
                </pre>
              </div>
            </details>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary