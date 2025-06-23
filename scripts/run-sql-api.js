const fetch = require('node-fetch')

async function runSQL() {
  const projectRef = 'gualxudgbmpuhjbumfeh'
  const apiKey = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add'
  
  const sql = `
    -- Drop existing policies
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.positions;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.positions;
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.positions;
    DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.positions;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.positions;
    DROP POLICY IF EXISTS "Enable read for all" ON public.positions;
    
    -- Create new policy allowing everyone to read
    CREATE POLICY "Anyone can read" ON public.positions
      FOR SELECT USING (true);
    
    -- Check if it worked
    SELECT COUNT(*) FROM public.positions;
  `
  
  console.log('Running SQL to fix RLS policies...')
  
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      console.error('API Error:', result)
      return
    }
    
    console.log('✅ SQL executed successfully!')
    console.log('Result:', JSON.stringify(result, null, 2))
    
    // Now test with anon key
    console.log('\nTesting anonymous access...')
    const { createClient } = require('@supabase/supabase-js')
    const anonClient = createClient(
      'https://gualxudgbmpuhjbumfeh.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
    )
    
    const { data, error, count } = await anonClient
      .from('positions')
      .select('*', { count: 'exact' })
    
    if (error) {
      console.log('❌ Still failing:', error.message)
    } else {
      console.log('✅ Anonymous access working! Found', count, 'positions')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

runSQL()