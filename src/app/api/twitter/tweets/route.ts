import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { supabaseAdmin } from '@/lib/supabase/client';

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

    // Get tweets
    const { data: tweets, error } = await supabase
      .from('tweet_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching tweets:', error);
      return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 });
    }

    return NextResponse.json({ tweets: tweets || [] });

  } catch (error) {
    console.error('Error in tweets API:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}