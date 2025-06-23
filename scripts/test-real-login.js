const { execSync } = require('child_process')

console.log('Testing real login flow on production...\n')

// Test 1: Check if login page loads
console.log('1. Checking login page...')
try {
  const loginPage = execSync('curl -s https://sunbeam.capital/login | grep -o "Sign in to Sunbeam Fund" | head -1', { encoding: 'utf8' })
  if (loginPage.includes('Sign in to Sunbeam Fund')) {
    console.log('   ✅ Login page loads correctly')
  } else {
    console.log('   ❌ Login page not loading properly')
  }
} catch (e) {
  console.log('   ❌ Error loading login page')
}

// Test 2: Check homepage status
console.log('\n2. Checking homepage (should show Loading or Auth Required)...')
try {
  const homepage = execSync('curl -s https://sunbeam.capital/ | grep -E "Loading Portfolio|Authentication Required" | head -1', { encoding: 'utf8' })
  console.log('   Current state:', homepage.trim() || 'Unknown state')
} catch (e) {
  console.log('   ❌ Error checking homepage')
}

// Test 3: Check session API
console.log('\n3. Checking session API (should return false when not logged in)...')
try {
  const session = execSync('curl -s https://sunbeam.capital/api/auth/session/', { encoding: 'utf8' })
  console.log('   Session API response:', session.trim())
} catch (e) {
  console.log('   ❌ Error checking session API')
}

// Test 4: Test debug page
console.log('\n4. Checking if test-login-debug page exists...')
try {
  const debugPage = execSync('curl -s -o /dev/null -w "%{http_code}" https://sunbeam.capital/test-login-debug', { encoding: 'utf8' })
  if (debugPage.trim() === '200') {
    console.log('   ✅ Debug page accessible at https://sunbeam.capital/test-login-debug')
  } else {
    console.log('   ❌ Debug page returned status:', debugPage.trim())
  }
} catch (e) {
  console.log('   ❌ Error accessing debug page')
}

// Test 5: Check environment
console.log('\n5. Checking environment variables...')
try {
  const envCheck = execSync('curl -s https://sunbeam.capital/api/env-check/', { encoding: 'utf8' })
  const env = JSON.parse(envCheck)
  console.log('   ✅ Supabase URL configured:', env.supabase_config.has_url)
  console.log('   ✅ Supabase Anon Key configured:', env.supabase_config.has_anon_key)
} catch (e) {
  console.log('   ❌ Error checking environment')
}

// Test 6: Simulate what happens in browser
console.log('\n6. Testing authentication flow with Supabase client...')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://gualxudgbmpuhjbumfeh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
)

// First sign out to ensure clean state
supabase.auth.signOut().then(() => {
  console.log('   ✅ Signed out to ensure clean state')
  
  // Try to sign in
  return supabase.auth.signInWithPassword({
    email: 'marc@minutevideos.com',
    password: '123456'
  })
}).then(({ data, error }) => {
  if (error) {
    console.log('   ❌ Sign in failed:', error.message)
    console.log('   Error details:', error)
  } else {
    console.log('   ✅ Sign in successful!')
    console.log('   User:', data.user?.email)
    console.log('   Session exists:', !!data.session)
    
    // Test if we can access protected data
    return supabase.from('positions').select('*')
  }
}).then(result => {
  if (result && !result.error) {
    console.log('   ✅ Can access positions:', result.data?.length || 0)
  } else if (result?.error) {
    console.log('   ❌ Cannot access positions:', result.error.message)
  }
}).catch(err => {
  console.error('   ❌ Unexpected error:', err)
})

console.log('\n=== SUMMARY ===')
console.log('If authentication works in this script but not in browser:')
console.log('1. Browser might have stale cookies - try incognito mode')
console.log('2. Check browser console for CORS or network errors')
console.log('3. Try the debug page: https://sunbeam.capital/test-login-debug')
console.log('\nTest credentials: marc@minutevideos.com / 123456')