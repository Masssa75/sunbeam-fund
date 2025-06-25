#!/usr/bin/env node

const https = require('https');
require('dotenv').config();

const apiKey = process.env.CRONJOB_API_KEY;
const jobId = '6263909'; // Current job ID

console.log('🛑 Temporarily disabling cron job to fix duplicate issue...\n');

// Disable the job
const data = JSON.stringify({
  job: {
    enabled: false
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
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Cron job disabled successfully!');
      console.log('This prevents more duplicates while we fix the logic.');
      console.log('\nNext steps:');
      console.log('1. Fix duplicate detection in nitter-search function');
      console.log('2. Add proper atomic insert logic');
      console.log('3. Re-enable with safer frequency (every 5 minutes)');
    } else {
      console.error('❌ Failed to disable job:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
});

req.write(data);
req.end();