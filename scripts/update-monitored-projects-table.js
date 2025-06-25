async function updateMonitoredProjects() {
  require('dotenv').config();
  const projectId = process.env.SUPABASE_PROJECT_ID;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  console.log('Updating monitored_projects table with Twitter monitoring columns...\n');

  const sql = `
    -- Add missing columns for Twitter monitoring
    ALTER TABLE monitored_projects 
    ADD COLUMN IF NOT EXISTS last_monitored TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS alert_threshold INTEGER DEFAULT 7;

    -- Update monitoring_config default
    ALTER TABLE monitored_projects 
    ALTER COLUMN monitoring_config SET DEFAULT '{"check_official": true, "check_mentions": true}'::jsonb;

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_monitored_projects_active_last 
    ON monitored_projects(is_active, last_monitored);
    
    CREATE INDEX IF NOT EXISTS idx_monitored_projects_project_id 
    ON monitored_projects(project_id);

    -- Add Kaspa as first monitored project
    INSERT INTO monitored_projects (
      project_id, project_name, symbol, twitter_handle, alert_threshold, is_active
    ) VALUES (
      'kaspa', 'Kaspa', 'kas', 'KaspaCurrency', 7, true
    ) ON CONFLICT (project_id) DO UPDATE SET
      twitter_handle = 'KaspaCurrency',
      alert_threshold = 7,
      is_active = true;

    -- Add Bittensor as second monitored project
    INSERT INTO monitored_projects (
      project_id, project_name, symbol, twitter_handle, alert_threshold, is_active
    ) VALUES (
      'bittensor', 'Bittensor', 'tao', 'bittensor_', 7, true
    ) ON CONFLICT (project_id) DO UPDATE SET
      twitter_handle = 'bittensor_',
      alert_threshold = 7,
      is_active = true;
  `;

  try {
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

    console.log('✅ Updated monitored_projects table successfully!');
    console.log('\nAdded columns:');
    console.log('- last_monitored (for round-robin monitoring)');
    console.log('- alert_threshold (minimum score for notifications)');
    console.log('\nAdded projects:');
    console.log('- Kaspa (@KaspaCurrency)');
    console.log('- Bittensor (@bittensor_)');

  } catch (error) {
    console.error('❌ Error updating table:', error.message);
  }
}

updateMonitoredProjects();