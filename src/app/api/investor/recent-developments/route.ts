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

    // Get recent important tweets
    console.log('Querying tweet_analyses...');
    const { data: tweets, error: tweetsError } = await supabase
      .from('tweet_analyses')
      .select('*')
      .gte('importance_score', 7)  // Only show important tweets
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (tweetsError) {
      console.error('Error fetching tweets:', tweetsError);
      return NextResponse.json({ error: 'Failed to fetch tweets', details: tweetsError }, { status: 500 });
    }
    
    // Get monitored projects to map project_id to project_name
    console.log('Fetching monitored projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('monitored_projects')
      .select('project_id, project_name, symbol');
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json({ error: 'Failed to fetch projects', details: projectsError }, { status: 500 });
    }
    
    // Create a map for quick lookup
    const projectMap = new Map(
      (projects || []).map(p => [p.project_id, { name: p.project_name, symbol: p.symbol }])
    );

    console.log('Query result:', { tweetsCount: tweets?.length, projectsCount: projects?.length });

    // Transform the data to match the component's expected format
    const formattedTweets = (tweets || []).map((tweet: any) => {
      const project = projectMap.get(tweet.project_id);
      return {
        id: tweet.id,
        project_id: tweet.project_id,
        project_name: project?.name || 'Unknown Project',
        symbol: project?.symbol || '',
        tweet_text: tweet.tweet_text,
        summary: tweet.summary,
        importance_score: tweet.importance_score,
        category: tweet.category,
        created_at: tweet.created_at
      };
    });

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