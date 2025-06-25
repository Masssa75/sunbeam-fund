const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTables() {
  console.log('Creating user notifications table...\n');
  
  // First, let's check if the table already exists
  const { data: existing } = await supabase
    .from('user_notifications')
    .select('id')
    .limit(1);
  
  if (existing !== null) {
    console.log('✅ Table user_notifications already exists!');
    return;
  }
  
  console.log('Table does not exist, please create it manually in Supabase SQL Editor:');
  console.log('\n--- COPY AND PASTE THIS SQL ---\n');
  console.log(`
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
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_tweet_id ON user_notifications(tweet_analysis_id);

-- Enable RLS
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own notification states
CREATE POLICY "Users can view own notification states" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification states" ON user_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification states" ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);
  `);
  
  console.log('\n--- END SQL ---\n');
  console.log('Go to: https://gualxudgbmpuhjbumfeh.supabase.co/dashboard/project/gualxudgbmpuhjbumfeh/sql/new');
}

createTables().catch(console.error);