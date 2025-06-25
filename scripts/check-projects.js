const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProjects() {
  // Get all projects being monitored
  const { data: projects, error } = await supabase
    .from('monitor_projects')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Projects being monitored:');
  projects.forEach(project => {
    console.log(`- ${project.id}: ${project.name} (${project.symbol})`);
    console.log(`  Twitter: @${project.twitter_handle || 'N/A'}`);
    console.log(`  Last monitored: ${project.last_monitored || 'Never'}`);
    console.log(`  Created: ${project.created_at}\n`);
  });
  
  // Check recent tweet collection activity
  const { data: recentTweets, error: tweetsError } = await supabase
    .from('tweet_analyses')
    .select('project_id, created_at, tweet_text')
    .order('created_at', { ascending: false })
    .limit(20);
    
  if (tweetsError) {
    console.error('Error getting recent tweets:', tweetsError);
    return;
  }
  
  console.log('\nRecent tweet collection activity:');
  recentTweets.forEach(tweet => {
    console.log(`${tweet.created_at}: ${tweet.project_id} - ${tweet.tweet_text.substring(0, 80)}...`);
  });
}

checkProjects().catch(console.error);