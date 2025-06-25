const fs = require('fs');
const path = require('path');

async function setupTelegramTables() {
  console.log('Setting up Telegram tables for Sunbeam Fund...\n');

  // Read SQL file
  const sqlPath = path.join(__dirname, 'create-telegram-tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Get Supabase credentials from .env
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

  const projectId = process.env.SUPABASE_PROJECT_ID;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (!projectId || !accessToken) {
    console.error('❌ Error: Missing SUPABASE_PROJECT_ID or SUPABASE_ACCESS_TOKEN in .env');
    return;
  }

  try {
    // Execute SQL via Supabase Management API
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    console.log('✅ Telegram tables created successfully!');
    console.log('\nCreated tables:');
    console.log('- investor_telegram (stores Telegram connections)');
    console.log('- notification_logs (tracks sent notifications)');
    console.log('\nCreated function:');
    console.log('- generate_connection_token() (generates unique tokens)');
    console.log('\nNext steps:');
    console.log('1. Add your Telegram bot token to .env');
    console.log('2. Deploy the Edge Functions');
    console.log('3. Set up the webhook for your bot');

  } catch (error) {
    console.error('❌ Error setting up tables:', error.message);
  }
}

// Run the setup
setupTelegramTables();