const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runSQL() {
  console.log('Creating user_notifications table via direct queries...\n');
  
  const statements = [
    // Create table
    `CREATE TABLE IF NOT EXISTS user_notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      tweet_analysis_id UUID REFERENCES tweet_analyses(id) ON DELETE CASCADE NOT NULL,
      seen_at TIMESTAMP WITH TIME ZONE,
      dismissed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, tweet_analysis_id)
    )`,
    
    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_notifications_tweet_id ON user_notifications(tweet_analysis_id)`,
    
    // Enable RLS
    `ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY`,
    
    // Create policies
    `CREATE POLICY "Users can view own notification states" ON user_notifications
      FOR SELECT USING (auth.uid() = user_id)`,
    
    `CREATE POLICY "Users can insert own notification states" ON user_notifications
      FOR INSERT WITH CHECK (auth.uid() = user_id)`,
    
    `CREATE POLICY "Users can update own notification states" ON user_notifications
      FOR UPDATE USING (auth.uid() = user_id)`
  ];
  
  let success = 0;
  let failed = 0;
  
  for (const sql of statements) {
    try {
      const description = sql.split('\n')[0].substring(0, 50) + '...';
      console.log(`Executing: ${description}`);
      
      // Try using rpc if available
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(() => ({ error: 'RPC not available' }));
      
      if (error && error !== 'RPC not available') {
        console.error('  ❌ Error:', error);
        failed++;
      } else if (error === 'RPC not available') {
        console.log('  ⚠️  RPC not available, skipping');
        failed++;
      } else {
        console.log('  ✅ Success');
        success++;
      }
    } catch (e) {
      console.error('  ❌ Exception:', e.message);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${success} succeeded, ${failed} failed`);
  
  // Test if table was created
  console.log('\nTesting if table exists...');
  const { data, error } = await supabase
    .from('user_notifications')
    .select('id')
    .limit(1);
  
  if (error && error.code === '42P01') {
    console.log('❌ Table does not exist - manual creation required');
    console.log('\nPlease run the SQL manually at:');
    console.log('https://gualxudgbmpuhjbumfeh.supabase.co/dashboard/project/gualxudgbmpuhjbumfeh/sql/new');
  } else if (error) {
    console.log('⚠️  Error checking table:', error.message);
  } else {
    console.log('✅ Table exists and is accessible!');
  }
}

runSQL().catch(console.error);