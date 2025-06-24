import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/server-auth';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, isAdmin } = await getServerAuth();
    
    if (!user || !isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Create supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          },
        },
      }
    );
    
    // Get all admin users
    const { data: adminUsers } = await supabase
      .from('admin_users')
      .select('*');
    
    // Get all investors
    const { data: investors } = await supabase
      .from('investors')
      .select('*');
    
    // Combine and format users
    const allUsers = [];
    
    // Add admin users
    if (adminUsers) {
      adminUsers.forEach(admin => {
        const isInvestor = investors?.find(inv => inv.id === admin.id);
        allUsers.push({
          id: admin.id,
          email: admin.user_email,
          name: admin.user_email,
          account_number: isInvestor?.account_number || '',
          share_percentage: isInvestor?.share_percentage || 0,
          initial_investment: isInvestor?.initial_investment || null,
          join_date: isInvestor?.join_date || new Date().toISOString().split('T')[0],
          status: isInvestor?.status || 'active',
          phone: isInvestor?.phone || null,
          notes: isInvestor?.notes || null,
          created_at: admin.created_at,
          updated_at: admin.created_at,
          auth_email: admin.user_email,
          last_sign_in: null,
          isAdmin: true
        });
      });
    }
    
    // Add investors that aren't admins
    if (investors) {
      investors.forEach(investor => {
        if (!adminUsers?.find(admin => admin.id === investor.id)) {
          allUsers.push({
            ...investor,
            auth_email: investor.email,
            last_sign_in: null,
            isAdmin: false
          });
        }
      });
    }
    
    return NextResponse.json({ users: allUsers });
  } catch (error: any) {
    console.error('Error in /api/users-simple:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      message: error.message 
    }, { status: 500 });
  }
}