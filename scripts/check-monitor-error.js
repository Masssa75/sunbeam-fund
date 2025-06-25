#!/usr/bin/env node

require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkMonitorError() {
  console.log('🔍 Checking monitor-projects function directly...\n');

  // Test with service role key (which we know works)
  console.log('Testing with service role key...');
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/monitor-projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }

  // Check if nitter-search is the issue
  console.log('\n\nTesting nitter-search directly...');
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/nitter-search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectId: 'kaspa',
        projectName: 'Kaspa',
        symbol: 'kas',
        twitterHandle: 'KaspaCurrency'
      })
    });

    console.log('Nitter search status:', response.status);
    const text = await response.text();
    console.log('Response:', text.substring(0, 500) + '...');
  } catch (error) {
    console.error('Nitter search error:', error);
  }
}

checkMonitorError();