const fetch = require('node-fetch')

async function deleteTelegramConnection() {
  const projectRef = 'gualxudgbmpuhjbumfeh'
  const apiKey = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add'
  
  // First, let's check what connections exist
  const checkSQL = `
    SELECT it.*, i.name as investor_name 
    FROM investor_telegram it
    LEFT JOIN investors i ON it.investor_id = i.id
    WHERE it.telegram_chat_id IN ('5089502326', '582076')
    OR i.name LIKE '%Marc%';
  `
  
  console.log('Checking existing Telegram connections...')
  
  try {
    const checkResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: checkSQL })
    })
    
    const checkResult = await checkResponse.json()
    console.log('Current connections:', JSON.stringify(checkResult, null, 2))
    
    // Now delete them
    const deleteSQL = `
      DELETE FROM investor_telegram 
      WHERE telegram_chat_id IN ('5089502326', '582076')
      OR investor_id IN (SELECT id FROM investors WHERE name LIKE '%Marc%')
      RETURNING *;
    `
    
    console.log('\nDeleting connections...')
    
    const deleteResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: deleteSQL })
    })
    
    const deleteResult = await deleteResponse.json()
    
    if (!deleteResponse.ok) {
      console.error('API Error:', deleteResult)
      return
    }
    
    console.log('✅ Deleted connections:', JSON.stringify(deleteResult, null, 2))
    
    // Verify deletion
    const verifyResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: checkSQL })
    })
    
    const verifyResult = await verifyResponse.json()
    console.log('\nRemaining connections after deletion:', JSON.stringify(verifyResult, null, 2))
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

deleteTelegramConnection()