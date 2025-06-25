-- Create monitored_projects table for Twitter monitoring configuration
CREATE TABLE IF NOT EXISTS monitored_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  twitter_handle TEXT,
  alert_threshold INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  last_monitored TIMESTAMP WITH TIME ZONE,
  monitoring_config JSONB DEFAULT '{"check_official": true, "check_mentions": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for monitoring queries
CREATE INDEX idx_monitored_projects_active_last ON monitored_projects(is_active, last_monitored);
CREATE INDEX idx_monitored_projects_project_id ON monitored_projects(project_id);

-- Create tweet_analyses table (copy exact structure from Porta)
CREATE TABLE IF NOT EXISTS tweet_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  tweet_id TEXT NOT NULL,
  tweet_text TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  importance_score INTEGER DEFAULT 5,
  category TEXT DEFAULT 'general',
  summary TEXT,
  url TEXT,
  is_ai_analyzed BOOLEAN DEFAULT false,
  analysis_metadata JSONB,
  UNIQUE(project_id, tweet_id)
);

-- Create indexes for performance
CREATE INDEX idx_tweet_analyses_project_id ON tweet_analyses(project_id);
CREATE INDEX idx_tweet_analyses_created_at ON tweet_analyses(created_at DESC);
CREATE INDEX idx_tweet_analyses_importance ON tweet_analyses(importance_score DESC);

-- Create partitioned version for better performance at scale
CREATE TABLE IF NOT EXISTS tweet_analyses_partitioned (
  LIKE tweet_analyses INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create first partition
CREATE TABLE IF NOT EXISTS tweet_analyses_y2025m01 
PARTITION OF tweet_analyses_partitioned 
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Add RLS policies
ALTER TABLE monitored_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_analyses ENABLE ROW LEVEL SECURITY;

-- Admins can manage monitored projects
CREATE POLICY "Admins can manage monitored projects" ON monitored_projects
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- Service role has full access
CREATE POLICY "Service role has full access to monitored projects" ON monitored_projects
  FOR ALL USING (auth.role() = 'service_role');

-- Anyone can read tweet analyses (public data)
CREATE POLICY "Tweet analyses are publicly readable" ON tweet_analyses
  FOR SELECT USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role manages tweet analyses" ON tweet_analyses
  FOR ALL USING (auth.role() = 'service_role');

-- Function to get oldest monitored project
CREATE OR REPLACE FUNCTION get_oldest_monitored_project()
RETURNS TABLE (
  id UUID,
  project_id TEXT,
  project_name TEXT,
  symbol TEXT,
  twitter_handle TEXT,
  alert_threshold INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.project_id, m.project_name, m.symbol, m.twitter_handle, m.alert_threshold
  FROM monitored_projects m
  WHERE m.is_active = true
  ORDER BY m.last_monitored ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update last monitored timestamp
CREATE OR REPLACE FUNCTION update_last_monitored(p_project_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE monitored_projects
  SET last_monitored = NOW()
  WHERE project_id = p_project_id;
END;
$$ LANGUAGE plpgsql;