const { createClient } = require('@supabase/supabase-js')

async function testSupabase() {
  console.log('Testing Supabase connection...')
  
  // Test with anon key first
  const anonClient = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  )
  
  console.log('\n1. Testing with anon key:')
  try {
    const { data, error } = await anonClient
      .from('positions')
      .select('id')
      .limit(1)
    
    if (error) {
      console.log('❌ Anon query failed:', error.message)
      console.log('   Error code:', error.code)
      console.log('   This suggests RLS policies are blocking anonymous reads')
    } else {
      console.log('✅ Anon query succeeded! Found', data?.length || 0, 'records')
    }
  } catch (err) {
    console.log('❌ Exception with anon key:', err.message)
  }
  
  // Test with service role key
  const serviceClient = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4'
  )
  
  console.log('\n2. Testing with service role key:')
  try {
    const { data, error, count } = await serviceClient
      .from('positions')
      .select('*', { count: 'exact' })
    
    if (error) {
      console.log('❌ Service role query failed:', error.message)
    } else {
      console.log('✅ Service role query succeeded!')
      console.log('   Total positions:', count)
      console.log('   Sample data:', data?.[0] ? {
        project: data[0].project_name,
        symbol: data[0].symbol
      } : 'No data')
    }
  } catch (err) {
    console.log('❌ Exception with service role:', err.message)
  }
  
  console.log('\n3. Testing RLS policies:')
  try {
    const { data: policies } = await serviceClient
      .rpc('pg_policies')
      .select('*')
      .eq('tablename', 'positions')
    
    console.log('   Policies found:', policies?.length || 0)
  } catch (err) {
    // This RPC might not exist, that's ok
  }
  
  console.log('\nDiagnosis:')
  console.log('If anon fails but service role works → RLS policies need fixing')
  console.log('If both fail → Connection/network issue')
  console.log('If both work → Issue is elsewhere in the app')
}

testSupabase()