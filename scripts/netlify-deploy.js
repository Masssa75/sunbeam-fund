#!/usr/bin/env node

const { execSync } = require('child_process');
require('dotenv').config();

console.log('🚀 Deploying to Netlify with token...\n');

if (!process.env.NETLIFY_TOKEN) {
  console.error('❌ NETLIFY_TOKEN not found in .env');
  process.exit(1);
}

try {
  // Set the auth token
  execSync(`netlify login --auth ${process.env.NETLIFY_TOKEN}`, { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('✅ Authenticated with Netlify\n');
  
  // Link to existing site or create new one
  console.log('Creating new Netlify site...');
  const output = execSync('netlify sites:create --name sunbeam-fund', {
    encoding: 'utf-8',
    env: { ...process.env, NETLIFY_AUTH_TOKEN: process.env.NETLIFY_TOKEN }
  });
  
  console.log(output);
  
  // Deploy
  console.log('\n📦 Deploying to production...');
  execSync('netlify deploy --prod --build', {
    stdio: 'inherit',
    env: { ...process.env, NETLIFY_AUTH_TOKEN: process.env.NETLIFY_TOKEN }
  });
  
} catch (error) {
  if (error.message.includes('already exists')) {
    console.log('Site already exists, deploying to existing site...');
    execSync('netlify link --name sunbeam-fund', {
      stdio: 'inherit',
      env: { ...process.env, NETLIFY_AUTH_TOKEN: process.env.NETLIFY_TOKEN }
    });
    execSync('netlify deploy --prod --build', {
      stdio: 'inherit',
      env: { ...process.env, NETLIFY_AUTH_TOKEN: process.env.NETLIFY_TOKEN }
    });
  } else {
    console.error('Error:', error.message);
  }
}