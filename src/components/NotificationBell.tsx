'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface RecentAlert {
  id: string
  project_name: string
  importance_score: number
  summary: string
  created_at: string
}

interface TelegramConnection {
  is_connected: boolean
  telegram_username?: string
}

export default function NotificationBell() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([])
  const [telegramConnection, setTelegramConnection] = useState<TelegramConnection>({ is_connected: false })
  const [loading, setLoading] = useState(true)
  const [connectionToken, setConnectionToken] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Click outside handler
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [dropdownOpen])

  useEffect(() => {
    loadNotificationData()
  }, [])

  const loadNotificationData = async () => {
    try {
      // Load recent high-importance alerts
      const alertsResponse = await fetch('/api/notifications/recent-alerts')
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setRecentAlerts(alertsData.alerts || [])
      }

      // Check Telegram connection status
      const connectionResponse = await fetch('/api/notifications/connection-status')
      if (connectionResponse.ok) {
        const connectionData = await connectionResponse.json()
        setTelegramConnection(connectionData)
        
        // If not connected, generate a connection token
        if (!connectionData.is_connected) {
          const tokenResponse = await fetch('/api/telegram/generate-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json()
            setConnectionToken(tokenData.token)
          }
        }
      }
    } catch (error) {
      console.error('Error loading notification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    }
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`
    }
    const days = Math.floor(hours / 24)
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-red-500'
    if (score >= 7) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const hasNewAlerts = recentAlerts.length > 0 && !telegramConnection.is_connected

  const telegramLink = connectionToken 
    ? `https://t.me/sunbeam_capital_bot?start=${connectionToken}`
    : 'https://t.me/sunbeam_capital_bot'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button 
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg relative"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Red dot for new notifications */}
        {hasNewAlerts && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>
      
      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {recentAlerts.length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  {recentAlerts.length} new
                </span>
              )}
            </div>
            {telegramConnection.is_connected && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Connected to Telegram</span>
              </div>
            )}
          </div>
          
          {/* Recent Alerts */}
          {recentAlerts.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {recentAlerts.map(alert => (
                <div key={alert.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 ${getScoreColor(alert.importance_score)} rounded-full mt-1.5`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.project_name} Alert (Score: {alert.importance_score}/10)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.summary}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(alert.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              {loading ? 'Loading...' : 'No recent alerts'}
            </div>
          )}
          
          {/* Connect CTA or Settings */}
          {!telegramConnection.is_connected ? (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-600 mb-3">Get instant alerts on Telegram</p>
              <button
                onClick={async () => {
                  if (!connectionToken) {
                    // Generate token if not already generated
                    try {
                      const tokenResponse = await fetch('/api/telegram/generate-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      })
                      if (tokenResponse.ok) {
                        const tokenData = await tokenResponse.json()
                        const link = `https://t.me/sunbeam_capital_bot?start=${tokenData.token}`
                        window.open(link, '_blank')
                      }
                    } catch (error) {
                      alert('Failed to generate connection link. Please try again.')
                    }
                  } else {
                    // Token already exists, use it
                    window.open(telegramLink, '_blank')
                  }
                }}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors text-sm font-medium disabled:bg-gray-400"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
                </svg>
                Enable Push Notifications
              </button>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notification Settings</span>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => window.location.href = '/account/notifications'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Connected State Options */}
          {telegramConnection.is_connected && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
                  </svg>
                  <span className="text-sm text-gray-700">
                    {telegramConnection.telegram_username ? `@${telegramConnection.telegram_username}` : 'Connected'}
                  </span>
                </div>
                <Link 
                  href="/admin/twitter-monitoring"
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  View all alerts →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}