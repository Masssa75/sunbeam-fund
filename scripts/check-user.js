#!/usr/bin/env node

const fetch = require('node-fetch');
require('dotenv').config();

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_ID = process.env.SUPABASE_PROJECT_ID;

async function checkUser() {
  console.log('Checking for user marc@cyrator.com...');
  
  // Query to check if user exists
  const query = `
    SELECT * FROM auth.users 
    WHERE email = 'marc@cyrator.com'
    LIMIT 1;
  `;
  
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error checking user:', error);
    return;
  }

  const result = await response.json();
  console.log('Query result:', result);
  
  if (result.length === 0) {
    console.log('❌ User marc@cyrator.com does not exist in auth.users table');
    console.log('You need to sign up first before you can sign in!');
  } else {
    console.log('✅ User marc@cyrator.com exists');
  }
}

checkUser().catch(console.error);