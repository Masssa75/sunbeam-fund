require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing Supabase connection...')
console.log(`URL: ${supabaseUrl}`)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('positions')
      .select('count')
      .single()
    
    if (error && error.code === '42P01') {
      console.log('✓ Connected to Supabase successfully!')
      console.log('✗ Tables not created yet - please run the schema')
      console.log('\nTo create tables:')
      console.log('1. Go to: https://app.supabase.com/project/gualxudgbmpuhjbumfeh/sql/new')
      console.log('2. Copy and paste the contents of supabase/schema.sql')
      console.log('3. Click "Run"')
    } else if (error) {
      console.error('Connection error:', error)
    } else {
      console.log('✓ Connected to Supabase successfully!')
      console.log('✓ Tables exist!')
    }
    
  } catch (err) {
    console.error('Error:', err)
  }
}

testConnection()