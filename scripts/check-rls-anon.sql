-- Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'positions';

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.positions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.positions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.positions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.positions;

-- Create new policies that allow anonymous reads
CREATE POLICY "Enable read access for all users" ON public.positions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.positions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.positions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.positions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verify the policies were created
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'positions';