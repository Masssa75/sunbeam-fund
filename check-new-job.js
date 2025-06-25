#!/usr/bin/env node

const https = require('https');
require('dotenv').config();

const apiKey = process.env.CRONJOB_API_KEY;
const jobId = '6263909'; // From the created job

console.log('📋 Fetching Sunbeam cron job execution logs...\n');

// Get job history
const options = {
  hostname: 'api.cron-job.org',
  port: 443,
  path: `/jobs/${jobId}/history`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
};

https.get(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.history && result.history.length > 0) {
        console.log(`Found ${result.history.length} execution records:\n`);
        
        // Show recent executions
        result.history.slice(0, 5).forEach((execution, index) => {
          console.log(`${index + 1}. ${new Date(execution.date * 1000).toLocaleString()}`);
          console.log(`   Status: ${execution.status.status}`);
          console.log(`   HTTP Status: ${execution.httpStatus}`);
          console.log(`   Duration: ${execution.duration}ms`);
          console.log('');
        });
        
        // Get details of the most recent execution
        const latest = result.history[0];
        console.log(`Getting details for latest execution...`);
        
        const detailOptions = {
          ...options,
          path: `/jobs/${jobId}/history/${latest.identifier}`
        };
        
        https.get(detailOptions, (detailRes) => {
          let detailData = '';
          
          detailRes.on('data', (chunk) => {
            detailData += chunk;
          });
          
          detailRes.on('end', () => {
            try {
              const details = JSON.parse(detailData);
              console.log('Latest execution response:');
              console.log('Headers sent:', JSON.stringify(details.headers, null, 2));
              if (details.body) {
                console.log('\nResponse body:', details.body);
              }
            } catch (e) {
              console.error('Error parsing details:', e.message);
            }
          });
        });
      } else {
        console.log('No execution history found yet. The job may not have run yet.');
        console.log('Wait 1-2 minutes and try again.');
      }
    } catch (e) {
      console.error('Error:', e.message);
      console.log('Raw response:', data);
    }
  });
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
});