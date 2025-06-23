// Local storage utilities for portfolio persistence
// This is a temporary solution until Supabase is set up

export interface Position {
  id: string
  project_id: string
  project_name: string
  symbol: string
  amount: number
  cost_basis: number
  entry_date: string
  exit_date?: string
  notes?: string
}

const STORAGE_KEY = 'sunbeam_portfolio_positions'

export const storage = {
  getPositions: (): Position[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading positions:', error)
      return []
    }
  },

  savePositions: (positions: Position[]) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
    } catch (error) {
      console.error('Error saving positions:', error)
    }
  },

  clearPositions: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }
}