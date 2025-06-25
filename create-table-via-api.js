const fetch = require('node-fetch');

const SUPABASE_ACCESS_TOKEN = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add';
const PROJECT_REF = 'gualxudgbmpuhjbumfeh';

async function executeSQL() {
  console.log('Creating user_notifications table via Supabase Management API...\n');
  
  const sql = `
-- Create table to track user notification states
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tweet_analysis_id UUID REFERENCES tweet_analyses(id) ON DELETE CASCADE NOT NULL,
  seen_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tweet_analysis_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_tweet_id ON user_notifications(tweet_analysis_id);

-- Enable RLS
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own notification states
CREATE POLICY "Users can view own notification states" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification states" ON user_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification states" ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);
  `;
  
  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
      }
    );
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ Table created successfully!');
      console.log('Response:', result);
    } else {
      console.error('❌ Failed to create table');
      console.error('Status:', response.status);
      console.error('Response:', result);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  // Test if table exists
  console.log('\nVerifying table creation...');
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data, error } = await supabase
    .from('user_notifications')
    .select('id')
    .limit(1);
  
  if (error && error.code === '42P01') {
    console.log('❌ Table still does not exist');
  } else if (error) {
    console.log('⚠️  Table exists but got error:', error.message);
  } else {
    console.log('✅ Table verified - user_notifications is ready!');
  }
}

executeSQL().catch(console.error);