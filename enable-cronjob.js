#!/usr/bin/env node

const https = require('https');
require('dotenv').config();

const apiKey = process.env.CRONJOB_API_KEY;
const jobId = '6263909';

console.log('✅ Re-enabling cron job...\n');

const data = JSON.stringify({
  job: {
    enabled: true
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
      console.log('✅ Cron job re-enabled successfully!');
      console.log('Monitoring will resume immediately.');
    } else {
      console.error('❌ Failed to enable job:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
});

req.write(data);
req.end();