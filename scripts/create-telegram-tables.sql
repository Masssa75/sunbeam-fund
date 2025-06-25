-- Create investor_telegram table for storing Telegram connections
CREATE TABLE IF NOT EXISTS investor_telegram (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  telegram_chat_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  connection_token TEXT UNIQUE NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notification_preferences JSONB DEFAULT '{"reports": true, "portfolio_updates": true, "important_alerts": true}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_notification_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_investor_telegram_chat_id ON investor_telegram(telegram_chat_id);
CREATE INDEX idx_investor_telegram_token ON investor_telegram(connection_token);
CREATE INDEX idx_investor_telegram_investor ON investor_telegram(investor_id);

-- Add RLS policies
ALTER TABLE investor_telegram ENABLE ROW LEVEL SECURITY;

-- Only admins can view telegram connections
CREATE POLICY "Admins can view all telegram connections" ON investor_telegram
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- Service role can do everything (for Edge Functions)
CREATE POLICY "Service role has full access" ON investor_telegram
  FOR ALL USING (auth.role() = 'service_role');

-- Create notification_logs table for tracking sent notifications
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_telegram_id UUID REFERENCES investor_telegram(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'report', 'portfolio_update', 'alert'
  message TEXT NOT NULL,
  telegram_message_id BIGINT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'read'
  error_message TEXT,
  metadata JSONB
);

-- Index for querying recent notifications
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at DESC);
CREATE INDEX idx_notification_logs_investor ON notification_logs(investor_telegram_id);

-- RLS for notification logs
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Same policies as investor_telegram
CREATE POLICY "Admins can view all notification logs" ON notification_logs
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Service role has full access to logs" ON notification_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Function to generate unique connection tokens
CREATE OR REPLACE FUNCTION generate_connection_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;