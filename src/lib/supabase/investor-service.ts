import { createClient } from '@supabase/supabase-js';
import type { Investor, InvestorWithAuth } from './investor-types';
import type { Database } from './types';

export class InvestorService {
  private supabase = createClient<Database>(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.8V_9hWPPzQqWfMgGqnCXlzZNbZcAdowOk9kHWPNJb0s',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  async getAllInvestors(): Promise<Investor[]> {
    const { data, error } = await this.supabase
      .from('investors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching investors:', error);
      return [];
    }

    return data || [];
  }

  async getInvestorById(id: string): Promise<Investor | null> {
    const { data, error } = await this.supabase
      .from('investors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching investor:', error);
      return null;
    }

    return data;
  }

  async createInvestor(investor: Omit<Investor, 'created_at' | 'updated_at' | 'join_date' | 'status'>): Promise<Investor | null> {
    // Add default values that are handled by the database
    const investorData = {
      ...investor,
      // join_date and status have defaults in the database
      // created_at and updated_at are auto-generated
    };
    
    const { data, error } = await this.supabase
      .from('investors')
      .insert(investorData)
      .select()
      .single();

    if (error) {
      console.error('Error creating investor:', error);
      throw error;
    }

    return data;
  }

  async updateInvestor(id: string, updates: Partial<Investor>): Promise<Investor | null> {
    const { data, error } = await this.supabase
      .from('investors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating investor:', error);
      throw error;
    }

    return data;
  }

  async deleteInvestor(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('investors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting investor:', error);
      return false;
    }

    return true;
  }

  async getAllUsers(): Promise<InvestorWithAuth[]> {
    // Get all users from auth system
    const { data: { users }, error } = await this.supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    // Get all existing investors
    const investors = await this.getAllInvestors();
    const investorIds = new Set(investors.map(inv => inv.id));

    // Map users to include investor status
    return users.map(user => {
      const existingInvestor = investors.find(inv => inv.id === user.id);
      
      if (existingInvestor) {
        return {
          ...existingInvestor,
          auth_email: user.email,
          last_sign_in: user.last_sign_in_at
        };
      }

      // Return non-investor users with minimal data
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email || 'Unknown',
        account_number: '',
        share_percentage: 0,
        initial_investment: null,
        join_date: new Date().toISOString().split('T')[0],
        status: 'inactive' as const,
        phone: null,
        notes: null,
        created_at: user.created_at,
        updated_at: user.created_at,
        auth_email: user.email,
        last_sign_in: user.last_sign_in_at
      };
    });
  }

  async isUserInvestor(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('investors')
      .select('id')
      .eq('id', userId)
      .eq('status', 'active')
      .single();

    return !error && !!data;
  }

  async logAccess(investorId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.supabase
      .from('investor_access_logs')
      .insert({
        investor_id: investorId,
        ip_address: ipAddress,
        user_agent: userAgent
      });
  }
}

export const investorService = new InvestorService();