'use client'

import { useState, useEffect } from 'react'
import { storageService } from '@/lib/storage-service'
import { storage as localStorage } from '@/lib/storage'

export default function MigrationBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [localPositionsCount, setLocalPositionsCount] = useState(0)

  useEffect(() => {
    // Check if we have local positions and Supabase is configured
    const checkMigration = async () => {
      const localPositions = localStorage.getPositions()
      const isUsingSupabase = storageService.isUsingSupabase()
      
      if (localPositions.length > 0 && isUsingSupabase) {
        setLocalPositionsCount(localPositions.length)
        setShowBanner(true)
      }
    }
    
    checkMigration()
  }, [])

  const handleMigrate = async () => {
    setMigrating(true)
    try {
      await storageService.migrateToSupabase()
      alert('Migration completed successfully! Your data is now stored in Supabase.')
      setShowBanner(false)
      // Reload the page to refresh the data
      window.location.reload()
    } catch (error) {
      console.error('Migration failed:', error)
      alert('Migration failed. Please check the console for details.')
    } finally {
      setMigrating(false)
    }
  }

  if (!showBanner) return null

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">
            Database Migration Available
          </p>
          <p className="text-sm text-gray-700">
            You have {localPositionsCount} positions in local storage. 
            Migrate them to Supabase for better reliability and multi-device access.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {migrating ? 'Migrating...' : 'Migrate Now'}
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}