const { createClient } = require('@supabase/supabase-js')

async function testLogin() {
  console.log('Testing login functionality...\n')
  
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  )
  
  // Test 1: Wrong password for marc@cyrator.com
  console.log('1. Testing marc@cyrator.com with wrong password...')
  const { data: data1, error: error1 } = await supabase.auth.signInWithPassword({
    email: 'marc@cyrator.com',
    password: '123456'
  })
  
  if (error1) {
    console.log('   ✅ Expected error:', error1.message)
  } else {
    console.log('   ❌ Unexpected success')
  }
  
  // Test 2: Correct credentials
  console.log('\n2. Testing marc@minutevideos.com with correct password...')
  const { data: data2, error: error2 } = await supabase.auth.signInWithPassword({
    email: 'marc@minutevideos.com',
    password: '123456'
  })
  
  if (error2) {
    console.log('   ❌ Error:', error2.message)
  } else {
    console.log('   ✅ Login successful')
    console.log('   User:', data2.user?.email)
    console.log('   Session exists:', !!data2.session)
  }
  
  // Test 3: Check if we can fetch positions
  if (data2?.session) {
    console.log('\n3. Testing position fetch with session...')
    const { data: positions, error: posError } = await supabase
      .from('positions')
      .select('*')
    
    if (posError) {
      console.log('   ❌ Error fetching positions:', posError.message)
    } else {
      console.log('   ✅ Fetched', positions.length, 'positions')
    }
  }
  
  console.log('\n=== SUMMARY ===')
  console.log('Use marc@minutevideos.com with password 123456')
  console.log('marc@cyrator.com exists but has a different password')
}

testLogin()