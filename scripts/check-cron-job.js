const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function checkCronJob() {
  const cronApiKey = process.env.CRONJOB_API_KEY;
  const jobId = '6263656'; // Latest cron job ID
  
  if (!cronApiKey) {
    console.error('❌ CRONJOB_API_KEY not found in .env');
    return;
  }
  
  try {
    // Check if job exists
    const response = await fetch(`https://cron-job.org/api/1/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${cronApiKey}`
      }
    });
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch cron job: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error('Response:', text);
      return;
    }
    
    const job = await response.json();
    console.log('📅 Cron Job Details:');
    console.log(`- Job ID: ${job.jobId}`);
    console.log(`- Title: ${job.title}`);
    console.log(`- URL: ${job.url}`);
    console.log(`- Enabled: ${job.enabled}`);
    console.log(`- Schedule: ${job.schedule?.mdays || '*'} ${job.schedule?.months || '*'} ${job.schedule?.wdays || '*'} ${job.schedule?.hours || '*'} ${job.schedule?.minutes || '*'}`);
    console.log(`- Last Status: ${job.lastStatus}`);
    console.log(`- Last Duration: ${job.lastDuration}ms`);
    console.log(`- Last Execution: ${job.lastExecution ? new Date(job.lastExecution * 1000).toLocaleString() : 'Never'}`);
    
    // Check recent history
    const historyResponse = await fetch(`https://cron-job.org/api/1/jobs/${jobId}/history`, {
      headers: {
        'Authorization': `Bearer ${cronApiKey}`
      }
    });
    
    if (historyResponse.ok) {
      const history = await historyResponse.json();
      if (history.history && history.history.length > 0) {
        console.log('\n📊 Recent Executions:');
        history.history.slice(0, 5).forEach(h => {
          const date = new Date(h.date * 1000);
          console.log(`- ${date.toLocaleString()} - Status: ${h.status} - Duration: ${h.duration}ms`);
        });
      }
    }
    
    // If job is disabled, offer to enable it
    if (!job.enabled) {
      console.log('\n⚠️  Cron job is currently DISABLED!');
      console.log('Run this command to enable it:');
      console.log(`node scripts/enable-cron-job.js`);
    }
    
  } catch (error) {
    console.error('❌ Error checking cron job:', error.message);
  }
}

checkCronJob();