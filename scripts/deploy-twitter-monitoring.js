#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_PROJECT_ID) {
  console.error('❌ Error: SUPABASE_PROJECT_ID not found in .env file');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

console.log('🚀 Deploying Twitter Monitoring Edge Functions to Supabase...\n');

// Check if supabase CLI exists
const supabaseCLI = path.join(__dirname, '..', 'supabase-cli', 'supabase');
const useGlobalSupabase = !fs.existsSync(supabaseCLI);

if (useGlobalSupabase) {
  console.log('Using global supabase CLI...\n');
} else {
  console.log('Using local supabase CLI...\n');
}

const supabaseCmd = useGlobalSupabase ? 'supabase' : supabaseCLI;

// Functions to deploy
const functions = [
  'nitter-search',
  'monitor-projects'
];

async function setSecret(secretName, secretValue) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔐 Setting secret ${secretName}...`);
    
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
        reject(new Error(`Failed to set ${secretName}: ${errorOutput}`));
      } else {
        console.log(`✅ ${secretName} set successfully!`);
        resolve();
      }
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
      cwd: path.join(__dirname, '..')
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
    // First set the secrets
    console.log('📌 Setting up Edge Function secrets...');
    console.log('\n⚠️  IMPORTANT: You need to get your ScraperAPI key!');
    console.log('Visit https://www.scraperapi.com/ to get your API key');
    console.log('The key should be in your ScraperAPI dashboard\n');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const scraperApiKey = await new Promise((resolve) => {
      rl.question('Enter your ScraperAPI key: ', (answer) => {
        resolve(answer.trim());
      });
    });
    rl.close();

    if (!scraperApiKey) {
      console.error('❌ ScraperAPI key is required!');
      process.exit(1);
    }

    // Set the secrets
    await setSecret('SCRAPERAPI_KEY', scraperApiKey);
    await setSecret('GEMINI_API_KEY', GEMINI_API_KEY);

    // Deploy all functions
    for (const func of functions) {
      await deployFunction(func);
    }

    console.log('\n🎉 All Twitter Monitoring Edge Functions deployed successfully!\n');
    
    // Show next steps
    console.log('📌 Next steps:');
    console.log('1. Test the nitter-search function:');
    console.log(`   curl -X POST https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/nitter-search \\`);
    console.log('        -H "Authorization: Bearer YOUR_ANON_KEY" \\');
    console.log('        -H "Content-Type: application/json" \\');
    console.log('        -d \'{"projectId": "kaspa", "projectName": "Kaspa", "symbol": "kas", "twitterHandle": "KaspaCurrency"}\'');
    console.log('\n2. Set up cron job to trigger monitor-projects every minute');
    console.log('\n3. Monitor the logs in Supabase dashboard');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deployAll();