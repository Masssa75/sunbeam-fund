const fs = require('fs');
const path = require('path');

async function setupTwitterMonitoring() {
  console.log('Setting up Twitter monitoring tables for Sunbeam Fund...\n');

  // Read SQL file
  const sqlPath = path.join(__dirname, 'create-twitter-monitoring-tables.sql');
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

    console.log('✅ Twitter monitoring tables created successfully!');
    console.log('\nCreated tables:');
    console.log('- monitored_projects (configuration for each project)');
    console.log('- tweet_analyses (stores analyzed tweets)');
    console.log('\nCreated functions:');
    console.log('- get_oldest_monitored_project()');
    console.log('- update_last_monitored()');
    
    // Now add Kaspa as the first monitored project
    console.log('\nAdding Kaspa as first monitored project...');
    
    const insertQuery = `
      INSERT INTO monitored_projects (
        project_id, project_name, symbol, twitter_handle, alert_threshold
      ) VALUES (
        'kaspa', 'Kaspa', 'kas', 'KaspaCurrency', 7
      ) ON CONFLICT (project_id) DO NOTHING;
    `;
    
    const insertResponse = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: insertQuery })
    });
    
    if (insertResponse.ok) {
      console.log('✅ Added Kaspa to monitored projects!');
    }

    console.log('\nNext steps:');
    console.log('1. Deploy the nitter-search Edge Function');
    console.log('2. Set up ScraperAPI key as Edge Function secret');
    console.log('3. Deploy monitor-projects Edge Function');
    console.log('4. Configure cron job to run monitoring');

  } catch (error) {
    console.error('❌ Error setting up tables:', error.message);
  }
}

// Run the setup
setupTwitterMonitoring();