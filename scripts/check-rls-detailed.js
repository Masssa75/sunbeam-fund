const { createClient } = require('@supabase/supabase-js')

async function checkRLS() {
  const supabaseUrl = 'https://gualxudgbmpuhjbumfeh.supabase.co'
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.dXVPt7gZZJB7FNnKxBYnW7afPbXR9uK1aWJiD0exzAE'

  console.log('Checking RLS in detail...\n')

  // Test with anon key - no options
  const anonClient = createClient(supabaseUrl, anonKey)
  
  console.log('1. Testing simple select with anon key:')
  const { data: anonData, error: anonError } = await anonClient
    .from('positions')
    .select('*')
  
  if (anonError) {
    console.log('   Error:', anonError.message)
  } else {
    console.log('   Found', anonData.length, 'positions')
    if (anonData.length > 0) {
      console.log('   First position:', anonData[0].project_name)
    }
  }

  // Test with service role
  console.log('\n2. Testing with service role key:')
  const serviceClient = createClient(supabaseUrl, serviceKey)
  
  const { data: serviceData, error: serviceError } = await serviceClient
    .from('positions')
    .select('*')
  
  if (serviceError) {
    console.log('   Error:', serviceError.message)
  } else {
    console.log('   Found', serviceData.length, 'positions')
    console.log('   Projects:', serviceData.map(p => p.project_name).join(', '))
  }

  // Check actual RLS policies
  console.log('\n3. Checking RLS policies:')
  const { data: policies, error: policyError } = await serviceClient
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'positions')
  
  if (policyError) {
    console.log('   Error checking policies:', policyError.message)
  } else {
    console.log('   Found', policies.length, 'policies')
    policies.forEach(p => {
      console.log(`   - ${p.policyname}: ${p.permissive} ${p.cmd}`)
    })
  }
}

checkRLS()