const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.new' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function runSchema() {
  console.log('Running database schema...')
  console.log(`Project URL: ${SUPABASE_URL}`)
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)
      
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({ query: statement })
        })
        
        if (!response.ok) {
          // Try alternative approach - direct SQL execution
          const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ query: statement })
          })
          
          if (!altResponse.ok) {
            console.error(`Failed: ${response.status} - Statement preview: ${statement.substring(0, 50)}...`)
            errorCount++
          } else {
            console.log('Success')
            successCount++
          }
        } else {
          console.log('Success')
          successCount++
        }
      } catch (error) {
        console.error(`Error: ${error.message}`)
        errorCount++
      }
    }
    
    console.log(`\n=== Schema Execution Summary ===`)
    console.log(`Total statements: ${statements.length}`)
    console.log(`Successful: ${successCount}`)
    console.log(`Failed: ${errorCount}`)
    
    if (errorCount > 0) {
      console.log('\nNote: Some statements failed. This might be expected if tables already exist.')
      console.log('You can run the schema manually in the Supabase SQL Editor:')
      console.log('https://app.supabase.com/project/gualxudgbmpuhjbumfeh/sql/new')
    }
    
  } catch (error) {
    console.error('Error running schema:', error.message)
    console.log('\nPlease run the schema manually in the Supabase SQL Editor:')
    console.log('https://app.supabase.com/project/gualxudgbmpuhjbumfeh/sql/new')
  }
}

// Alternative: Use the management API to run SQL
async function runSchemaViaManagementAPI() {
  console.log('\nTrying alternative method via Management API...')
  
  const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || fs.readFileSync('.env', 'utf8').match(/SUPABASE_ACCESS_TOKEN=(.+)/)?.[1]
  const PROJECT_ID = 'gualxudgbmpuhjbumfeh'
  
  try {
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: schema })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error(`Failed: ${response.status} - ${error}`)
    } else {
      console.log('Schema executed successfully via Management API!')
    }
  } catch (error) {
    console.error('Management API error:', error.message)
  }
}

// Run both methods
runSchema().then(() => {
  console.log('\nYou can now update your .env file with the credentials from .env.new')
})