const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateAlertThreshold() {
  console.log('Updating alert threshold to 9+ for all monitored projects...\n');
  
  // Update all projects to alert threshold 9
  // Supabase requires a WHERE clause, so we use a condition that matches all records
  const { data, error } = await supabase
    .from('monitored_projects')
    .update({ alert_threshold: 9 })
    .gte('alert_threshold', 0) // This will match all records
    .select();
  
  if (error) {
    console.error('❌ Error updating thresholds:', error);
    return;
  }
  
  console.log('✅ Updated alert thresholds for all projects to 9+\n');
  console.log('📊 Current monitoring configuration:\n');
  
  data.forEach(project => {
    console.log(`- ${project.project_name} (@${project.twitter_handle}) - Alert threshold: ${project.alert_threshold}`);
  });
  
  console.log('\n🔔 What this means:');
  console.log('- Only tweets scoring 9 or 10 (truly critical updates) will trigger alerts');
  console.log('- These high-importance tweets will appear in the notification bell');
  console.log('- They will show up in the investor dashboard "Recent Developments" section');
  console.log('- This ensures investors only see the most important updates\n');
  
  // Check if there are any existing high-importance tweets
  const { data: highImportanceTweets, error: tweetsError } = await supabase
    .from('tweet_analyses')
    .select('*')
    .gte('importance_score', 9)
    .order('analyzed_at', { ascending: false })
    .limit(5);
  
  if (!tweetsError && highImportanceTweets && highImportanceTweets.length > 0) {
    console.log(`📈 Found ${highImportanceTweets.length} existing tweets with score 9+:`);
    highImportanceTweets.forEach(tweet => {
      console.log(`   - ${tweet.project_name}: "${tweet.executive_summary}" (Score: ${tweet.importance_score})`);
    });
  } else {
    console.log('📊 No existing tweets with score 9+ found yet. The system will collect them as they appear.');
  }
}

updateAlertThreshold().catch(console.error);