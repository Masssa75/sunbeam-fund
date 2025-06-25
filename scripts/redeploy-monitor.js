#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY;
const supabaseCLI = path.join(__dirname, '..', 'supabase-cli', 'supabase');

async function setSecret(secretName, secretValue) {
  return new Promise((resolve) => {
    console.log(`🔐 Setting secret ${secretName}...`);
    
    const args = ['secrets', 'set', secretName, '--project-ref', SUPABASE_PROJECT_ID];
    const proc = spawn(supabaseCLI, args, {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    proc.stdin.write(secretValue);
    proc.stdin.end();

    proc.on('close', () => {
      console.log(`✅ ${secretName} set`);
      resolve();
    });
  });
}

async function deploy() {
  // Set CRONJOB_API_KEY secret
  await setSecret('CRONJOB_API_KEY', CRONJOB_API_KEY);

  // Deploy monitor-projects
  console.log('\n📦 Deploying monitor-projects...');
  
  const deploy = spawn(supabaseCLI, [
    'functions', 'deploy', 'monitor-projects',
    '--project-ref', SUPABASE_PROJECT_ID,
    '--no-verify-jwt'
  ], {
    cwd: path.join(__dirname, '..')
  });

  deploy.stdout.on('data', (data) => process.stdout.write(data));
  deploy.stderr.on('data', (data) => process.stderr.write(data));

  deploy.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ monitor-projects redeployed successfully!');
    } else {
      console.error('\n❌ Deployment failed');
    }
  });
}

deploy();