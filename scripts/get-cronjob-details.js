#!/usr/bin/env node

require('dotenv').config();

const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY;

async function getCronJobDetails() {
  console.log('🔍 Getting detailed cron job configuration...\n');

  try {
    // Get the specific job
    const response = await fetch(`https://api.cron-job.org/jobs/6263656`, {
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get job: ${response.status}`);
    }

    const job = await response.json();
    
    console.log('📋 Full Job Configuration:');
    console.log(JSON.stringify(job, null, 2));
    
    // Extract key details
    console.log('\n🔑 Key Details:');
    console.log(`- URL: ${job.job?.url}`);
    console.log(`- Request Method: ${job.job?.requestMethod === 1 ? 'POST' : 'GET'}`);
    console.log(`- Post Data: ${job.job?.postData || 'None'}`);
    
    if (job.job?.httpHeaders && job.job.httpHeaders.length > 0) {
      console.log('\n📨 HTTP Headers:');
      job.job.httpHeaders.forEach(header => {
        console.log(`  - ${header}`);
      });
    } else {
      console.log('\n❌ No HTTP headers configured!');
    }
    
    if (job.job?.auth?.enable) {
      console.log('\n🔐 Basic Auth:');
      console.log(`  - Username: ${job.job.auth.user || 'None'}`);
      console.log(`  - Password: ${job.job.auth.password ? '[Set]' : '[Not Set]'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getCronJobDetails();