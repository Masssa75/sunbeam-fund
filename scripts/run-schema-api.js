const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const PROJECT_REF = 'gualxudgbmpuhjbumfeh'

async function runSchema() {
  console.log('Running database schema via Supabase API...')
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Use the Supabase Management API to run SQL
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: schema
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error(`Failed to run schema: ${response.status}`)
      console.error('Error:', error)
      
      // Try splitting into individual statements
      console.log('\nTrying to run statements individually...')
      await runStatementsIndividually(schema)
    } else {
      const result = await response.json()
      console.log('✅ Schema executed successfully!')
      console.log('Result:', result)
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

async function runStatementsIndividually(schema) {
  // Split by semicolon but be careful with functions
  const statements = []
  let currentStatement = ''
  let inFunction = false
  
  const lines = schema.split('\n')
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Check for function start/end
    if (trimmedLine.includes('CREATE OR REPLACE FUNCTION')) {
      inFunction = true
    }
    if (inFunction && trimmedLine === '$$') {
      inFunction = !inFunction
    }
    
    currentStatement += line + '\n'
    
    // End of statement
    if (!inFunction && trimmedLine.endsWith(';')) {
      statements.push(currentStatement.trim())
      currentStatement = ''
    }
  }
  
  // Filter out empty statements and comments
  const validStatements = statements.filter(s => 
    s.length > 0 && 
    !s.startsWith('--') &&
    s !== ';'
  )
  
  console.log(`Found ${validStatements.length} statements to execute`)
  
  let successCount = 0
  let failCount = 0
  
  for (let i = 0; i < validStatements.length; i++) {
    const statement = validStatements[i]
    const preview = statement.substring(0, 50).replace(/\n/g, ' ')
    
    try {
      const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: statement
        })
      })
      
      if (response.ok) {
        console.log(`✅ [${i+1}/${validStatements.length}] ${preview}...`)
        successCount++
      } else {
        const error = await response.text()
        console.log(`❌ [${i+1}/${validStatements.length}] ${preview}...`)
        console.log(`   Error: ${error}`)
        failCount++
      }
    } catch (error) {
      console.log(`❌ [${i+1}/${validStatements.length}] ${preview}...`)
      console.log(`   Error: ${error.message}`)
      failCount++
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`\n=== Summary ===`)
  console.log(`Successful: ${successCount}`)
  console.log(`Failed: ${failCount}`)
  
  if (successCount > 0) {
    console.log('\n✅ Tables should now be created!')
    console.log('Run `node scripts/test-supabase.js` to verify')
  }
}

runSchema()