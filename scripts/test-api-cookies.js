const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://gualxudgbmpuhjbumfeh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'

async function testAPICookies() {
  console.log('Testing API cookie handling...\n')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // 1. Sign in
    console.log('1. Signing in...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'marc@minutevideos.com',
      password: '123456'
    })
    
    if (authError) throw authError
    
    const accessToken = authData.session?.access_token
    const refreshToken = authData.session?.refresh_token
    console.log('   ✅ Got tokens')
    
    // 2. Test different cookie formats
    console.log('\n2. Testing different cookie formats...')
    
    // Test 1: Using sb-access-token and sb-refresh-token
    console.log('\n   Test 1: sb-access-token and sb-refresh-token')
    let response = await fetch('https://sunbeam.capital/api/positions/', {
      headers: {
        'Cookie': `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`
      }
    })
    let data = await response.json()
    console.log('   Result:', data.length, 'positions')
    
    // Test 2: Using sb-[project-ref]-auth-token format
    console.log('\n   Test 2: sb-gualxudgbmpuhjbumfeh-auth-token')
    response = await fetch('https://sunbeam.capital/api/positions/', {
      headers: {
        'Cookie': `sb-gualxudgbmpuhjbumfeh-auth-token=${accessToken}`
      }
    })
    data = await response.json()
    console.log('   Result:', data.length, 'positions')
    
    // Test 3: Using both formats
    console.log('\n   Test 3: Both cookie formats')
    response = await fetch('https://sunbeam.capital/api/positions/', {
      headers: {
        'Cookie': `sb-gualxudgbmpuhjbumfeh-auth-token=${accessToken}; sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`
      }
    })
    data = await response.json()
    console.log('   Result:', data.length, 'positions')
    
    // Test 4: Check what cookies the browser would set
    console.log('\n3. Checking Supabase cookie format...')
    // In browser, Supabase sets cookies in a specific format
    const base64Payload = Buffer.from(JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: authData.user
    })).toString('base64')
    
    console.log('\n   Test 4: Base64 encoded session')
    response = await fetch('https://sunbeam.capital/api/positions/', {
      headers: {
        'Cookie': `sb-gualxudgbmpuhjbumfeh-auth-token=${base64Payload}`
      }
    })
    data = await response.json()
    console.log('   Result:', data.length, 'positions')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
  }
}

testAPICookies()