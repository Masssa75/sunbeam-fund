#!/usr/bin/env node

/**
 * Script to fix SSL certificate issues on Netlify
 * This opens the Netlify dashboard to manually provision SSL certificate
 */

const { exec } = require('child_process');

console.log('Opening Netlify dashboard to fix SSL certificate...');
console.log('Site: starlit-mousse-8fa18a');
console.log('Domain: sunbeam.capital');

// Open the domain settings page
exec('open https://app.netlify.com/sites/starlit-mousse-8fa18a/settings/domain#https', (error) => {
  if (error) {
    console.error('Error opening Netlify dashboard:', error);
    return;
  }
  
  console.log('\nNetlify dashboard opened successfully!');
  console.log('\nTo fix the SSL issue:');
  console.log('1. Look for the "HTTPS" section');
  console.log('2. Click "Verify DNS configuration" if available');
  console.log('3. Or click "Provision certificate" if the button is shown');
  console.log('4. Wait for the certificate to be provisioned (usually takes 1-2 minutes)');
  console.log('\nIf there are any DNS warnings, make sure:');
  console.log('- sunbeam.capital points to Netlify\'s servers');
  console.log('- No conflicting AAAA records exist');
  console.log('- DNS has fully propagated (can take up to 48 hours)');
});