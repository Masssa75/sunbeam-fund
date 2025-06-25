const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function setupCronJob() {
  const cronApiKey = process.env.CRONJOB_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!cronApiKey || !supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables');
    return;
  }
  
  const monitorUrl = `${supabaseUrl}/functions/v1/monitor-projects`;
  
  try {
    // Create new cron job
    const response = await fetch('https://cron-job.org/api/1/jobs', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${cronApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        job: {
          url: monitorUrl,
          enabled: true,
          title: 'Sunbeam Twitter Monitor',
          saveResponses: true,
          schedule: {
            timezone: 'UTC',
            expiresAt: 0,
            hours: [-1], // Every hour
            mdays: [-1], // Every day
            minutes: [-1], // Every minute
            months: [-1], // Every month
            wdays: [-1] // Every weekday
          },
          requestMethod: 0, // POST
          auth: {
            enable: true,
            user: '',
            password: serviceRoleKey
          },
          notification: {
            onFailure: false,
            onSuccess: false,
            onDisable: false
          },
          extendedData: {
            headers: [
              'Authorization: Bearer ' + serviceRoleKey,
              'Content-Type: application/json'
            ]
          }
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create cron job: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    console.log('✅ Cron job created successfully!');
    console.log(`Job ID: ${result.jobId}`);
    console.log(`URL: ${monitorUrl}`);
    console.log('Schedule: Every minute');
    console.log('\nThe cron job will monitor one Twitter project per minute.');
    console.log('Current projects: Kaspa and Bittensor');
    
    // Save the job ID
    console.log('\n📝 Please update CLAUDE.md with the new cron job ID:', result.jobId);
    
  } catch (error) {
    console.error('❌ Error creating cron job:', error.message);
  }
}

setupCronJob();