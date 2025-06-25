#!/usr/bin/env node

const https = require('https');
require('dotenv').config();

const apiKey = process.env.CRONJOB_API_KEY;
const jobId = '6263672'; // Sunbeam Fund job ID

console.log('🔧 Fixing Sunbeam cron job authentication...\n');

const data = JSON.stringify({
  job: {
    url: 'https://gualxudgbmpuhjbumfeh.supabase.co/functions/v1/monitor-projects',
    enabled: true,
    saveResponses: true,
    title: 'Sunbeam Fund - Monitor Crypto Projects',
    requestMethod: 1, // POST
    extendedData: {
      headers: {
        "1": "x-cron-key: sunbeam-cron-secure-2025",
        "2": "Content-Type: application/json"
      },
      body: ''
    },
    schedule: {
      timezone: 'UTC',
      minutes: [-1], // Every minute
      hours: [-1],
      mdays: [-1],
      months: [-1],
      wdays: [-1]
    },
    requestTimeout: 30
  }
});

const options = {
  hostname: 'api.cron-job.org',
  port: 443,
  path: `/jobs/${jobId}`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      console.log(`Response Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ Sunbeam cron job fixed successfully!');
        console.log('Added missing x-cron-key header for authentication.');
        console.log('\n🔄 The job should work on the next run (within 1 minute)');
        console.log('\n📊 Monitor the job at: https://cron-job.org/en/members/jobs/');
      } else {
        console.error(`❌ Update failed with status ${res.statusCode}`);
        console.error('Response:', responseData);
      }
    } catch (e) {
      console.error('❌ Error:', e.message);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
});

req.write(data);
req.end();