const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDismissFlow() {
  console.log('Checking notification dismiss flow...\n');
  
  // 1. Check if we have any notifications in user_notifications table
  console.log('1. Checking user_notifications table:');
  const { data: userNotifs, error: notifError } = await supabase
    .from('user_notifications')
    .select('*')
    .limit(10);
  
  if (notifError) {
    console.error('Error:', notifError);
  } else {
    console.log(`Found ${userNotifs?.length || 0} user notification records`);
    if (userNotifs && userNotifs.length > 0) {
      userNotifs.forEach(n => {
        console.log(`- User: ${n.user_id.substring(0, 8)}..., Tweet: ${n.tweet_analysis_id.substring(0, 8)}..., Dismissed: ${n.dismissed_at ? 'YES' : 'NO'}`);
      });
    }
  }
  
  // 2. Check current high-importance tweets
  console.log('\n2. Current high-importance tweets:');
  const { data: tweets } = await supabase
    .from('tweet_analyses')
    .select('id, project_id, importance_score, created_at')
    .gte('importance_score', 9)
    .order('created_at', { ascending: false });
  
  console.log(`Found ${tweets?.length || 0} tweets with score 9+`);
  tweets?.forEach(t => {
    console.log(`- ID: ${t.id}, Project: ${t.project_id}, Score: ${t.importance_score}`);
  });
  
  // 3. Test creating a dismiss record
  if (tweets && tweets.length > 0) {
    const testTweetId = tweets[0].id;
    const testUserId = 'f4f96818-1080-4bad-9782-b7d97de4c384'; // Marc's user ID
    
    console.log(`\n3. Testing dismiss functionality with tweet ${testTweetId}...`);
    
    // Check if already exists
    const { data: existing } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', testUserId)
      .eq('tweet_analysis_id', testTweetId)
      .single();
    
    if (existing) {
      console.log('Record already exists:', {
        seen_at: existing.seen_at,
        dismissed_at: existing.dismissed_at
      });
      
      // Update to dismissed
      const { error: updateError } = await supabase
        .from('user_notifications')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', existing.id);
      
      if (updateError) {
        console.error('Update error:', updateError);
      } else {
        console.log('✅ Successfully marked as dismissed');
      }
    } else {
      // Create new dismissed record
      const { error: insertError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: testUserId,
          tweet_analysis_id: testTweetId,
          dismissed_at: new Date().toISOString(),
          seen_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Insert error:', insertError);
      } else {
        console.log('✅ Successfully created dismiss record');
      }
    }
  }
  
  // 4. Verify the API query logic
  console.log('\n4. Testing API query logic...');
  const userId = 'f4f96818-1080-4bad-9782-b7d97de4c384';
  
  // Get all high importance tweets
  const { data: allAlerts } = await supabase
    .from('tweet_analyses')
    .select('id, project_id, importance_score, summary, created_at')
    .gte('importance_score', 9)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log(`Found ${allAlerts?.length || 0} total alerts`);
  
  // Get user notification states
  if (allAlerts && allAlerts.length > 0) {
    const { data: userNotifications } = await supabase
      .from('user_notifications')
      .select('tweet_analysis_id, seen_at, dismissed_at')
      .eq('user_id', userId)
      .in('tweet_analysis_id', allAlerts.map(a => a.id));
    
    console.log(`Found ${userNotifications?.length || 0} user notification records`);
    
    // Filter out dismissed
    const dismissedIds = new Set(
      userNotifications?.filter(n => n.dismissed_at).map(n => n.tweet_analysis_id) || []
    );
    
    const visibleAlerts = allAlerts.filter(a => !dismissedIds.has(a.id));
    console.log(`After filtering dismissed: ${visibleAlerts.length} alerts should be visible`);
    
    visibleAlerts.forEach(alert => {
      console.log(`- ${alert.id.substring(0, 8)}... (${alert.project_id})`);
    });
  }
}

checkDismissFlow().catch(console.error);