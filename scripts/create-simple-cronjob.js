const fetch = require('node-fetch');

async function createSimpleCronJob() {
  console.log('🚀 Creating simple cron job...');
  
  const jobData = {
    job: {
      url: 'https://gualxudgbmpuhjbumfeh.supabase.co/functions/v1/monitor-projects',
      enabled: true,
      saveResponses: true,
      schedule: {
        timezone: 'UTC',
        hours: [-1],  // Every hour
        mdays: [-1],  // Every day
        minutes: [-1], // Every minute
        months: [-1], // Every month
        wdays: [-1]   // Every weekday
      },
      requestMethod: 1, // POST
      extendedData: {
        headers: {
          '1': 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4',
          '2': 'Content-Type: application/json'
        },
        body: '{}'
      },
      title: 'Sunbeam Twitter Monitor - Service Role'
    }
  };

  try {
    const response = await fetch('https://api.cron-job.org/v1/jobs', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer nZpJCLMODiKTZTtdZfm8zOIrOzgcZN',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
    });

    console.log('Response status:', response.status);
    const result = await response.text();
    console.log('Response:', result);

    if (response.ok) {
      console.log('✅ Cron job created successfully!');
    } else {
      console.log('❌ Failed to create cron job');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createSimpleCronJob();