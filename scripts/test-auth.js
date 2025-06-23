const { createClient } = require('@supabase/supabase-js')

async function testAuth() {
  const supabaseUrl = 'https://gualxudgbmpuhjbumfeh.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  console.log('Testing authentication...\n')
  
  // Test sign in with the admin user
  console.log('1. Testing sign in with marc@minutevideos.com:')
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'marc@minutevideos.com',
    password: '123456'
  })
  
  if (signInError) {
    console.log('   ❌ Sign in failed:', signInError.message)
  } else {
    console.log('   ✅ Sign in successful!')
    console.log('   User ID:', signInData.user?.id)
    console.log('   Session:', !!signInData.session)
    
    // Test getting session
    console.log('\n2. Testing get session:')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('   ❌ Get session failed:', sessionError.message)
    } else {
      console.log('   ✅ Session retrieved:', !!session)
      console.log('   User email:', session?.user?.email)
    }
    
    // Test sign out
    console.log('\n3. Testing sign out:')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.log('   ❌ Sign out failed:', signOutError.message)
    } else {
      console.log('   ✅ Sign out successful!')
    }
  }
}

testAuth().catch(console.error)