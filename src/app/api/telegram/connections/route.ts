import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = ['marc@cyrator.com', 'marc@minutevideos.com'];
    const isAdmin = adminEmails.includes(user.email || '');

    if (!isAdmin) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!adminUser) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    // Get all investor telegram connections
    const { data: connections, error } = await supabase
      .from('investor_telegram')
      .select(`
        *,
        investors (
          name,
          email,
          share_percentage
        )
      `)
      .order('connected_at', { ascending: false });

    if (error) {
      console.error('Error fetching connections:', error);
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
    }

    return NextResponse.json({ connections: connections || [] });

  } catch (error) {
    console.error('Error in connections API:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}