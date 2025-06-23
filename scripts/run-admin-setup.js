#!/usr/bin/env node

/**
 * Script to set up admin users via Supabase Management API
 */

const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_ID = process.env.SUPABASE_PROJECT_ID;

async function runAdminSetup() {
  console.log('Setting up admin users...');
  
  // Read SQL file
  const sql = fs.readFileSync('./scripts/setup-admin.sql', 'utf8');
  
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error running admin setup:', error);
    return;
  }

  const result = await response.json();
  console.log('✅ Admin setup completed successfully!');
  console.log('- Created admin_users table');
  console.log('- Added marc@cyrator.com as admin');
  console.log('- Created is_admin() function');
  
  return result;
}

runAdminSetup().catch(console.error);