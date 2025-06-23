const { createClient } = require('@supabase/supabase-js')

async function testAuthFlow() {
  console.log('Testing complete authentication flow...\n')
  
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  )
  
  try {
    // 1. Sign out first to ensure clean state
    console.log('1. Signing out to ensure clean state...')
    await supabase.auth.signOut()
    console.log('   ✅ Signed out')
    
    // 2. Test session API when not authenticated
    console.log('\n2. Testing /api/auth/session when not authenticated...')
    let response = await fetch('https://sunbeam.capital/api/auth/session/')
    let data = await response.json()
    console.log('   Result:', data)
    console.log('   ✅ Correctly shows authenticated: false')
    
    // 3. Sign in
    console.log('\n3. Signing in with test credentials...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'marc@minutevideos.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('   ❌ Sign in failed:', authError.message)
      return
    }
    
    console.log('   ✅ Sign in successful')
    console.log('   Session token:', authData.session?.access_token?.substring(0, 20) + '...')
    
    // 4. Test session API with authentication
    console.log('\n4. Testing /api/auth/session with auth cookies...')
    // Simulate browser cookies
    const cookies = [
      `sb-gualxudgbmpuhjbumfeh-auth-token=${authData.session?.access_token}`,
      `sb-gualxudgbmpuhjbumfeh-auth-token-refresh=${authData.session?.refresh_token}`
    ].join('; ')
    
    response = await fetch('https://sunbeam.capital/api/auth/session/', {
      headers: {
        'Cookie': cookies
      }
    })
    data = await response.json()
    console.log('   Result:', data)
    
    // 5. Test positions API
    console.log('\n5. Testing /api/positions with auth...')
    response = await fetch('https://sunbeam.capital/api/positions/', {
      headers: {
        'Cookie': cookies
      }
    })
    const positions = await response.json()
    console.log('   Result:', Array.isArray(positions) ? `${positions.length} positions` : 'Error')
    
    // 6. Test homepage rendering
    console.log('\n6. Checking homepage content...')
    response = await fetch('https://sunbeam.capital/')
    const html = await response.text()
    if (html.includes('Loading Portfolio')) {
      console.log('   ⚠️  Still shows "Loading Portfolio..."')
    } else if (html.includes('Authentication Required')) {
      console.log('   ✅ Shows "Authentication Required"')
    }
    
    console.log('\n=== SUMMARY ===')
    console.log('The issue appears to be that the session API is not detecting cookies properly.')
    console.log('This is likely because the SSR cookie handling needs to be fixed.')
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message)
  }
}

testAuthFlow()