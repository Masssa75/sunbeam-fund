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
CREATE INDEX idx_user_notifications_seen ON user_notifications(user_id, seen_at);
CREATE INDEX idx_user_notifications_dismissed ON user_notifications(user_id, dismissed_at);

-- Enable RLS
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own notification states
CREATE POLICY "Users can view own notification states" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification states" ON user_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification states" ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Add helpful view for getting unread notifications count
CREATE OR REPLACE VIEW unread_notifications_count AS
SELECT 
  u.id as user_id,
  COUNT(DISTINCT ta.id) as unread_count
FROM 
  auth.users u
  CROSS JOIN tweet_analyses ta
  LEFT JOIN user_notifications un ON un.user_id = u.id AND un.tweet_analysis_id = ta.id
WHERE 
  ta.importance_score >= 9
  AND ta.created_at >= NOW() - INTERVAL '7 days'
  AND (un.seen_at IS NULL OR un.dismissed_at IS NOT NULL)
GROUP BY u.id;