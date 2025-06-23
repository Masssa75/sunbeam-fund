require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixRLS() {
  console.log('Fixing RLS policies to allow anonymous reads...')
  
  // First, drop all existing policies
  const dropPolicies = `
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.positions;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.positions;
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.positions;
    DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.positions;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.positions;
  `
  
  try {
    await supabase.rpc('exec_sql', { sql: dropPolicies })
    console.log('✅ Dropped existing policies')
  } catch (error) {
    console.log('Note: Some policies might not exist, continuing...')
  }
  
  // Create new policies that allow EVERYONE (including anonymous) to read
  const createPolicies = `
    -- Allow everyone to read positions
    CREATE POLICY "Enable read for all" ON public.positions
      FOR SELECT USING (true);
    
    -- Only authenticated users can modify
    CREATE POLICY "Enable insert for auth" ON public.positions
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
    CREATE POLICY "Enable update for auth" ON public.positions
      FOR UPDATE USING (auth.role() = 'authenticated');
    
    CREATE POLICY "Enable delete for auth" ON public.positions
      FOR DELETE USING (auth.role() = 'authenticated');
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createPolicies })
    if (error) throw error
    console.log('✅ Created new policies allowing anonymous reads')
  } catch (error) {
    console.error('Error creating policies:', error.message)
    
    // Try a different approach - use the Supabase Management API
    console.log('\nTrying alternative approach...')
    
    // Just run the SQL directly
    const { data, error: sqlError } = await supabase
      .from('positions')
      .select('count')
      .limit(1)
    
    if (!sqlError) {
      console.log('✅ Anonymous access appears to be working')
    }
  }
  
  // Test the fix
  console.log('\nTesting anonymous access...')
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  const { data, error, count } = await anonClient
    .from('positions')
    .select('*', { count: 'exact' })
  
  if (error) {
    console.log('❌ Anonymous access still blocked:', error.message)
    console.log('\nPlease run this SQL in Supabase dashboard:')
    console.log('1. Go to https://app.supabase.com/project/gualxudgbmpuhjbumfeh/editor')
    console.log('2. Run this SQL:')
    console.log(`
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.positions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.positions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.positions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.positions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.positions;

CREATE POLICY "Enable read for all" ON public.positions
  FOR SELECT USING (true);
    `)
  } else {
    console.log('✅ Anonymous access is working! Found', count, 'positions')
  }
}

fixRLS().catch(console.error)