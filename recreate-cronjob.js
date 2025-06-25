#!/usr/bin/env node

const https = require('https');
require('dotenv').config();

const apiKey = process.env.CRONJOB_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cronSecret = process.env.CRON_SECRET_KEY;
const oldJobId = '6263901';

console.log('🔄 Recreating cron job with correct headers...\n');

// Delete the old job first
function deleteOldJob() {
  const deleteOptions = {
    hostname: 'api.cron-job.org',
    port: 443,
    path: `/jobs/${oldJobId}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  };

  const req = https.request(deleteOptions, (res) => {
    console.log(`Deleted old job (status: ${res.statusCode})`);
    createNewJob();
  });

  req.on('error', (e) => {
    console.error(`Delete failed: ${e.message}`);
    createNewJob(); // Try to create anyway
  });

  req.end();
}

// Create new job with correct header format
function createNewJob() {
  const data = JSON.stringify({
    job: {
      url: `${supabaseUrl}/functions/v1/monitor-projects`,
      enabled: true,
      saveResponses: true,
      title: 'Sunbeam - Monitor Crypto Projects',
      requestMethod: 1, // POST
      extendedData: {
        headers: {
          'x-cron-key': cronSecret,
          'Content-Type': 'application/json'
        }
      },
      schedule: {
        timezone: 'UTC',
        minutes: [-1], // Every minute
        hours: [-1],
        mdays: [-1],
        months: [-1],
        wdays: [-1]
      }
    }
  });

  const options = {
    hostname: 'api.cron-job.org',
    port: 443,
    path: '/jobs',
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('🔄 Creating new cron job...');
  
  const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', chunk => responseData += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        if (res.statusCode === 200) {
          console.log('\n✅ New cron job created successfully!');
          console.log(`   Job ID: ${result.jobId}`);
          console.log(`   Headers: x-cron-key and Content-Type`);
          console.log('\n🎉 Monitoring should now work correctly!');
          
          // Update config file
          require('fs').writeFileSync('./cronjob-config.json', JSON.stringify({
            jobId: result.jobId,
            apiKey: apiKey.substring(0, 8) + '...',
            created: new Date().toISOString(),
            url: `${supabaseUrl}/functions/v1/monitor-projects`,
            title: 'Sunbeam - Monitor Crypto Projects'
          }, null, 2));
        } else {
          console.error('❌ Failed to create new job:', result);
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

  req.write(data);
  req.end();
}

// Start the process
deleteOldJob();