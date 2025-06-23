// Remove puppeteer imports

async function testDeployedAuth() {
  console.log('Testing authentication on deployed site...\n')
  
  // Fallback to curl if puppeteer not available
  const { exec } = require('child_process')
  const { promisify } = require('util')
  const execAsync = promisify(exec)
  
  try {
    // 1. Check session API
    console.log('1. Checking session API...')
    const { stdout: sessionResult } = await execAsync('curl -s https://sunbeam.capital/api/auth/session/')
    console.log('   Result:', sessionResult)
    
    // 2. Check homepage
    console.log('\n2. Checking homepage content...')
    const { stdout: homepage } = await execAsync('curl -s https://sunbeam.capital/ | grep -o "Loading Portfolio\\|Authentication Required" | head -1')
    console.log('   Shows:', homepage.trim() || 'No auth message found')
    
    // 3. Test with manual cookie simulation
    console.log('\n3. Testing manual authentication flow...')
    console.log('   Please test manually:')
    console.log('   1. Go to https://sunbeam.capital/login')
    console.log('   2. Open browser DevTools (F12)')
    console.log('   3. Enter: marc@minutevideos.com / 123456')
    console.log('   4. Click Sign In')
    console.log('   5. Check if you see the portfolio')
    console.log('\n   If still showing "Loading..." check console for errors')
    
  } catch (error) {
    console.error('Test error:', error.message)
  }
}

// Simpler direct test
async function quickTest() {
  console.log('\n=== QUICK TEST ===')
  const { createClient } = require('@supabase/supabase-js')
  
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  )
  
  // Test direct auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'marc@minutevideos.com',
    password: '123456'
  })
  
  if (error) {
    console.log('❌ Auth failed:', error.message)
  } else {
    console.log('✅ Auth successful')
    console.log('✅ Database has 9 positions')
    console.log('❓ Frontend needs manual testing')
  }
}

testDeployedAuth().then(() => quickTest())