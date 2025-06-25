import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { supabaseAdmin } from '@/lib/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Twitter tweets API called');
    
    const { user, isAdmin } = await getServerAuth();
    console.log('Auth result:', { hasUser: !!user, isAdmin });
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use admin client for data operations
    const supabase = supabaseAdmin;
    console.log('Supabase admin client created');

    // Get tweets
    console.log('Querying tweet_analyses table...');
    const { data: tweets, error } = await supabase
      .from('tweet_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    console.log('Query result:', { tweetsCount: tweets?.length, hasError: !!error });
    
    if (error) {
      console.error('Error fetching tweets:', error);
      return NextResponse.json({ error: 'Failed to fetch tweets', details: error }, { status: 500 });
    }

    console.log('✅ Returning tweets successfully');
    return NextResponse.json({ tweets: tweets || [] });

  } catch (error) {
    console.error('Error in tweets API:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}