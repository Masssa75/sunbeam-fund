const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkHighImportanceTweets() {
  console.log('Checking for tweets with importance score 9+...\n');
  
  // Get all tweets with score 9+
  const { data: highScoreTweets, error } = await supabase
    .from('tweet_analyses')
    .select('*')
    .gte('importance_score', 9)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tweets:', error);
    return;
  }
  
  console.log(`Found ${highScoreTweets.length} tweets with score 9+:\n`);
  
  if (highScoreTweets.length > 0) {
    // Check last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTweets = highScoreTweets.filter(t => 
      new Date(t.created_at) > twentyFourHoursAgo
    );
    
    console.log(`${recentTweets.length} of these are from the last 24 hours:\n`);
    
    highScoreTweets.forEach(tweet => {
      const isRecent = new Date(tweet.created_at) > twentyFourHoursAgo;
      const marker = isRecent ? '🔴 RECENT' : '⚪ OLDER';
      console.log(`${marker} ${tweet.project_name || tweet.project_id}`);
      console.log(`   Score: ${tweet.importance_score}/10`);
      console.log(`   Time: ${new Date(tweet.created_at).toLocaleString()}`);
      console.log(`   Summary: ${tweet.executive_summary || tweet.summary || 'No summary'}`);
      console.log('');
    });
  }
  
  // Check notification bell query
  console.log('\n📔 Checking notification bell API query...');
  const notificationQuery = await supabase
    .from('tweet_analyses')
    .select('id, project_id, importance_score, summary, created_at')
    .gte('importance_score', 9)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log(`Notification query would return: ${notificationQuery.data?.length || 0} tweets`);
  
  if (notificationQuery.data && notificationQuery.data.length > 0) {
    console.log('\nThese tweets should appear in the notification bell:');
    notificationQuery.data.forEach(tweet => {
      console.log(`- Score ${tweet.importance_score}: ${tweet.summary?.substring(0, 50)}...`);
    });
  }
}

checkHighImportanceTweets().catch(console.error);