const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTimeWindow() {
  console.log('Checking time window for notification alerts...\n');
  
  const now = new Date();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  console.log('Current time (UTC):', now.toISOString());
  console.log('24 hours ago (UTC):', twentyFourHoursAgo.toISOString());
  console.log('Current time (local):', now.toString());
  console.log('24 hours ago (local):', twentyFourHoursAgo.toString());
  
  // Get all high score tweets to see their timestamps
  const { data: tweets, error } = await supabase
    .from('tweet_analyses')
    .select('created_at, importance_score, project_id, summary')
    .gte('importance_score', 9)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`\nFound ${tweets.length} tweets with score 9+:`);
  
  tweets.forEach(tweet => {
    const tweetTime = new Date(tweet.created_at);
    const hoursAgo = (now - tweetTime) / (1000 * 60 * 60);
    const isWithin24h = tweetTime > twentyFourHoursAgo;
    
    console.log(`\n- Created: ${tweet.created_at}`);
    console.log(`  ${hoursAgo.toFixed(1)} hours ago`);
    console.log(`  Within 24h window: ${isWithin24h ? '✅ YES' : '❌ NO'}`);
    console.log(`  Summary: ${tweet.summary}`);
  });
  
  // Test the exact query used by the API
  console.log('\n\nTesting exact API query:');
  const { data: apiResults, error: apiError } = await supabase
    .from('tweet_analyses')
    .select('id, project_id, importance_score, summary, created_at')
    .gte('importance_score', 9)
    .gte('created_at', twentyFourHoursAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log(`API query would return: ${apiResults?.length || 0} alerts`);
  if (apiResults && apiResults.length > 0) {
    console.log('These are:', apiResults.map(a => a.summary));
  }
}

checkTimeWindow().catch(console.error);