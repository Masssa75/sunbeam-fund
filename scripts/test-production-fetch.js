// Test fetching positions like the browser would
const fetch = require('node-fetch')

async function testProductionFetch() {
  const supabaseUrl = 'https://gualxudgbmpuhjbumfeh.supabase.co'
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'

  console.log('Testing production-like fetch...\n')

  try {
    console.log('1. Testing direct REST API call:')
    const startTime = Date.now()
    
    const response = await fetch(`${supabaseUrl}/rest/v1/positions?select=*&order=entry_date.desc`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        // Add headers that browsers send
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      // Add timeout
      timeout: 5000
    })

    const responseTime = Date.now() - startTime
    console.log(`   Response time: ${responseTime}ms`)
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Success! Found ${data.length} positions`)
    } else {
      const text = await response.text()
      console.log(`   ❌ Failed: ${text}`)
    }

    // Test if the issue is with specific query parameters
    console.log('\n2. Testing without order clause:')
    const response2 = await fetch(`${supabaseUrl}/rest/v1/positions?select=*`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      }
    })
    
    if (response2.ok) {
      const data2 = await response2.json()
      console.log(`   ✅ Success! Found ${data2.length} positions`)
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.code === 'ETIMEDOUT') {
      console.log('   Request timed out - this matches the browser behavior')
    }
  }
}

testProductionFetch()