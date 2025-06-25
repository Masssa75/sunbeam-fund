#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!SUPABASE_PROJECT_ID) {
  console.error('❌ Error: SUPABASE_PROJECT_ID not found in .env file');
  process.exit(1);
}

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN not found in .env file');
  process.exit(1);
}

console.log('🚀 Deploying Telegram Edge Functions to Supabase...\n');

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
  'send-telegram-notification',
  'telegram-webhook'
];

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

    const env = {
      ...process.env,
      TELEGRAM_BOT_TOKEN: TELEGRAM_BOT_TOKEN
    };

    const deploy = spawn(supabaseCmd, args, {
      cwd: path.join(__dirname, '..'),
      env: env
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
    // Deploy all functions
    for (const func of functions) {
      await deployFunction(func);
    }

    console.log('\n🎉 All Telegram Edge Functions deployed successfully!\n');
    
    // Show webhook setup instructions
    const webhookUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/telegram-webhook`;
    
    console.log('📌 Next steps:');
    console.log('1. Set up the webhook for your Telegram bot:');
    console.log(`   curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \\`);
    console.log(`        -H "Content-Type: application/json" \\`);
    console.log(`        -d '{"url": "${webhookUrl}"}'`);
    console.log('\n2. Visit the admin page to test notifications:');
    console.log('   https://sunbeam.capital/admin/telegram');
    console.log('\n3. Generate connection links for investors to connect their Telegram accounts');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deployAll();