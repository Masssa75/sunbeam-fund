const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findMarcAndTest() {
  console.log('Finding Marc\'s user ID and testing dismiss flow...\n');
  
  // 1. Find Marc's user ID
  console.log('1. Finding Marc\'s user ID:');
  const { data: users } = await supabase
    .from('users')
    .select('id, email')
    .in('email', ['marc@cyrator.com', 'marc@minutevideos.com']);
  
  if (!users || users.length === 0) {
    console.error('Marc not found!');
    return;
  }
  
  const marc = users.find(u => u.email === 'marc@cyrator.com') || users[0];
  console.log(`Found Marc: ${marc.email} (ID: ${marc.id})`);
  
  // 2. Check existing notification records for Marc
  console.log('\n2. Marc\'s notification records:');
  const { data: marcNotifs } = await supabase
    .from('user_notifications')
    .select('*')
    .eq('user_id', marc.id);
  
  console.log(`Found ${marcNotifs?.length || 0} records for Marc`);
  if (marcNotifs && marcNotifs.length > 0) {
    marcNotifs.forEach(n => {
      console.log(`- Tweet: ${n.tweet_analysis_id.substring(0, 8)}..., Seen: ${n.seen_at ? 'YES' : 'NO'}, Dismissed: ${n.dismissed_at ? 'YES' : 'NO'}`);
    });
  }
  
  // 3. The issue might be that the user IDs don't match
  console.log('\n3. Checking who owns the existing notification records:');
  const { data: allNotifs } = await supabase
    .from('user_notifications')
    .select('user_id, tweet_analysis_id, dismissed_at');
  
  if (allNotifs) {
    // Group by user
    const byUser = {};
    allNotifs.forEach(n => {
      if (!byUser[n.user_id]) byUser[n.user_id] = [];
      byUser[n.user_id].push(n);
    });
    
    for (const [userId, notifs] of Object.entries(byUser)) {
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      console.log(`\nUser: ${user?.email || 'Unknown'} (${userId})`);
      notifs.forEach(n => {
        console.log(`  - Tweet ${n.tweet_analysis_id.substring(0, 8)}... - Dismissed: ${n.dismissed_at ? 'YES' : 'NO'}`);
      });
    }
  }
  
  // 4. Test the actual API logic
  console.log('\n4. Testing actual API query logic for Marc:');
  
  // This mimics what the API does
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  // Get tweets
  const { data: alerts } = await supabase
    .from('tweet_analyses')
    .select('id, project_id, importance_score, summary, created_at')
    .gte('importance_score', 9)
    .gte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log(`Found ${alerts?.length || 0} alerts`);
  
  // Get Marc's notification states
  if (alerts && alerts.length > 0) {
    const { data: userNotifications } = await supabase
      .from('user_notifications')
      .select('tweet_analysis_id, seen_at, dismissed_at')
      .eq('user_id', marc.id)
      .in('tweet_analysis_id', alerts.map(a => a.id));
    
    console.log(`Marc has ${userNotifications?.length || 0} notification records for these alerts`);
    
    // Create notification state map
    const notificationStates = new Map(
      userNotifications?.map(n => [n.tweet_analysis_id, n]) || []
    );
    
    // Filter alerts
    const alertsWithState = alerts
      .map(alert => {
        const state = notificationStates.get(alert.id);
        return {
          ...alert,
          is_seen: !!state?.seen_at,
          is_dismissed: !!state?.dismissed_at
        };
      })
      .filter(alert => !alert.is_dismissed);
    
    console.log(`\nAfter filtering dismissed: ${alertsWithState.length} alerts visible`);
    alertsWithState.forEach(a => {
      console.log(`- ${a.id.substring(0, 8)}... - Seen: ${a.is_seen}, Dismissed: ${a.is_dismissed}`);
    });
  }
}

findMarcAndTest().catch(console.error);