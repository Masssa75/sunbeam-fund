import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { supabaseAdmin } from '@/lib/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const { user, isAdmin } = await getServerAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use admin client for data operations
    const supabase = supabaseAdmin;

    // Get monitored projects
    const { data: projects, error } = await supabase
      .from('monitored_projects')
      .select('*')
      .order('project_name');

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects: projects || [] });

  } catch (error) {
    console.error('Error in projects API:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}