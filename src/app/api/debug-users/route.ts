import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerAuth } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, isAdmin } = await getServerAuth();
    
    if (!user || !isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Create admin client with hardcoded values
    const supabaseAdmin = createClient(
      'https://gualxudgbmpuhjbumfeh.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4'
    );
    
    // Try to list users
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to list users',
        details: error.message,
        hasServiceKey: true,
        hasUrl: true
      });
    }
    
    // Get investors
    const { data: investors } = await supabaseAdmin
      .from('investors')
      .select('*');
    
    return NextResponse.json({ 
      success: true,
      userCount: users?.length || 0,
      investorCount: investors?.length || 0,
      users: users?.map(u => ({
        id: u.id,
        email: u.email,
        created: u.created_at
      })),
      investors: investors?.map(i => ({
        id: i.id,
        email: i.email,
        name: i.name,
        account_number: i.account_number
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Exception occurred',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}