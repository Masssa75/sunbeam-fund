#!/usr/bin/env node

const https = require('https');
require('dotenv').config();

console.log('🕐 Setting up cron-job.org for Sunbeam Twitter Monitoring\n');

const apiKey = process.env.CRONJOB_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cronSecret = process.env.CRON_SECRET_KEY;

if (!apiKey) {
  console.error('❌ CRONJOB_API_KEY not found in .env file');
  console.log('Get your API key from: https://cron-job.org/en/members/settings/');
  process.exit(1);
}

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env file');
  process.exit(1);
}

if (!cronSecret) {
  console.error('❌ CRON_SECRET_KEY not found in .env file');
  process.exit(1);
}

// Function to create cron job
function createCronJob() {
  const data = JSON.stringify({
    job: {
      url: `${supabaseUrl}/functions/v1/monitor-projects`,
      enabled: true,
      saveResponses: true,
      title: 'Sunbeam - Monitor Crypto Projects',
      requestMethod: 1, // POST
      extendedData: {
        headers: [
          `x-cron-key: ${cronSecret}`,
          'Content-Type: application/json'
        ]
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

  console.log(`🔄 Creating cron job for: ${supabaseUrl}/functions/v1/monitor-projects`);
  
  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        if (res.statusCode === 200) {
          console.log('\n✅ Cron job created successfully!');
          console.log(`   Job ID: ${result.jobId}`);
          console.log(`   Title: Sunbeam - Monitor Crypto Projects`);
          console.log(`   Schedule: Every minute`);
          console.log(`   URL: ${supabaseUrl}/functions/v1/monitor-projects`);
          console.log('\n🎉 Your Twitter monitoring is now automated!');
          
          // Save config
          require('fs').writeFileSync('./cronjob-config.json', JSON.stringify({
            jobId: result.jobId,
            apiKey: apiKey.substring(0, 8) + '...',
            created: new Date().toISOString(),
            url: `${supabaseUrl}/functions/v1/monitor-projects`,
            title: 'Sunbeam - Monitor Crypto Projects'
          }, null, 2));
          
          console.log('\n📝 Configuration saved to cronjob-config.json');
          console.log('\n⏰ The cron job will start monitoring immediately.');
          console.log('   Check logs in 1-2 minutes to verify it\'s working.');
        } else {
          console.error('\n❌ Failed to create cron job:');
          console.error(`Status: ${res.statusCode}`);
          console.error(result);
        }
      } catch (e) {
        console.error('\n❌ Error parsing response:', e.message);
        console.error('Raw response:', responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`\n❌ Request failed: ${e.message}`);
  });

  req.write(data);
  req.end();
}

// Test the monitor-projects endpoint first
function testEndpoint() {
  console.log('🧪 Testing monitor-projects endpoint...');
  
  const testData = JSON.stringify({});
  const testOptions = {
    hostname: supabaseUrl.replace('https://', '').replace('http://', ''),
    port: 443,
    path: '/functions/v1/monitor-projects',
    method: 'POST',
    headers: {
      'x-cron-key': cronSecret,
      'Content-Type': 'application/json',
      'Content-Length': testData.length
    }
  };

  const testReq = https.request(testOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Endpoint test successful');
        console.log('🔄 Creating cron job...\n');
        createCronJob();
      } else {
        console.error(`❌ Endpoint test failed with status ${res.statusCode}`);
        console.error('Response:', data);
      }
    });
  });

  testReq.on('error', (e) => {
    console.error(`❌ Endpoint test failed: ${e.message}`);
  });

  testReq.write(testData);
  testReq.end();
}

// Start by testing the endpoint
testEndpoint();