const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://gualxudgbmpuhjbumfeh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'

async function testLoginFlow() {
  console.log('Testing login flow...\n')
  
  // Create a client with session persistence
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  })
  
  try {
    // 1. Test authentication
    console.log('1. Testing authentication with marc@minutevideos.com...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'marc@minutevideos.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('   ❌ Authentication failed:', authError.message)
      return
    }
    
    console.log('   ✅ Authentication successful')
    console.log('   Session token:', authData.session?.access_token?.substring(0, 20) + '...')
    
    // 2. Test fetching positions with auth
    console.log('\n2. Fetching positions with authenticated session...')
    const { data: positions, error: posError } = await supabase
      .from('positions')
      .select('*')
      .order('entry_date', { ascending: false })
    
    if (posError) {
      console.error('   ❌ Failed to fetch positions:', posError.message)
    } else {
      console.log('   ✅ Successfully fetched', positions.length, 'positions')
      if (positions.length > 0) {
        console.log('   First position:', positions[0].project_name)
      }
    }
    
    // 3. Test session persistence
    console.log('\n3. Testing session persistence...')
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      console.log('   ✅ Session is persisted')
      console.log('   User:', session.user.email)
    } else {
      console.log('   ❌ Session not persisted')
    }
    
    // 4. Test production API route with auth
    console.log('\n4. Testing production API route with auth token...')
    const apiResponse = await fetch('https://sunbeam.capital/api/positions/', {
      headers: {
        'Cookie': `sb-gualxudgbmpuhjbumfeh-auth-token=${authData.session?.access_token}`
      }
    })
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json()
      console.log('   ✅ API returned', apiData.length, 'positions')
    } else {
      console.log('   ❌ API returned status:', apiResponse.status)
    }
    
    // 5. Sign out
    console.log('\n5. Signing out...')
    await supabase.auth.signOut()
    console.log('   ✅ Signed out successfully')
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message)
  }
}

testLoginFlow()