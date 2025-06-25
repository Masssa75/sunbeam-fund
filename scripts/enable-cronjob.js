#!/usr/bin/env node

require('dotenv').config();

const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY;

async function enableCronJob() {
  console.log('🕐 Enabling Twitter monitoring cron job...\n');

  try {
    // First list jobs to find ours
    const listResponse = await fetch('https://api.cron-job.org/jobs', {
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`
      }
    });

    if (!listResponse.ok) {
      throw new Error('Failed to list jobs');
    }

    const result = await listResponse.json();
    const sunbeamJob = result.jobs?.find(job => 
      job.job.title === 'Sunbeam Twitter Monitor'
    );

    if (!sunbeamJob) {
      console.error('❌ Sunbeam Twitter Monitor job not found');
      return;
    }

    console.log(`Found job ID: ${sunbeamJob.jobId}`);
    console.log(`Current status: ${sunbeamJob.job.enabled ? 'Enabled' : 'Disabled'}`);

    if (sunbeamJob.job.enabled) {
      console.log('✅ Job is already enabled!');
      return;
    }

    // Enable the job
    const enableUrl = `https://api.cron-job.org/jobs/${sunbeamJob.jobId}`;
    const updatedJob = { ...sunbeamJob.job, enabled: true };

    const enableResponse = await fetch(enableUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ job: updatedJob })
    });

    if (!enableResponse.ok) {
      const error = await enableResponse.text();
      throw new Error(`Failed to enable: ${error}`);
    }

    console.log('✅ Cron job enabled successfully!');
    console.log('\n🎯 Twitter monitoring is now running:');
    console.log('   - Checks one project per minute');
    console.log('   - Kaspa and Bittensor are being monitored');
    console.log('   - High importance tweets (score ≥7) will trigger Telegram alerts');
    console.log('\n📌 Monitor at: https://console.cron-job.org/jobs');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

enableCronJob();