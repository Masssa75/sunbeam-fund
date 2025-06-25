const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testNotificationAPI() {
  console.log('Testing notification API logic...\n');
  
  // 1. Check what the API query would return
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  console.log('24 hours ago:', twentyFourHoursAgo);
  console.log('Current time:', new Date().toISOString());
  
  const { data: alerts, error } = await supabase
    .from('tweet_analyses')
    .select('id, project_id, importance_score, summary, created_at')
    .gte('importance_score', 9)
    .gte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`\nFound ${alerts?.length || 0} alerts:\n`);
  
  if (alerts && alerts.length > 0) {
    // Get project names
    const projectIds = Array.from(new Set(alerts.map(a => a.project_id)));
    const { data: projects } = await supabase
      .from('monitored_projects')
      .select('project_id, project_name')
      .in('project_id', projectIds);
    
    const projectMap = new Map(projects?.map(p => [p.project_id, p.project_name]) || []);
    
    alerts.forEach(alert => {
      console.log(`📢 Alert ID: ${alert.id}`);
      console.log(`   Project: ${projectMap.get(alert.project_id) || alert.project_id}`);
      console.log(`   Score: ${alert.importance_score}/10`);
      console.log(`   Summary: ${alert.summary}`);
      console.log(`   Created: ${alert.created_at}`);
      console.log('');
    });
  } else {
    console.log('No alerts found matching criteria.');
    console.log('\nDebugging: Let\'s check the exact timestamps of our 9+ tweets...');
    
    const { data: allHighScoreTweets } = await supabase
      .from('tweet_analyses')
      .select('created_at, importance_score, project_id')
      .gte('importance_score', 9)
      .order('created_at', { ascending: false });
    
    if (allHighScoreTweets) {
      allHighScoreTweets.forEach(tweet => {
        const created = new Date(tweet.created_at);
        const isWithin24h = created > new Date(twentyFourHoursAgo);
        console.log(`Tweet created at: ${tweet.created_at} (${isWithin24h ? 'WITHIN' : 'OUTSIDE'} 24h window)`);
      });
    }
  }
}

testNotificationAPI().catch(console.error);