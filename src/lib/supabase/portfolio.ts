import { supabase } from './client'
import type { Database } from './types'

type Position = Database['public']['Tables']['positions']['Row']
type PositionInsert = Database['public']['Tables']['positions']['Insert']
type PositionUpdate = Database['public']['Tables']['positions']['Update']

export const portfolioService = {
  // Get all positions
  async getPositions(): Promise<Position[]> {
    console.log('[PortfolioService] getPositions() called')
    
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('entry_date', { ascending: false })

      if (error) {
        console.error('[PortfolioService] Error fetching positions:', error)
        console.error('[PortfolioService] Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          status: (error as any).status,
          statusText: (error as any).statusText
        })
        
        // Check for common issues
        if (error.message?.includes('fetch')) {
          console.error('[PortfolioService] Network/CORS error - cannot reach Supabase')
        }
        if (error.code === 'PGRST301') {
          console.error('[PortfolioService] Authentication error - check RLS policies')
        }
        
        throw error
      }

      console.log('[PortfolioService] Successfully fetched positions:', data?.length || 0)
      return data || []
    } catch (err) {
      console.error('[PortfolioService] Caught error in getPositions:', err)
      throw err
    }
  },

  // Get active positions (no exit date)
  async getActivePositions(): Promise<Position[]> {
    console.log('[PortfolioService] getActivePositions() called')
    
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