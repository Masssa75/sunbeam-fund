#!/usr/bin/env node

require('dotenv').config();

const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!CRONJOB_API_KEY || !SUPABASE_URL || !ANON_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function setupCronJob() {
  console.log('🕐 Setting up cron job for Twitter monitoring...\n');

  const monitorUrl = `${SUPABASE_URL}/functions/v1/monitor-projects`;
  
  // First check existing jobs
  console.log('📋 Checking for existing Sunbeam Twitter Monitor job...');
  
  try {
    const listResponse = await fetch('https://api.cron-job.org/jobs', {
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`
      }
    });

    if (listResponse.ok) {
      const result = await listResponse.json();
      const existingJob = result.jobs?.find(job => 
        job.job.title === 'Sunbeam Twitter Monitor' ||
        job.job.url === monitorUrl
      );

      if (existingJob) {
        console.log('✅ Cron job already exists!');
        console.log(`   Job ID: ${existingJob.jobId}`);
        console.log(`   Enabled: ${existingJob.job.enabled}`);
        console.log(`   Last run: ${existingJob.history?.lastExecution || 'Never'}`);
        return;
      }
    }
  } catch (error) {
    console.log('Could not check existing jobs, proceeding with creation...');
  }

  // Create new cron job
  const cronJobConfig = {
    job: {
      url: monitorUrl,
      enabled: true,
      saveResponses: true,
      schedule: {
        timezone: 'UTC',
        hours: [-1],    // Every hour
        mdays: [-1],    // Every day
        minutes: [-1],  // Every minute
        months: [-1],   // Every month
        wdays: [-1]     // Every weekday
      },
      requestTimeout: 30,
      redirectSuccess: true,
      auth: {
        enable: false
      },
      notification: {
        onFailure: true,
        onSuccess: false,
        onDisable: true
      },
      requestMethod: 1, // POST
      postData: '{}',
      httpHeaders: [
        `Authorization: Bearer ${ANON_KEY}`,
        'Content-Type: application/json',
        `x-cron-key: ${CRONJOB_API_KEY}`
      ],
      title: 'Sunbeam Twitter Monitor',
      description: 'Monitors Twitter for portfolio projects every minute'
    }
  };

  try {
    const response = await fetch('https://api.cron-job.org/jobs', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cronJobConfig)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API responded with ${response.status}: ${error}`);
    }

    const result = await response.json();
    
    console.log('✅ Cron job created successfully!');
    console.log(`   Job ID: ${result.jobId}`);
    console.log(`   URL: ${monitorUrl}`);
    console.log('   Schedule: Every minute');
    console.log(`   Status: ${result.job?.enabled ? 'Enabled' : 'Disabled'}`);
    
    console.log('\n📌 Monitor at: https://console.cron-job.org/jobs');
    console.log('\n🎯 Twitter monitoring is now active!');
    console.log('   - Monitors one project per minute (round-robin)');
    console.log('   - High importance tweets will be sent to Telegram');
    console.log('   - Check Supabase logs for activity');

  } catch (error) {
    console.error('❌ Failed to create cron job:', error.message);
  }
}

setupCronJob();