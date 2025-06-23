-- Fix Row Level Security policies for positions table

-- First, check if RLS is enabled
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON positions;
DROP POLICY IF EXISTS "Enable read access for all users" ON positions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON positions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON positions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON positions;

-- Create new policies for authenticated users
-- Allow authenticated users to see all positions
CREATE POLICY "Enable read access for authenticated users" ON positions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert positions
CREATE POLICY "Enable insert for authenticated users" ON positions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update positions
CREATE POLICY "Enable update for authenticated users" ON positions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete positions
CREATE POLICY "Enable delete for authenticated users" ON positions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Also fix RLS for other tables
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Portfolio snapshots policies
CREATE POLICY "Enable all for authenticated users" ON portfolio_snapshots
    FOR ALL USING (auth.role() = 'authenticated');

-- Reports policies
CREATE POLICY "Enable all for authenticated users" ON reports
    FOR ALL USING (auth.role() = 'authenticated');

-- Audit log policies
CREATE POLICY "Enable all for authenticated users" ON audit_log
    FOR ALL USING (auth.role() = 'authenticated');