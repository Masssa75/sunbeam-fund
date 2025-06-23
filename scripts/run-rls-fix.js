#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_ID = process.env.SUPABASE_PROJECT_ID;

async function fixRLSPolicies() {
  console.log('Fixing RLS policies...');
  
  // Read SQL file
  const sql = fs.readFileSync('./scripts/fix-rls-policies.sql', 'utf8');
  
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
    console.error('Error fixing RLS policies:', error);
    return;
  }

  const result = await response.json();
  console.log('✅ RLS policies fixed successfully!');
  console.log('- Enabled RLS on all tables');
  console.log('- Created policies for authenticated users');
  console.log('- You should now be able to add positions');
  
  return result;
}

fixRLSPolicies().catch(console.error);