-- Create investors table linked to auth.users
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  account_number TEXT UNIQUE NOT NULL,
  share_percentage DECIMAL(5,2) NOT NULL CHECK (share_percentage > 0 AND share_percentage <= 100),
  initial_investment DECIMAL(12,2),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_investors_email ON investors(email);
CREATE INDEX idx_investors_status ON investors(status);

-- Create investor access logs for tracking
CREATE TABLE IF NOT EXISTS investor_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Link reports to specific investors
CREATE TABLE IF NOT EXISTS investor_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(investor_id, report_id)
);

-- RLS Policies
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_reports ENABLE ROW LEVEL SECURITY;

-- Admins can see all investors
CREATE POLICY "Admins can view all investors" ON investors
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- Investors can only see their own record
CREATE POLICY "Investors can view own record" ON investors
  FOR SELECT USING (auth.uid() = id);

-- Only admins can insert/update/delete investors
CREATE POLICY "Only admins can manage investors" ON investors
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Only admins can update investors" ON investors
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Only admins can delete investors" ON investors
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- Access logs policies
CREATE POLICY "Admins can view all access logs" ON investor_access_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "System can insert access logs" ON investor_access_logs
  FOR INSERT WITH CHECK (true);

-- Investor reports policies
CREATE POLICY "Admins can manage all investor reports" ON investor_reports
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Investors can view own reports" ON investor_reports
  FOR SELECT USING (
    investor_id = auth.uid()
  );

-- Function to check if a user is an investor
CREATE OR REPLACE FUNCTION is_investor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM investors WHERE id = user_id AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;