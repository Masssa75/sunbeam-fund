#!/usr/bin/env node

require('dotenv').config();

const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fixCronJobHeaders() {
  console.log('🔧 Fixing cron job headers...\n');

  try {
    // First get the current job config
    const getResponse = await fetch(`https://api.cron-job.org/jobs/6263644`, {
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`
      }
    });

    if (!getResponse.ok) {
      throw new Error('Failed to get current job config');
    }

    const currentJob = await getResponse.json();
    console.log('Current job status:', currentJob.jobDetails?.enabled ? 'Enabled' : 'Disabled');
    
    // Update the job with correct headers
    const updatePayload = {
      job: {
        url: "https://gualxudgbmpuhjbumfeh.supabase.co/functions/v1/monitor-projects",
        enabled: true,
        title: "Sunbeam Twitter Monitor",
        saveResponses: true,
        schedule: {
          timezone: "UTC",
          hours: [-1],
          mdays: [-1],
          minutes: [-1],
          months: [-1],
          wdays: [-1],
          expiresAt: 0
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
        extendedData: {
          headers: [
            `x-cron-key: ${CRONJOB_API_KEY}`,
            'Content-Type: application/json'
          ],
          body: '{}'
        }
      }
    };

    console.log('\nUpdating job with headers:');
    updatePayload.job.extendedData.headers.forEach(h => console.log(`  - ${h.split(':')[0]}`));

    const updateResponse = await fetch(`https://api.cron-job.org/jobs/6263644`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update job: ${error}`);
    }

    console.log('\n✅ Cron job headers fixed!');
    console.log('The job should now authenticate correctly with the Edge Function.');
    console.log('\n🎯 Next execution should succeed. Monitor at:');
    console.log('https://console.cron-job.org/jobs');
    
    // Verify the update
    const verifyResponse = await fetch(`https://api.cron-job.org/jobs/6263644`, {
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`
      }
    });
    
    if (verifyResponse.ok) {
      const updatedJob = await verifyResponse.json();
      console.log('\n📋 Verification:');
      console.log(`- Headers set: ${updatedJob.jobDetails?.extendedData?.headers?.length > 0 ? 'Yes' : 'No'}`);
      console.log(`- Request method: ${updatedJob.jobDetails?.requestMethod === 1 ? 'POST' : 'GET'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixCronJobHeaders();