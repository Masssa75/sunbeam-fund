#!/usr/bin/env node

require('dotenv').config();

const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

async function createCronJob() {
  console.log('🚀 Creating new cron job with correct headers...\n');

  const monitorUrl = `${SUPABASE_URL}/functions/v1/monitor-projects`;
  
  const cronJobPayload = {
    job: {
      enabled: true,
      title: "Sunbeam Twitter Monitor",
      saveResponses: true,
      url: monitorUrl,
      auth: {
        enable: false,
        user: "",
        password: ""
      },
      notification: {
        onFailure: true,
        onSuccess: false,
        onDisable: true
      },
      extendedData: {
        headers: [
          `x-cron-key: ${CRONJOB_API_KEY}`,
          "Content-Type: application/json"
        ],
        body: "{}"
      },
      type: 0,
      requestTimeout: 30,
      redirectSuccess: true,
      folderId: 0,
      schedule: {
        timezone: "UTC",
        hours: [-1],    // Every hour
        mdays: [-1],    // Every day
        minutes: [-1],  // Every minute
        months: [-1],   // Every month
        wdays: [-1],    // Every weekday
        expiresAt: 0
      },
      requestMethod: 1  // POST
    }
  };

  try {
    console.log(`Creating job for URL: ${monitorUrl}`);
    console.log('Headers to be sent:');
    console.log('  - x-cron-key: [Set]');
    console.log('  - Content-Type: application/json');
    console.log('Request method: POST');
    console.log('Schedule: Every minute\n');

    const response = await fetch('https://api.cron-job.org/jobs', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cronJobPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create job: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Cron job created successfully!');
    console.log(`   Job ID: ${result.jobId}`);
    console.log(`   Status: Enabled`);
    console.log('\n🎯 The monitor-projects function will now receive the correct headers:');
    console.log('   - x-cron-key header for authentication');
    console.log('   - Monitors one project per minute (round-robin)');
    console.log('   - High importance tweets will trigger Telegram alerts');
    console.log('\n📌 Monitor at: https://console.cron-job.org/jobs');
    console.log('\n⚠️  Please update CLAUDE.md with the new job ID:', result.jobId);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createCronJob();