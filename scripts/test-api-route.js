const fetch = require('node-fetch')

async function testAPIRoute() {
  console.log('Testing API route authentication...\n')
  
  // Test without auth
  console.log('1. Testing without authentication:')
  try {
    const response = await fetch('http://localhost:3000/api/positions')
    console.log('   Status:', response.status)
    const data = await response.json()
    console.log('   Response:', data)
  } catch (error) {
    console.log('   Error:', error.message)
  }
  
  // Test with auth
  console.log('\n2. Testing with authentication:')
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  )
  
  // Sign in first
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'marc@minutevideos.com',
    password: '123456'
  })
  
  if (authError) {
    console.log('   Auth failed:', authError.message)
    return
  }
  
  console.log('   Signed in successfully')
  
  // Get the session token
  const session = authData.session
  if (!session) {
    console.log('   No session available')
    return
  }
  
  // Test API with auth headers
  console.log('\n3. Testing API with auth cookies:')
  const cookies = `sb-gualxudgbmpuhjbumfeh-auth-token=${session.access_token}`
  
  const authResponse = await fetch('http://localhost:3000/api/positions', {
    headers: {
      'Cookie': cookies
    }
  })
  
  console.log('   Status:', authResponse.status)
  const authData2 = await authResponse.json()
  console.log('   Response:', Array.isArray(authData2) ? `${authData2.length} positions` : authData2)
}

testAPIRoute().catch(console.error)