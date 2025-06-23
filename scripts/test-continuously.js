const { execSync } = require('child_process')
const { createClient } = require('@supabase/supabase-js')

async function testUntilWorking() {
  console.log('=== CONTINUOUS TESTING UNTIL LOGIN WORKS ===\n')
  
  let attempt = 1
  const maxAttempts = 10
  
  while (attempt <= maxAttempts) {
    console.log(`\n--- ATTEMPT ${attempt} ---`)
    
    // Test 1: Check homepage state
    console.log('1. Checking homepage state...')
    try {
      const homepage = execSync('curl -s https://sunbeam.capital/ | grep -o "Authentication Required\\|Loading Portfolio" | head -1', { encoding: 'utf8' })
      const state = homepage.trim()
      console.log('   Homepage shows:', state || 'Neither loading nor auth required')
      
      if (state === 'Authentication Required') {
        console.log('   ✅ Homepage correctly shows auth required')
      } else if (state === 'Loading Portfolio') {
        console.log('   ⚠️  Still showing loading state')
      }
    } catch (e) {
      console.log('   ❌ Error checking homepage')
    }
    
    // Test 2: Check session API
    console.log('\n2. Testing session API...')
    try {
      const sessionResponse = execSync('curl -s https://sunbeam.capital/api/auth/session/', { encoding: 'utf8' })
      const session = JSON.parse(sessionResponse)
      console.log('   Session authenticated:', session.authenticated)
    } catch (e) {
      console.log('   ❌ Error checking session')
    }
    
    // Test 3: Test login with Supabase
    console.log('\n3. Testing login with Supabase client...')
    const supabase = createClient(
      'https://gualxudgbmpuhjbumfeh.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
    )
    
    try {
      await supabase.auth.signOut()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'marc@minutevideos.com',
        password: '123456'
      })
      
      if (error) {
        console.log('   ❌ Login failed:', error.message)
      } else {
        console.log('   ✅ Login successful')
        
        // Check positions
        const { data: positions, error: posError } = await supabase.from('positions').select('*')
        if (!posError) {
          console.log('   ✅ Can access', positions.length, 'positions')
        }
      }
    } catch (e) {
      console.log('   ❌ Unexpected error:', e.message)
    }
    
    // Test 4: Check if error page loads
    console.log('\n4. Checking for JavaScript errors...')
    try {
      const errorCheck = execSync('curl -s https://sunbeam.capital/ | grep -o "Error\\|error\\|failed" | head -3', { encoding: 'utf8' })
      if (errorCheck.trim()) {
        console.log('   ⚠️  Found error text:', errorCheck.trim())
      } else {
        console.log('   ✅ No error text found')
      }
    } catch (e) {
      console.log('   ✅ No error text found')
    }
    
    // Test 5: Check test-login-debug page with trailing slash
    console.log('\n5. Checking debug page...')
    try {
      const debugStatus = execSync('curl -s -o /dev/null -w "%{http_code}" https://sunbeam.capital/test-login-debug/', { encoding: 'utf8' })
      if (debugStatus.trim() === '200') {
        console.log('   ✅ Debug page accessible')
      } else {
        console.log('   Status:', debugStatus.trim())
      }
    } catch (e) {
      console.log('   ❌ Error accessing debug page')
    }
    
    console.log('\n--- END ATTEMPT ' + attempt + ' ---')
    
    attempt++
    if (attempt <= maxAttempts) {
      console.log('\nWaiting 5 seconds before next attempt...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
  
  console.log('\n=== TESTING COMPLETE ===')
  console.log('\nIf still not working, possible issues:')
  console.log('1. Client-side JavaScript not executing')
  console.log('2. Environment variables not available client-side')
  console.log('3. CORS or CSP blocking requests')
  console.log('4. Cookies not being set properly')
}

testUntilWorking()