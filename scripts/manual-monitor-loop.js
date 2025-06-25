const fetch = require('node-fetch');

let intervalCount = 0;
const maxIntervals = 5; // Run for 5 minutes to test

async function callMonitorFunction() {
  intervalCount++;
  console.log(`\n=== Monitor Call #${intervalCount} at ${new Date().toLocaleTimeString()} ===`);
  
  try {
    const response = await fetch('https://gualxudgbmpuhjbumfeh.supabase.co/functions/v1/monitor-projects', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4',
        'Content-Type': 'application/json'
      },
      body: '{}'
    });

    const result = await response.text();
    console.log(`✅ Status: ${response.status}`);
    console.log(`Response: ${result}`);
    
    if (intervalCount >= maxIntervals) {
      console.log('\n🏁 Manual monitoring test completed!');
      clearInterval(monitorInterval);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

console.log('🚀 Starting manual monitor loop (every 60 seconds for 5 minutes)...');
console.log('This simulates what a cron job would do.\n');

// Call immediately, then every minute
callMonitorFunction();
const monitorInterval = setInterval(callMonitorFunction, 60000);

// Cleanup after max time
setTimeout(() => {
  clearInterval(monitorInterval);
  console.log('\n⏰ Test timeout reached - stopping manual monitoring');
}, (maxIntervals + 1) * 60000);