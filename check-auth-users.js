const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAuthUsers() {
  console.log('Checking auth.users and notification flow...\n');
  
  // 1. Get all users from auth.users
  console.log('1. Getting users from auth.users:');
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  const marc = users.find(u => u.email === 'marc@cyrator.com');
  if (!marc) {
    console.error('Marc not found in auth.users!');
    return;
  }
  
  console.log(`Found Marc: ${marc.email} (ID: ${marc.id})`);
  
  // 2. Check who owns the notification records
  console.log('\n2. Checking notification records:');
  const { data: allNotifs } = await supabase
    .from('user_notifications')
    .select('*')
    .order('created_at', { ascending: false });
  
  console.log(`Total notification records: ${allNotifs?.length || 0}`);
  
  if (allNotifs && allNotifs.length > 0) {
    // Map user IDs to emails
    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = u.email;
    });
    
    allNotifs.forEach(n => {
      const email = userMap[n.user_id] || 'Unknown';
      console.log(`\nRecord ID: ${n.id}`);
      console.log(`  User: ${email} (${n.user_id})`);
      console.log(`  Tweet: ${n.tweet_analysis_id.substring(0, 8)}...`);
      console.log(`  Seen: ${n.seen_at ? new Date(n.seen_at).toLocaleString() : 'NO'}`);
      console.log(`  Dismissed: ${n.dismissed_at ? new Date(n.dismissed_at).toLocaleString() : 'NO'}`);
    });
  }
  
  // 3. Test dismiss for Marc
  console.log(`\n3. Testing dismiss functionality for Marc (${marc.id}):`);
  
  // Get current alerts
  const { data: tweets } = await supabase
    .from('tweet_analyses')
    .select('id, project_id, summary')
    .gte('importance_score', 9)
    .order('created_at', { ascending: false });
  
  if (tweets && tweets.length > 0) {
    const firstTweet = tweets[0];
    console.log(`\nUsing tweet: ${firstTweet.id}`);
    console.log(`Summary: ${firstTweet.summary}`);
    
    // Check if record exists
    const { data: existing } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', marc.id)
      .eq('tweet_analysis_id', firstTweet.id)
      .single();
    
    if (existing) {
      console.log('\nExisting record found:');
      console.log(`  Seen: ${existing.seen_at}`);
      console.log(`  Dismissed: ${existing.dismissed_at}`);
      
      if (!existing.dismissed_at) {
        // Mark as dismissed
        const { error: updateError } = await supabase
          .from('user_notifications')
          .update({ 
            dismissed_at: new Date().toISOString(),
            seen_at: existing.seen_at || new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (updateError) {
          console.error('Update error:', updateError);
        } else {
          console.log('✅ Marked as dismissed');
        }
      } else {
        console.log('Already dismissed');
      }
    } else {
      // Create new record
      console.log('\nNo existing record, creating new one...');
      const { error: insertError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: marc.id,
          tweet_analysis_id: firstTweet.id,
          seen_at: new Date().toISOString(),
          dismissed_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Insert error:', insertError);
      } else {
        console.log('✅ Created dismiss record');
      }
    }
  }
  
  // 4. Verify what the API would return
  console.log('\n4. Testing what API would return for Marc:');
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: apiAlerts } = await supabase
    .from('tweet_analyses')
    .select('id, project_id, importance_score, summary, created_at')
    .gte('importance_score', 9)
    .gte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (apiAlerts && apiAlerts.length > 0) {
    const { data: marcNotifications } = await supabase
      .from('user_notifications')
      .select('tweet_analysis_id, seen_at, dismissed_at')
      .eq('user_id', marc.id)
      .in('tweet_analysis_id', apiAlerts.map(a => a.id));
    
    const dismissedIds = new Set(
      marcNotifications?.filter(n => n.dismissed_at).map(n => n.tweet_analysis_id) || []
    );
    
    const visibleAlerts = apiAlerts.filter(a => !dismissedIds.has(a.id));
    
    console.log(`\nMarc should see ${visibleAlerts.length} alerts (out of ${apiAlerts.length} total)`);
    visibleAlerts.forEach(a => {
      console.log(`- ${a.summary}`);
    });
  }
}

checkAuthUsers().catch(console.error);