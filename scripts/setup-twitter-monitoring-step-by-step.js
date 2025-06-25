const fs = require('fs');
const path = require('path');

async function executeSQL(sql, description) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const projectId = process.env.SUPABASE_PROJECT_ID;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  console.log(`\n📦 ${description}...`);

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

    console.log(`✅ ${description} - Success!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Error:`, error.message);
    return false;
  }
}

async function setupTwitterMonitoring() {
  console.log('Setting up Twitter monitoring tables for Sunbeam Fund...');

  // Step 1: Create monitored_projects table
  const createMonitoredProjectsSQL = `
    CREATE TABLE IF NOT EXISTS monitored_projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id TEXT NOT NULL UNIQUE,
      project_name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      twitter_handle TEXT,
      alert_threshold INTEGER DEFAULT 7,
      is_active BOOLEAN DEFAULT true,
      last_monitored TIMESTAMP WITH TIME ZONE,
      monitoring_config JSONB DEFAULT '{"check_official": true, "check_mentions": true}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  await executeSQL(createMonitoredProjectsSQL, 'Creating monitored_projects table');

  // Step 2: Create indexes for monitored_projects
  const createMonitoredProjectsIndexes = `
    CREATE INDEX IF NOT EXISTS idx_monitored_projects_active_last ON monitored_projects(is_active, last_monitored);
    CREATE INDEX IF NOT EXISTS idx_monitored_projects_project_id ON monitored_projects(project_id);
  `;
  
  await executeSQL(createMonitoredProjectsIndexes, 'Creating indexes for monitored_projects');

  // Step 3: Create tweet_analyses table
  const createTweetAnalysesSQL = `
    CREATE TABLE IF NOT EXISTS tweet_analyses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id TEXT NOT NULL,
      tweet_id TEXT NOT NULL,
      tweet_text TEXT NOT NULL,
      author TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      importance_score INTEGER DEFAULT 5,
      category TEXT DEFAULT 'general',
      summary TEXT,
      url TEXT,
      is_ai_analyzed BOOLEAN DEFAULT false,
      analysis_metadata JSONB,
      UNIQUE(project_id, tweet_id)
    );
  `;
  
  await executeSQL(createTweetAnalysesSQL, 'Creating tweet_analyses table');

  // Step 4: Create indexes for tweet_analyses
  const createTweetAnalysesIndexes = `
    CREATE INDEX IF NOT EXISTS idx_tweet_analyses_project_id ON tweet_analyses(project_id);
    CREATE INDEX IF NOT EXISTS idx_tweet_analyses_created_at ON tweet_analyses(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tweet_analyses_importance ON tweet_analyses(importance_score DESC);
  `;
  
  await executeSQL(createTweetAnalysesIndexes, 'Creating indexes for tweet_analyses');

  // Step 5: Create RLS policies
  const createRLSPolicies = `
    ALTER TABLE monitored_projects ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tweet_analyses ENABLE ROW LEVEL SECURITY;

    CREATE POLICY IF NOT EXISTS "Admins can manage monitored projects" ON monitored_projects
      FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

    CREATE POLICY IF NOT EXISTS "Service role has full access to monitored projects" ON monitored_projects
      FOR ALL USING (auth.role() = 'service_role');

    CREATE POLICY IF NOT EXISTS "Tweet analyses are publicly readable" ON tweet_analyses
      FOR SELECT USING (true);

    CREATE POLICY IF NOT EXISTS "Service role manages tweet analyses" ON tweet_analyses
      FOR ALL USING (auth.role() = 'service_role');
  `;
  
  await executeSQL(createRLSPolicies, 'Creating RLS policies');

  // Step 6: Create helper functions
  const createFunctions = `
    CREATE OR REPLACE FUNCTION get_oldest_monitored_project()
    RETURNS TABLE (
      id UUID,
      project_id TEXT,
      project_name TEXT,
      symbol TEXT,
      twitter_handle TEXT,
      alert_threshold INTEGER
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT m.id, m.project_id, m.project_name, m.symbol, m.twitter_handle, m.alert_threshold
      FROM monitored_projects m
      WHERE m.is_active = true
      ORDER BY m.last_monitored ASC NULLS FIRST
      LIMIT 1;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION update_last_monitored(p_project_id TEXT)
    RETURNS void AS $$
    BEGIN
      UPDATE monitored_projects
      SET last_monitored = NOW()
      WHERE project_id = p_project_id;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  await executeSQL(createFunctions, 'Creating helper functions');

  // Step 7: Add Kaspa as first monitored project
  const addKaspa = `
    INSERT INTO monitored_projects (
      project_id, project_name, symbol, twitter_handle, alert_threshold
    ) VALUES (
      'kaspa', 'Kaspa', 'kas', 'KaspaCurrency', 7
    ) ON CONFLICT (project_id) DO UPDATE SET
      twitter_handle = 'KaspaCurrency',
      alert_threshold = 7;
  `;
  
  await executeSQL(addKaspa, 'Adding Kaspa to monitored projects');

  console.log('\n🎉 Twitter monitoring setup complete!');
  console.log('\nNext steps:');
  console.log('1. Copy nitter-search Edge Function from Porta');
  console.log('2. Set ScraperAPI key as Edge Function secret');
  console.log('3. Deploy the Edge Functions');
  console.log('4. Test with Kaspa first');
}

// Run the setup
setupTwitterMonitoring();