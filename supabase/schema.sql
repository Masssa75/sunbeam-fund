-- Sunbeam Fund Management Database Schema
-- Run this in your Supabase SQL editor after creating the project

-- Portfolio positions table
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR NOT NULL,          -- CoinGecko ID
  project_name VARCHAR NOT NULL,
  symbol VARCHAR NOT NULL,
  amount DECIMAL(20,8) NOT NULL,       -- Amount of tokens held
  cost_basis DECIMAL(20,2),            -- USD cost basis
  entry_date DATE NOT NULL,
  exit_date DATE,                      -- NULL if still holding
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly portfolio snapshots
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL UNIQUE,   -- End of month date
  positions JSONB NOT NULL,             -- Complete position data with prices
  total_value_usd DECIMAL(20,2) NOT NULL,
  total_cost_basis DECIMAL(20,2),
  performance_metrics JSONB,            -- ROI, % changes, etc
  metadata JSONB,                       -- Additional data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_month DATE NOT NULL UNIQUE,    -- Month of the report
  report_type VARCHAR DEFAULT 'monthly',
  report_data JSONB NOT NULL,           -- Full report content
  ai_summary TEXT,                      -- AI-generated executive summary
  key_highlights JSONB,                 -- Important points
  pdf_url TEXT,                         -- If exported to PDF
  excel_url TEXT,                       -- If exported to Excel
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects being monitored (similar to porta)
CREATE TABLE IF NOT EXISTS monitored_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR NOT NULL UNIQUE,   -- CoinGecko ID
  project_name VARCHAR NOT NULL,
  symbol VARCHAR NOT NULL,
  twitter_handle VARCHAR,
  telegram_channel VARCHAR,
  reddit_sub VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  monitoring_config JSONB,              -- Thresholds, preferences
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tweet analyses (copy from porta for consistency)
CREATE TABLE IF NOT EXISTS tweet_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR NOT NULL,
  tweet_id VARCHAR UNIQUE NOT NULL,
  tweet_text TEXT NOT NULL,
  author VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  importance_score INTEGER DEFAULT 5,
  category VARCHAR DEFAULT 'general',
  summary TEXT,
  url TEXT,
  is_ai_analyzed BOOLEAN DEFAULT FALSE,
  analysis_metadata JSONB
);

-- Notifications sent
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR NOT NULL,                -- 'tweet', 'report', 'alert'
  channel VARCHAR NOT NULL,             -- 'telegram', 'email', etc
  recipient VARCHAR,
  content TEXT NOT NULL,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR DEFAULT 'sent'
);

-- Audit log for important actions
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR NOT NULL,              -- 'position_added', 'report_generated', etc
  entity_type VARCHAR,
  entity_id UUID,
  details JSONB,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_positions_project_id ON positions(project_id);
CREATE INDEX idx_positions_entry_date ON positions(entry_date);
CREATE INDEX idx_snapshots_date ON portfolio_snapshots(snapshot_date);
CREATE INDEX idx_reports_month ON reports(report_month);
CREATE INDEX idx_tweets_project_id ON tweet_analyses(project_id);
CREATE INDEX idx_tweets_importance ON tweet_analyses(importance_score);

-- Enable Row Level Security
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitored_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on auth strategy)
-- For now, allow service role full access

-- Positions policies
CREATE POLICY "Service role can manage positions" ON positions
  FOR ALL USING (auth.role() = 'service_role');

-- Snapshots policies  
CREATE POLICY "Service role can manage snapshots" ON portfolio_snapshots
  FOR ALL USING (auth.role() = 'service_role');

-- Reports policies
CREATE POLICY "Service role can manage reports" ON reports
  FOR ALL USING (auth.role() = 'service_role');

-- Monitoring policies
CREATE POLICY "Service role can manage monitoring" ON monitored_projects
  FOR ALL USING (auth.role() = 'service_role');

-- Tweet policies
CREATE POLICY "Service role can manage tweets" ON tweet_analyses
  FOR ALL USING (auth.role() = 'service_role');

-- Notification policies
CREATE POLICY "Service role can manage notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

-- Audit policies
CREATE POLICY "Service role can manage audit log" ON audit_log
  FOR ALL USING (auth.role() = 'service_role');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to positions
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to monitored_projects
CREATE TRIGGER update_monitored_projects_updated_at BEFORE UPDATE ON monitored_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();