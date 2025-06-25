#!/usr/bin/env node

require('dotenv').config();

const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY;

async function debugCronJobAPI() {
  console.log('🔍 Debugging cron-job.org API...\n');

  if (!CRONJOB_API_KEY) {
    console.error('❌ CRONJOB_API_KEY not found in .env');
    return;
  }

  try {
    // List all jobs
    const listResponse = await fetch('https://api.cron-job.org/jobs', {
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`
      }
    });

    console.log(`List Jobs Response Status: ${listResponse.status} ${listResponse.statusText}`);
    
    const responseText = await listResponse.text();
    console.log('\nRaw Response:');
    console.log(responseText.substring(0, 500));
    
    try {
      const result = JSON.parse(responseText);
      console.log('\nParsed Response:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.jobs) {
        console.log(`\nFound ${result.jobs.length} jobs`);
        result.jobs.forEach((job, index) => {
          console.log(`\nJob ${index + 1}:`);
          console.log(`- ID: ${job.jobId}`);
          console.log(`- Title: ${job.job?.title || 'No title'}`);
          console.log(`- URL: ${job.job?.url || 'No URL'}`);
        });
      }
    } catch (parseError) {
      console.log('\n❌ Failed to parse as JSON');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugCronJobAPI();