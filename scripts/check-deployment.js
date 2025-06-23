#!/usr/bin/env node

const https = require('https');

console.log('🔍 Checking possible Netlify URLs for Sunbeam Fund...\n');

const possibleUrls = [
  'https://sunbeam-fund.netlify.app',
  'https://sunbeam.netlify.app',
  'https://sunbeamfund.netlify.app'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ FOUND: ${url} is live!`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Headers:`, res.headers['x-powered-by'] || 'Netlify');
        resolve(true);
      } else {
        console.log(`❌ ${url} - Status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`❌ ${url} - Error: ${err.message}`);
      resolve(false);
    });
  });
}

async function checkAll() {
  console.log('Checking URLs...\n');
  
  for (const url of possibleUrls) {
    const found = await checkUrl(url);
    if (found) {
      console.log('\n🎉 Your app is live at:', url);
      console.log('\n📱 Features available:');
      console.log('   - Portfolio management');
      console.log('   - Live crypto prices');
      console.log('   - Report generation');
      console.log('   - Data persistence\n');
      return;
    }
  }
  
  console.log('\n💡 If none of these work, check your Netlify dashboard at:');
  console.log('   https://app.netlify.com/teams/YOUR_TEAM/sites\n');
  console.log('The URL will be shown there!\n');
}

checkAll();