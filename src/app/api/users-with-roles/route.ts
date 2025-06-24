import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, isAdmin } = await getServerAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use service role to get all users
    const supabase = createClient(
      'https://gualxudgbmpuhjbumfeh.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get all users from auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching users:', authError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get all investors
    const { data: investors, error: investorsError } = await supabase
      .from('investors')
      .select('*');

    if (investorsError) {
      console.error('Error fetching investors:', investorsError);
      return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 });
    }

    // Get all admin users (if admin_users table exists)
    const { data: adminUsers } = await supabase
      .from('admin_users')
      .select('id');

    const adminUserIds = new Set(adminUsers?.map(a => a.id) || []);
    const investorMap = new Map(investors?.map(inv => [inv.id, inv]) || []);

    // Hardcoded admin emails
    const hardcodedAdmins = ['marc@cyrator.com', 'marc@minutevideos.com'];

    // Merge user data with roles
    const usersWithRoles = users.map(user => {
      const investor = investorMap.get(user.id);
      const isAdminUser = hardcodedAdmins.includes(user.email || '') || adminUserIds.has(user.id);
      
      return {
        id: user.id,
        email: user.email || '',
        name: investor?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown',
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
        // Investor fields
        account_number: investor?.account_number,
        share_percentage: investor?.share_percentage,
        initial_investment: investor?.initial_investment,
        status: investor?.status,
        notes: investor?.notes,
        // Role indicators
        isAdmin: isAdminUser,
        isInvestor: !!investor
      };
    });

    // Sort: Admins first, then Investors, then Users
    usersWithRoles.sort((a, b) => {
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      if (a.isInvestor && !b.isInvestor) return -1;
      if (!a.isInvestor && b.isInvestor) return 1;
      return a.email.localeCompare(b.email);
    });

    return NextResponse.json({ users: usersWithRoles });
  } catch (error) {
    console.error('Error in GET /api/users-with-roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}