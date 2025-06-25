#!/usr/bin/env node

require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY;

async function testMonitorEndpoint() {
  console.log('🧪 Testing monitor-projects endpoint...\n');
  
  const monitorUrl = `${SUPABASE_URL}/functions/v1/monitor-projects`;
  console.log(`URL: ${monitorUrl}`);
  
  try {
    // Test 1: With x-cron-key header
    console.log('\n1️⃣ Testing with x-cron-key header...');
    const response1 = await fetch(monitorUrl, {
      method: 'POST',
      headers: {
        'x-cron-key': CRONJOB_API_KEY,
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    
    console.log(`Status: ${response1.status} ${response1.statusText}`);
    const text1 = await response1.text();
    console.log('Response:', text1);
    
    // Test 2: With Authorization header
    console.log('\n2️⃣ Testing with Authorization header...');
    const response2 = await fetch(monitorUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    
    console.log(`Status: ${response2.status} ${response2.statusText}`);
    const text2 = await response2.text();
    console.log('Response:', text2);
    
    // Test 3: With both headers (like cron-job.org should send)
    console.log('\n3️⃣ Testing with both headers (cron-job.org style)...');
    const response3 = await fetch(monitorUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'x-cron-key': CRONJOB_API_KEY
      },
      body: '{}'
    });
    
    console.log(`Status: ${response3.status} ${response3.statusText}`);
    const text3 = await response3.text();
    console.log('Response:', text3);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMonitorEndpoint();