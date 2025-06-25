#!/usr/bin/env node

require('dotenv').config();
const https = require('https');

const apiKey = process.env.CRONJOB_API_KEY;

if (!apiKey) {
  console.error('❌ Missing CRONJOB_API_KEY in .env file');
  process.exit(1);
}

function listCronJobs() {
  const options = {
    hostname: 'api.cron-job.org',
    port: 443,
    path: '/jobs',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        if (res.statusCode === 200) {
          console.log('🕐 Current cron jobs:\n');
          
          if (!result.jobs || result.jobs.length === 0) {
            console.log('   No cron jobs found');
            return;
          }

          result.jobs.forEach((job) => {
            const status = job.enabled ? '✅ Enabled' : '❌ Disabled';
            const url = job.url;
            const lastExecution = job.lastExecution ? new Date(job.lastExecution.date).toLocaleString() : 'Never';
            
            console.log(`📋 Job ID: ${job.jobId}`);
            console.log(`   Title: ${job.title}`);
            console.log(`   Status: ${status}`);
            console.log(`   URL: ${url}`);
            console.log(`   Last Run: ${lastExecution}`);
            
            if (job.lastExecution) {
              console.log(`   Last Status: ${job.lastExecution.statusCode} - ${job.lastExecution.duration}ms`);
            }
            
            console.log();
          });
        } else {
          console.error('❌ Failed to list cron jobs:');
          console.error(result);
        }
      } catch (e) {
        console.error('❌ Error:', e.message);
        console.error('Response:', responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request failed: ${e.message}`);
  });

  req.end();
}

console.log('🔍 Fetching cron job list...\n');
listCronJobs();