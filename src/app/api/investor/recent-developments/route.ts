import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Recent developments API called');
    
    const { user } = await getServerAuth();
    console.log('Auth result:', { hasUser: !!user });
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client for data operations
    const supabase = supabaseAdmin;
    console.log('Supabase admin client created');

    // Get recent important tweets with project information
    console.log('Querying tweet_analyses with monitored_projects join...');
    const { data: tweets, error } = await supabase
      .from('tweet_analyses')
      .select(`
        id,
        project_id,
        tweet_text,
        summary,
        importance_score,
        category,
        created_at,
        monitored_projects (
          project_name,
          symbol
        )
      `)
      .gte('importance_score', 7)  // Only show important tweets
      .order('created_at', { ascending: false })
      .limit(10);

    console.log('Query result:', { tweetsCount: tweets?.length, hasError: !!error });
    
    if (error) {
      console.error('Error fetching recent developments:', error);
      return NextResponse.json({ error: 'Failed to fetch recent developments', details: error }, { status: 500 });
    }

    // Transform the data to match the component's expected format
    const formattedTweets = (tweets || []).map((tweet: any) => ({
      id: tweet.id,
      project_id: tweet.project_id,
      project_name: tweet.monitored_projects?.project_name || 'Unknown Project',
      symbol: tweet.monitored_projects?.symbol || '',
      tweet_text: tweet.tweet_text,
      summary: tweet.summary,
      importance_score: tweet.importance_score,
      category: tweet.category,
      created_at: tweet.created_at
    }));

    console.log('✅ Returning recent developments successfully');
    return NextResponse.json({ tweets: formattedTweets });

  } catch (error) {
    console.error('Error in recent developments API:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}