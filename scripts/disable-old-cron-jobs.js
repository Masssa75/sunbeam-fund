#!/usr/bin/env node

require('dotenv').config();
const https = require('https');

const apiKey = process.env.CRONJOB_API_KEY;

if (!apiKey) {
  console.error('❌ Missing CRONJOB_API_KEY in .env file');
  process.exit(1);
}

// Disable these old cron jobs that don't have correct auth
const jobsToDisable = [6263656, 6263667];

function disableCronJob(jobId) {
  return new Promise((resolve, reject) => {
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

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (res.statusCode === 200) {
            console.log(`✅ Disabled job ${jobId}`);
            resolve(result);
          } else {
            console.error(`❌ Failed to disable job ${jobId}:`, result);
            reject(new Error(`Failed to disable job ${jobId}`));
          }
        } catch (e) {
          console.error(`❌ Error disabling job ${jobId}:`, e.message);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Request failed for job ${jobId}: ${e.message}`);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function disableOldJobs() {
  console.log('🔧 Disabling old duplicate cron jobs...\n');
  
  for (const jobId of jobsToDisable) {
    try {
      await disableCronJob(jobId);
    } catch (error) {
      console.error(`Failed to disable job ${jobId}:`, error.message);
    }
  }
  
  console.log('\n✅ Cleanup complete!');
  console.log('📋 Active job: 6263672 (Sunbeam Fund - Monitor Crypto Projects)');
}

disableOldJobs();