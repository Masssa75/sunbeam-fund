#!/usr/bin/env node

require('dotenv').config();

const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!CRONJOB_API_KEY) {
  console.error('❌ CRONJOB_API_KEY not found in .env');
  process.exit(1);
}

async function setupCronJob() {
  console.log('🕐 Setting up cron job for Twitter monitoring...\n');

  const monitorUrl = `${SUPABASE_URL}/functions/v1/monitor-projects`;
  
  // Cron-job.org API endpoint
  const cronApiUrl = 'https://api.cron-job.org/jobs';
  
  const cronJobConfig = {
    job: {
      url: monitorUrl,
      enabled: true,
      saveResponses: true,
      schedule: {
        timezone: 'UTC',
        hours: [-1], // Every hour
        mdays: [-1], // Every day
        minutes: [0], // Every minute (by using -1 for minutes, it runs every minute)
        months: [-1], // Every month
        wdays: [-1]  // Every weekday
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

  // For every minute, we need to adjust the schedule
  cronJobConfig.job.schedule.minutes = [-1]; // This means every minute

  try {
    const response = await fetch(cronApiUrl, {
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
    console.log('\nJob details:');
    console.log(`- Job ID: ${result.jobId}`);
    console.log(`- URL: ${monitorUrl}`);
    console.log('- Schedule: Every minute');
    console.log(`- Status: ${result.job?.enabled ? 'Enabled' : 'Disabled'}`);
    
    console.log('\n📌 Monitor your cron job at:');
    console.log('https://console.cron-job.org/jobs');
    
    console.log('\n⚠️  IMPORTANT:');
    console.log('1. Make sure the Edge Functions are deployed first');
    console.log('2. The monitor function will check one project per minute');
    console.log('3. Watch the Supabase logs to see activity');
    console.log('4. Adjust alert_threshold in monitored_projects table as needed');

  } catch (error) {
    console.error('❌ Failed to create cron job:', error.message);
    console.error('\nYou can manually create it at https://console.cron-job.org');
    console.error(`URL to monitor: ${monitorUrl}`);
    console.error('Headers needed:');
    console.error(`- Authorization: Bearer ${ANON_KEY}`);
    console.error('- Content-Type: application/json');
    console.error(`- x-cron-key: ${CRONJOB_API_KEY}`);
  }
}

// Alternative: List existing cron jobs
async function listCronJobs() {
  console.log('\n📋 Checking existing cron jobs...\n');
  
  try {
    const response = await fetch('https://api.cron-job.org/jobs', {
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    const result = await response.json();
    
    if (result.jobs && result.jobs.length > 0) {
      console.log(`Found ${result.jobs.length} cron job(s):`);
      result.jobs.forEach(job => {
        console.log(`\n- ${job.job.title || 'Untitled'}`);
        console.log(`  ID: ${job.jobId}`);
        console.log(`  URL: ${job.job.url}`);
        console.log(`  Enabled: ${job.job.enabled}`);
        console.log(`  Last run: ${job.history?.lastExecution || 'Never'}`);
      });
    } else {
      console.log('No cron jobs found.');
    }
  } catch (error) {
    console.error('❌ Failed to list cron jobs:', error.message);
  }
}

// Run both
async function main() {
  await listCronJobs();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise((resolve) => {
    rl.question('Do you want to create a new cron job? (y/n): ', (answer) => {
      resolve(answer.toLowerCase());
    });
  });
  rl.close();

  if (answer === 'y' || answer === 'yes') {
    await setupCronJob();
  } else {
    console.log('Skipping cron job creation.');
  }
}

main();