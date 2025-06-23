#!/usr/bin/env node

/**
 * Script to add environment variables to Netlify
 * Opens the Netlify dashboard to manually add the required Supabase environment variables
 */

const { exec } = require('child_process');

console.log('Opening Netlify dashboard to add environment variables...');
console.log('Site: starlit-mousse-8fa18a');

// Open the environment variables page
exec('open https://app.netlify.com/sites/starlit-mousse-8fa18a/settings/env', (error) => {
  if (error) {
    console.error('Error opening Netlify dashboard:', error);
    return;
  }
  
  console.log('\nNetlify dashboard opened successfully!');
  console.log('\nPlease add these environment variables:');
  console.log('\n1. NEXT_PUBLIC_SUPABASE_URL');
  console.log('   Value: https://gualxudgbmpuhjbumfeh.supabase.co');
  console.log('\n2. NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM');
  console.log('\nAfter adding these variables:');
  console.log('1. Click "Save"');
  console.log('2. Trigger a new deploy to apply the changes');
  console.log('3. The site should work properly with authentication enabled');
});