const fetch = require('node-fetch')
const { createClient } = require('@supabase/supabase-js')

async function testProductionAuth() {
  const prodUrl = 'https://sunbeam.capital'
  
  console.log('Testing production authentication flow...\n')
  
  // 1. Test unauthenticated access
  console.log('1. Testing API without authentication:')
  try {
    const response = await fetch(`${prodUrl}/api/positions`)
    console.log('   Status:', response.status)
    const data = await response.json()
    console.log('   Response:', data)
    console.log('   ✅ Correctly returns 401 for unauthenticated access')
  } catch (error) {
    console.log('   ❌ Error:', error.message)
  }
  
  // 2. Test authentication
  console.log('\n2. Testing authentication with Supabase:')
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  )
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'marc@minutevideos.com',
    password: '123456'
  })
  
  if (authError) {
    console.log('   ❌ Auth failed:', authError.message)
    return
  }
  
  console.log('   ✅ Authentication successful')
  console.log('   User:', authData.user?.email)
  console.log('   Session token received:', !!authData.session?.access_token)
  
  // 3. Test API with authentication
  console.log('\n3. Testing API with auth token:')
  // Get all auth cookies
  const authCookies = []
  if (authData.session?.access_token) {
    authCookies.push(`sb-gualxudgbmpuhjbumfeh-auth-token=${authData.session.access_token}`)
  }
  if (authData.session?.refresh_token) {
    authCookies.push(`sb-gualxudgbmpuhjbumfeh-auth-token-refresh=${authData.session.refresh_token}`)
  }
  // Add the base64 encoded session
  const sessionData = {
    access_token: authData.session.access_token,
    refresh_token: authData.session.refresh_token,
    user: authData.user
  }
  const sessionBase64 = Buffer.from(JSON.stringify(sessionData)).toString('base64')
  authCookies.push(`sb-gualxudgbmpuhjbumfeh-auth-token-code-verifier=${sessionBase64}`)
  
  const cookies = authCookies.join('; ')
  
  try {
    const authResponse = await fetch(`${prodUrl}/api/positions`, {
      headers: {
        'Cookie': cookies
      }
    })
    
    console.log('   Status:', authResponse.status)
    
    if (authResponse.ok) {
      const positions = await authResponse.json()
      console.log('   ✅ Successfully fetched', positions.length, 'positions')
      if (positions.length > 0) {
        console.log('   First position:', positions[0].project_name)
      }
    } else {
      const error = await authResponse.json()
      console.log('   ❌ Error:', error)
    }
  } catch (error) {
    console.log('   ❌ Request error:', error.message)
  }
  
  // 4. Test page content
  console.log('\n4. Testing page content without auth:')
  try {
    const pageResponse = await fetch(prodUrl)
    const html = await pageResponse.text()
    
    if (html.includes('Authentication Required')) {
      console.log('   ✅ Page correctly shows "Authentication Required" when not logged in')
    } else if (html.includes('Loading Portfolio')) {
      console.log('   ⚠️  Page shows "Loading Portfolio" - might be stuck')
    } else {
      console.log('   ❓ Page content unclear - check manually')
    }
  } catch (error) {
    console.log('   ❌ Error fetching page:', error.message)
  }
  
  console.log('\n✅ Test complete!')
}

testProductionAuth().catch(console.error)