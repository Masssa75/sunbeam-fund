const fetch = require('node-fetch')

async function fixRLS() {
  const projectRef = 'gualxudgbmpuhjbumfeh'
  const apiKey = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add'
  
  // First drop the existing policy
  const dropSQL = `DROP POLICY IF EXISTS "Anyone can read" ON public.positions;`
  
  console.log('Dropping existing policy...')
  
  try {
    const dropResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: dropSQL })
    })
    
    const dropResult = await dropResponse.json()
    console.log('Drop result:', dropResult)
    
    // Now create the new policy
    const createSQL = `
      -- Create policy allowing everyone to read
      CREATE POLICY "Anyone can read" ON public.positions
        FOR SELECT USING (true);
    `
    
    console.log('Creating new policy...')
    
    const createResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: createSQL })
    })
    
    const createResult = await createResponse.json()
    console.log('Create result:', createResult)
    
    // Test with anon key
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

fixRLS()