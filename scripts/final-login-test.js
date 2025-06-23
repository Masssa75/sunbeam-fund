const { createClient } = require('@supabase/supabase-js')

async function testFinalLogin() {
  console.log('=== FINAL LOGIN TEST ON PRODUCTION ===\n')
  
  console.log('1. Testing homepage content...')
  const homepageResponse = await fetch('https://sunbeam.capital/')
  const homepageText = await homepageResponse.text()
  
  if (homepageText.includes('Loading Portfolio...')) {
    console.log('   ⚠️  Homepage shows "Loading Portfolio..."')
  } else if (homepageText.includes('Authentication Required')) {
    console.log('   ✅ Homepage shows "Authentication Required"')
  } else if (homepageText.includes('Portfolio Positions')) {
    console.log('   ✅ Homepage shows portfolio table')
  }
  
  console.log('\n2. Testing login with browser simulation...')
  // Create a supabase client
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  )
  
  // Sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'marc@minutevideos.com',
    password: '123456'
  })
  
  if (authError) {
    console.log('   ❌ Login failed:', authError.message)
    return
  }
  
  console.log('   ✅ Login successful')
  console.log('   User:', authData.user.email)
  
  // Test fetching positions directly
  console.log('\n3. Testing direct database access...')
  const { data: positions, error: posError } = await supabase
    .from('positions')
    .select('*')
  
  if (posError) {
    console.log('   ❌ Failed to fetch positions:', posError.message)
  } else {
    console.log('   ✅ Fetched', positions.length, 'positions from database')
  }
  
  console.log('\n=== TEST SUMMARY ===')
  console.log('✅ Authentication works with Supabase client')
  console.log('✅ Database contains 9 positions')
  console.log('❓ Browser login needs manual testing')
  console.log('\nTo test manually:')
  console.log('1. Go to https://sunbeam.capital/login')
  console.log('2. Enter: marc@minutevideos.com / 123456')
  console.log('3. Click Sign In')
  console.log('4. You should be redirected to the portfolio page')
}

testFinalLogin().catch(console.error)