// Test CORS from browser-like environment
const fetch = require('node-fetch')

async function testCORS() {
  const supabaseUrl = 'https://gualxudgbmpuhjbumfeh.supabase.co'
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'

  console.log('Testing CORS with browser-like headers...\n')

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/positions?select=*`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        // Simulate browser headers
        'Origin': 'https://sunbeam.capital',
        'Referer': 'https://sunbeam.capital/',
      }
    })

    console.log('Response status:', response.status)
    console.log('Response headers:')
    console.log('  Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin'))
    console.log('  Access-Control-Allow-Credentials:', response.headers.get('access-control-allow-credentials'))
    
    if (response.ok) {
      const data = await response.json()
      console.log('\n✅ CORS test passed! Found', data.length, 'positions')
    } else {
      console.log('\n❌ CORS test failed!')
      const text = await response.text()
      console.log('Response:', text)
    }
  } catch (error) {
    console.error('\n❌ Network error:', error.message)
  }
}

testCORS()