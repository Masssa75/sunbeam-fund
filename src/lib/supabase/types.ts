export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      positions: {
        Row: {
          id: string
          project_id: string
          project_name: string
          symbol: string
          amount: number
          cost_basis: number | null
          entry_date: string
          exit_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          project_name: string
          symbol: string
          amount: number
          cost_basis?: number | null
          entry_date: string
          exit_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          project_name?: string
          symbol?: string
          amount?: number
          cost_basis?: number | null
          entry_date?: string
          exit_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_snapshots: {
        Row: {
          id: string
          snapshot_date: string
          positions: Json
          total_value_usd: number
          total_cost_basis: number | null
          performance_metrics: Json | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          snapshot_date: string
          positions: Json
          total_value_usd: number
          total_cost_basis?: number | null
          performance_metrics?: Json | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          snapshot_date?: string
          positions?: Json
          total_value_usd?: number
          total_cost_basis?: number | null
          performance_metrics?: Json | null
          metadata?: Json | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          report_month: string
          report_type: string
          report_data: Json
          ai_summary: string | null
          key_highlights: Json | null
          pdf_url: string | null
          excel_url: string | null
          is_published: boolean
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_month: string
          report_type?: string
          report_data: Json
          ai_summary?: string | null
          key_highlights?: Json | null
          pdf_url?: string | null
          excel_url?: string | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_month?: string
          report_type?: string
          report_data?: Json
          ai_summary?: string | null
          key_highlights?: Json | null
          pdf_url?: string | null
          excel_url?: string | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
        }
      }
      monitored_projects: {
        Row: {
          id: string
          project_id: string
          project_name: string
          symbol: string
          twitter_handle: string | null
          telegram_channel: string | null
          reddit_sub: string | null
          is_active: boolean
          monitoring_config: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          project_name: string
          symbol: string
          twitter_handle?: string | null
          telegram_channel?: string | null
          reddit_sub?: string | null
          is_active?: boolean
          monitoring_config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          project_name?: string
          symbol?: string
          twitter_handle?: string | null
          telegram_channel?: string | null
          reddit_sub?: string | null
          is_active?: boolean
          monitoring_config?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      tweet_analyses: {
        Row: {
          id: string
          project_id: string
          tweet_id: string
          tweet_text: string
          author: string | null
          created_at: string
          importance_score: number
          category: string
          summary: string | null
          url: string | null
          is_ai_analyzed: boolean
          analysis_metadata: Json | null
        }
        Insert: {
          id?: string
          project_id: string
          tweet_id: string
          tweet_text: string
          author?: string | null
          created_at?: string
          importance_score?: number
          category?: string
          summary?: string | null
          url?: string | null
          is_ai_analyzed?: boolean
          analysis_metadata?: Json | null
        }
        Update: {
          id?: string
          project_id?: string
          tweet_id?: string
          tweet_text?: string
          author?: string | null
          created_at?: string
          importance_score?: number
          category?: string
          summary?: string | null
          url?: string | null
          is_ai_analyzed?: boolean
          analysis_metadata?: Json | null
        }
      }
      notifications: {
        Row: {
          id: string
          type: string
          channel: string
          recipient: string | null
          content: string
          metadata: Json | null
          sent_at: string
          status: string
        }
        Insert: {
          id?: string
          type: string
          channel: string
          recipient?: string | null
          content: string
          metadata?: Json | null
          sent_at?: string
          status?: string
        }
        Update: {
          id?: string
          type?: string
          channel?: string
          recipient?: string | null
          content?: string
          metadata?: Json | null
          sent_at?: string
          status?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          action: string
          entity_type: string | null
          entity_id: string | null
          details: Json | null
          performed_at: string
        }
        Insert: {
          id?: string
          action: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json | null
          performed_at?: string
        }
        Update: {
          id?: string
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json | null
          performed_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}