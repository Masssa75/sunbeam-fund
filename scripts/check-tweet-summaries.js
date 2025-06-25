require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTweetSummaries() {
  console.log('🔍 Checking tweet summaries in database...\n');

  // Get all tweets with summaries
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
      is_ai_analyzed
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching tweets:', error);
    return;
  }

  console.log(`Found ${tweets.length} recent tweets\n`);

  // Count tweets with summaries
  const tweetsWithSummaries = tweets.filter(t => t.summary);
  const tweetsWithAI = tweets.filter(t => t.is_ai_analyzed);

  console.log(`📊 Statistics:`);
  console.log(`- Total tweets: ${tweets.length}`);
  console.log(`- Tweets with summaries: ${tweetsWithSummaries.length}`);
  console.log(`- AI analyzed tweets: ${tweetsWithAI.length}`);
  console.log(`- Average importance score: ${(tweets.reduce((sum, t) => sum + t.importance_score, 0) / tweets.length).toFixed(1)}\n`);

  // Show some examples
  console.log('📝 Sample tweets with summaries:');
  tweetsWithSummaries.slice(0, 5).forEach((tweet, i) => {
    console.log(`\n${i + 1}. [Score: ${tweet.importance_score}] ${tweet.project_id}`);
    console.log(`   Summary: ${tweet.summary}`);
    console.log(`   Original: ${tweet.tweet_text.substring(0, 100)}...`);
  });

  // Show high importance tweets
  const highImportanceTweets = tweets.filter(t => t.importance_score >= 7);
  console.log(`\n🚨 High importance tweets (score >= 7): ${highImportanceTweets.length}`);
  highImportanceTweets.forEach((tweet, i) => {
    console.log(`\n${i + 1}. [Score: ${tweet.importance_score}] ${tweet.project_id}`);
    console.log(`   Summary: ${tweet.summary || 'No summary'}`);
    console.log(`   Text: ${tweet.tweet_text.substring(0, 150)}...`);
  });

  // Check monitored projects
  const { data: projects } = await supabase
    .from('monitored_projects')
    .select('*')
    .eq('is_active', true);

  console.log(`\n🎯 Active monitored projects: ${projects?.length || 0}`);
  projects?.forEach(p => {
    console.log(`- ${p.project_name} (${p.symbol})`);
  });
}

checkTweetSummaries().catch(console.error);