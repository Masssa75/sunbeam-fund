const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetMarcNotifications() {
  console.log('Resetting Marc\'s notification dismissals for testing...\n');
  
  // Delete all of Marc's notification records
  const marcId = '74c1ca77-4b94-4a76-ab4d-6f77b93ab920';
  
  console.log('1. Deleting all notification records for Marc...');
  const { error: deleteError } = await supabase
    .from('user_notifications')
    .delete()
    .eq('user_id', marcId);
  
  if (deleteError) {
    console.error('Delete error:', deleteError);
  } else {
    console.log('✅ Deleted all notification records');
  }
  
  // Verify
  console.log('\n2. Verifying Marc has no notification records:');
  const { data: remaining } = await supabase
    .from('user_notifications')
    .select('*')
    .eq('user_id', marcId);
  
  console.log(`Marc now has ${remaining?.length || 0} notification records`);
  
  // Check what notifications Marc should see
  console.log('\n3. Notifications Marc should see:');
  const { data: alerts } = await supabase
    .from('tweet_analyses')
    .select('id, project_id, summary, importance_score')
    .gte('importance_score', 9)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });
  
  console.log(`${alerts?.length || 0} high-importance alerts available:`);
  alerts?.forEach(a => {
    console.log(`- ${a.summary} (Score: ${a.importance_score})`);
  });
}

resetMarcNotifications().catch(console.error);