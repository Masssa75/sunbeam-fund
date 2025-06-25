#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const SCRAPERAPI_KEY = process.env.SCRAPERAPI_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_PROJECT_ID || !SCRAPERAPI_KEY || !GEMINI_API_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Need: SUPABASE_PROJECT_ID, SCRAPERAPI_KEY, GEMINI_API_KEY');
  process.exit(1);
}

console.log('🚀 Deploying Twitter Monitoring Edge Functions to Supabase...\n');

// Check if supabase CLI exists
const supabaseCLI = path.join(__dirname, '..', 'supabase-cli', 'supabase');
const supabaseCmd = supabaseCLI;

async function setSecret(secretName, secretValue) {
  return new Promise((resolve, reject) => {
    console.log(`🔐 Setting secret ${secretName}...`);
    
    const args = [
      'secrets',
      'set',
      secretName,
      '--project-ref',
      SUPABASE_PROJECT_ID
    ];

    const proc = spawn(supabaseCmd, args, {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Send the secret value to stdin
    proc.stdin.write(secretValue);
    proc.stdin.end();

    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (data) => {
      output += data;
    });

    proc.stderr.on('data', (data) => {
      errorOutput += data;
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        console.log(`⚠️  ${secretName} might already be set (this is OK)`);
      } else {
        console.log(`✅ ${secretName} set successfully!`);
      }
      resolve(); // Always resolve, even if already set
    });
  });
}

async function deployFunction(functionName) {
  return new Promise((resolve, reject) => {
    console.log(`\n📦 Deploying ${functionName}...`);
    
    const args = [
      'functions',
      'deploy',
      functionName,
      '--project-ref',
      SUPABASE_PROJECT_ID,
      '--no-verify-jwt'
    ];

    const deploy = spawn(supabaseCmd, args, {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        SCRAPERAPI_KEY: SCRAPERAPI_KEY,
        GEMINI_API_KEY: GEMINI_API_KEY
      }
    });

    let output = '';
    let errorOutput = '';

    deploy.stdout.on('data', (data) => {
      output += data;
      process.stdout.write(data);
    });

    deploy.stderr.on('data', (data) => {
      errorOutput += data;
      process.stderr.write(data);
    });

    deploy.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Failed to deploy ${functionName}: ${errorOutput}`));
      } else {
        console.log(`✅ ${functionName} deployed successfully!`);
        resolve();
      }
    });
  });
}

async function deployAll() {
  try {
    // Set the secrets
    console.log('📌 Setting up Edge Function secrets...\n');
    await setSecret('SCRAPERAPI_KEY', SCRAPERAPI_KEY);
    await setSecret('GEMINI_API_KEY', GEMINI_API_KEY);

    // Deploy functions
    await deployFunction('nitter-search');
    await deployFunction('monitor-projects');

    console.log('\n🎉 All Twitter Monitoring Edge Functions deployed successfully!\n');
    
    console.log('📌 Next: Run the test script');
    console.log('   node scripts/test-nitter-search.js');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deployAll();