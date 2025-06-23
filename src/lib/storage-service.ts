import { storage as localStorage } from './storage'
import { portfolioService } from './supabase/portfolio'
import type { Database } from './supabase/types'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://midojobnawatvxhmhmoh.supabase.co' // Not using porta's credentials
  )
}

type Position = Database['public']['Tables']['positions']['Row']
type PositionInsert = Database['public']['Tables']['positions']['Insert']

// Unified storage interface
export const storageService = {
  async getPositions(): Promise<Position[]> {
    if (isSupabaseConfigured()) {
      try {
        return await portfolioService.getPositions()
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error)
        // Fall back to localStorage
        const localPositions = localStorage.getPositions()
        return localPositions.map(pos => ({
          id: pos.id,
          project_id: pos.project_id,
          project_name: pos.project_name,
          symbol: pos.symbol,
          amount: pos.amount,
          cost_basis: pos.cost_basis,
          entry_date: pos.entry_date,
          exit_date: pos.exit_date || null,
          notes: pos.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      }
    } else {
      // Use localStorage
      const localPositions = localStorage.getPositions()
      return localPositions.map(pos => ({
        id: pos.id,
        project_id: pos.project_id,
        project_name: pos.project_name,
        symbol: pos.symbol,
        amount: pos.amount,
        cost_basis: pos.cost_basis,
        entry_date: pos.entry_date,
        exit_date: pos.exit_date || null,
        notes: pos.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
    }
  },

  async addPosition(position: PositionInsert): Promise<Position> {
    if (isSupabaseConfigured()) {
      try {
        return await portfolioService.addPosition(position)
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error)
        // Fall back to localStorage
        const newPosition = {
          id: crypto.randomUUID(),
          project_id: position.project_id,
          project_name: position.project_name,
          symbol: position.symbol,
          amount: position.amount,
          cost_basis: position.cost_basis || 0,
          entry_date: position.entry_date,
          exit_date: position.exit_date,
          notes: position.notes
        }
        const positions = localStorage.getPositions()
        positions.push(newPosition)
        localStorage.savePositions(positions)
        return {
          ...newPosition,
          cost_basis: newPosition.cost_basis,
          exit_date: newPosition.exit_date || null,
          notes: newPosition.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    } else {
      // Use localStorage
      const newPosition = {
        id: crypto.randomUUID(),
        project_id: position.project_id,
        project_name: position.project_name,
        symbol: position.symbol,
        amount: position.amount,
        cost_basis: position.cost_basis || 0,
        entry_date: position.entry_date,
        exit_date: position.exit_date,
        notes: position.notes
      }
      const positions = localStorage.getPositions()
      positions.push(newPosition)
      localStorage.savePositions(positions)
      return {
        ...newPosition,
        cost_basis: newPosition.cost_basis,
        exit_date: newPosition.exit_date || null,
        notes: newPosition.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  },

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
    if (isSupabaseConfigured()) {
      try {
        return await portfolioService.updatePosition(id, updates)
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error)
        // Fall back to localStorage
        const positions = localStorage.getPositions()
        const index = positions.findIndex(p => p.id === id)
        if (index !== -1) {
          positions[index] = { ...positions[index], ...updates }
          localStorage.savePositions(positions)
          return {
            ...positions[index],
            cost_basis: positions[index].cost_basis,
            exit_date: positions[index].exit_date || null,
            notes: positions[index].notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
        throw new Error('Position not found')
      }
    } else {
      // Use localStorage
      const positions = localStorage.getPositions()
      const index = positions.findIndex(p => p.id === id)
      if (index !== -1) {
        positions[index] = { ...positions[index], ...updates }
        localStorage.savePositions(positions)
        return {
          ...positions[index],
          cost_basis: positions[index].cost_basis,
          exit_date: positions[index].exit_date || null,
          notes: positions[index].notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      throw new Error('Position not found')
    }
  },

  async deletePosition(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await portfolioService.deletePosition(id)
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error)
        // Fall back to localStorage
        const positions = localStorage.getPositions()
        const filtered = positions.filter(p => p.id !== id)
        localStorage.savePositions(filtered)
      }
    } else {
      // Use localStorage
      const positions = localStorage.getPositions()
      const filtered = positions.filter(p => p.id !== id)
      localStorage.savePositions(filtered)
    }
  },

  // One-time migration from localStorage to Supabase
  async migrateToSupabase(): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured')
    }

    const localPositions = localStorage.getPositions()
    if (localPositions.length === 0) {
      console.log('No positions to migrate')
      return
    }

    await portfolioService.migrateFromLocalStorage(localPositions)
    
    // Clear localStorage after successful migration
    localStorage.clearPositions()
    console.log('Migration completed and localStorage cleared')
  },

  // Check if using Supabase
  isUsingSupabase(): boolean {
    return isSupabaseConfigured()
  }
}