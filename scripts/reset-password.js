const { createClient } = require('@supabase/supabase-js')

async function resetPassword() {
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  )
  
  console.log('Testing authentication with known working account...\n')
  
  // First test with the working account
  const { data: testData, error: testError } = await supabase.auth.signInWithPassword({
    email: 'marc@minutevideos.com',
    password: '123456'
  })
  
  if (testError) {
    console.log('❌ Known working account failed:', testError.message)
  } else {
    console.log('✅ marc@minutevideos.com works fine')
    await supabase.auth.signOut()
  }
  
  // Now test marc@cyrator.com
  console.log('\nTesting marc@cyrator.com...')
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'marc@cyrator.com',
    password: '123456' // Try the same password
  })
  
  if (error) {
    console.log('❌ Login failed:', error.message)
    
    if (error.message.includes('Invalid login credentials')) {
      console.log('\nThe user exists but the password is wrong.')
      console.log('You can either:')
      console.log('1. Use the "Forgot your password?" link to reset it')
      console.log('2. Use marc@minutevideos.com / 123456 instead')
    }
  } else {
    console.log('✅ Login successful!')
  }
}

resetPassword().catch(console.error)