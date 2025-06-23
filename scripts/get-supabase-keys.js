const fetch = require('node-fetch')
require('dotenv').config()

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const SUPABASE_API_URL = 'https://api.supabase.com/v1'
const PROJECT_ID = 'gualxudgbmpuhjbumfeh'

async function getProjectKeys() {
  console.log(`Getting keys for project: ${PROJECT_ID}...`)
  
  try {
    // Get project details first
    const projectResponse = await fetch(`${SUPABASE_API_URL}/projects/${PROJECT_ID}`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!projectResponse.ok) {
      throw new Error(`Failed to get project: ${projectResponse.status}`)
    }
    
    const project = await projectResponse.json()
    console.log(`Project status: ${project.status}`)
    
    // Try different endpoints for keys
    const endpoints = [
      `/projects/${PROJECT_ID}/api-keys`,
      `/projects/${PROJECT_ID}/settings`,
      `/projects/${PROJECT_ID}`
    ]
    
    for (const endpoint of endpoints) {
      console.log(`\nTrying endpoint: ${endpoint}`)
      const response = await fetch(`${SUPABASE_API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Response:', JSON.stringify(data, null, 2))
        
        // Look for keys in the response
        if (data.anon_key || data.anon_public_key || data.api_keys) {
          console.log('\n=== Found API Keys ===')
          const anonKey = data.anon_key || data.anon_public_key || data.api_keys?.anon_key
          const serviceKey = data.service_role_key || data.service_key || data.api_keys?.service_role_key
          
          if (anonKey) console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`)
          if (serviceKey) console.log(`SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`)
          
          return { anonKey, serviceKey }
        }
      }
    }
    
    console.log('\nCould not find API keys in responses')
    console.log('You may need to get them from the Supabase dashboard')
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

getProjectKeys()