const fetch = require('node-fetch');
const fs = require('fs');

async function runMigration() {
  try {
    const sql = fs.readFileSync('./supabase/migrations/create_investors_table.sql', 'utf8');
    
    const response = await fetch('https://api.supabase.com/v1/projects/gualxudgbmpuhjbumfeh/database/query', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Migration executed successfully!');
      console.log('Created tables: investors, investor_access_logs, investor_reports');
      console.log('Created RLS policies and helper functions');
    } else {
      console.error('❌ Migration failed:', result);
    }
  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

runMigration();