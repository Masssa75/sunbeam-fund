#!/usr/bin/env node

const https = require('https');
require('dotenv').config();

const apiKey = process.env.CRONJOB_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cronSecret = process.env.CRON_SECRET_KEY;
const jobId = '6263901'; // Our new job

console.log('🔧 Updating cron job headers...\n');

// Read the current job config
const getOptions = {
  hostname: 'api.cron-job.org',
  port: 443,
  path: `/jobs/${jobId}`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
};

https.get(getOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const job = JSON.parse(data).job;
      
      // Update the headers with correct format
      job.extendedData = {
        headers: {
          'x-cron-key': cronSecret,
          'Content-Type': 'application/json'
        }
      };
      
      // Update the job
      const updateData = JSON.stringify({ job });
      
      const updateOptions = {
        hostname: 'api.cron-job.org',
        port: 443,
        path: `/jobs/${jobId}`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': updateData.length
        }
      };

      const req = https.request(updateOptions, (updateRes) => {
        let responseData = '';
        updateRes.on('data', chunk => responseData += chunk);
        updateRes.on('end', () => {
          if (updateRes.statusCode === 200) {
            console.log('✅ Cron job headers updated successfully!');
            console.log('Headers now include:');
            console.log(`- x-cron-key: ${cronSecret}`);
            console.log('- Content-Type: application/json');
          } else {
            console.error('❌ Failed to update job:', responseData);
          }
        });
      });

      req.on('error', (e) => {
        console.error(`❌ Update request failed: ${e.message}`);
      });

      req.write(updateData);
      req.end();
      
    } catch (e) {
      console.error('Error parsing job config:', e.message);
    }
  });
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
});