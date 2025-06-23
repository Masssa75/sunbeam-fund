import { createSupabaseBrowser } from './client-browser'
import type { Database } from './types'

type Position = Database['public']['Tables']['positions']['Row']
type PositionInsert = Database['public']['Tables']['positions']['Insert']
type PositionUpdate = Database['public']['Tables']['positions']['Update']

export const portfolioService = {
  // Get Supabase client
  getClient() {
    if (typeof window !== 'undefined') {
      return createSupabaseBrowser()
    }
    // For server-side, we'll create a new instance each time
    // This is not ideal but works for now
    const { createClient } = require('@supabase/supabase-js')
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
    )
  },
  // Get all positions
  async getPositions(): Promise<Position[]> {
    console.log('[PortfolioService] getPositions() called')
    
    try {
      const supabase = this.getClient()
      
      // Check if user is authenticated first
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError) {
        console.error('[PortfolioService] Auth error:', authError)
        return []
      }
      
      if (!session) {
        console.log('[PortfolioService] No session - returning empty array')
        return []
      }
      
      console.log('[PortfolioService] Authenticated as:', session.user.email)
      
      // Fetch positions with authenticated session
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('entry_date', { ascending: false })

      if (error) {
        console.error('[PortfolioService] Error fetching positions:', error)
        // Return empty array instead of throwing to prevent UI errors
        return []
      }

      console.log('[PortfolioService] Successfully fetched positions:', data?.length || 0)
      return data || []
    } catch (err) {
      console.error('[PortfolioService] Caught error in getPositions:', err)
      // Return empty array on any error
      return []
    }
  },

  // Get active positions (no exit date)
  async getActivePositions(): Promise<Position[]> {
    console.log('[PortfolioService] getActivePositions() called')
    
    const supabase = this.getClient()
    
    // Check authentication first
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      console.log('[PortfolioService] No session - returning empty array')
      return []
    }
    
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .is('exit_date', null)
        .order('entry_date', { ascending: false })

      if (error) {
        console.error('[PortfolioService] Error fetching active positions:', error)
        console.error('[PortfolioService] Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('[PortfolioService] Successfully fetched active positions:', data?.length || 0)
      return data || []
    } catch (err) {
      console.error('[PortfolioService] Caught error in getActivePositions:', err)
      throw err
    }
  },

  // Add new position
  async addPosition(position: PositionInsert): Promise<Position> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('positions')
      .insert(position)
      .select()
      .single()

    if (error) {
      console.error('Error adding position:', error)
      throw error
    }

    // Log to audit
    await this.logAudit('position_added', 'positions', data.id, {
      position: data
    })

    return data
  },

  // Update position
  async updatePosition(id: string, updates: PositionUpdate): Promise<Position> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('positions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating position:', error)
      throw error
    }

    // Log to audit
    await this.logAudit('position_updated', 'positions', data.id, {
      updates,
      position: data
    })

    return data
  },

  // Delete position
  async deletePosition(id: string): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('positions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting position:', error)
      throw error
    }

    // Log to audit
    await this.logAudit('position_deleted', 'positions', id, {})
  },

  // Create portfolio snapshot
  async createSnapshot(date: string): Promise<void> {
    const positions = await this.getActivePositions()
    
    // Calculate total values (will be enhanced with price data)
    const totalValue = positions.reduce((sum, pos) => sum + (pos.cost_basis || 0), 0)
    const totalCostBasis = positions.reduce((sum, pos) => sum + (pos.cost_basis || 0), 0)

    const snapshot = {
      snapshot_date: date,
      positions: positions,
      total_value_usd: totalValue,
      total_cost_basis: totalCostBasis,
      performance_metrics: {
        roi: 0, // Will be calculated with price data
        positions_count: positions.length
      }
    }

    const supabase = this.getClient()
    const { error } = await supabase
      .from('portfolio_snapshots')
      .insert(snapshot)

    if (error) {
      console.error('Error creating snapshot:', error)
      throw error
    }
  },

  // Get snapshots
  async getSnapshots(limit = 12): Promise<any[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .order('snapshot_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching snapshots:', error)
      throw error
    }

    return data || []
  },

  // Log audit entry
  async logAudit(action: string, entityType: string | null, entityId: string | null, details: any): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('audit_log')
      .insert({
        action,
        entity_type: entityType,
        entity_id: entityId,
        details
      })

    if (error) {
      console.error('Error logging audit:', error)
      // Don't throw - audit logging shouldn't break operations
    }
  }
}