import type { Database } from './supabase/types'

export type Position = Database['public']['Tables']['positions']['Row'] & {
  current_price?: number
  current_value?: number
  profit_loss?: number
  profit_loss_percent?: number
}