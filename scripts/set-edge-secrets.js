#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const SCRAPERAPI_KEY = process.env.SCRAPERAPI_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY;

const supabaseCLI = path.join(__dirname, '..', 'supabase-cli', 'supabase');

async function setSecrets() {
  console.log('🔐 Setting Edge Function secrets...\n');

  const secrets = [
    { name: 'SCRAPERAPI_KEY', value: SCRAPERAPI_KEY },
    { name: 'GEMINI_API_KEY', value: GEMINI_API_KEY },
    { name: 'CRONJOB_API_KEY', value: CRONJOB_API_KEY }
  ];

  for (const secret of secrets) {
    if (!secret.value) {
      console.error(`❌ Missing ${secret.name} in .env`);
      continue;
    }

    await new Promise((resolve) => {
      console.log(`Setting ${secret.name}...`);
      
      const proc = spawn(supabaseCLI, [
        'secrets', 'set',
        `${secret.name}=${secret.value}`,
        '--project-ref', SUPABASE_PROJECT_ID
      ], {
        cwd: path.join(__dirname, '..')
      });

      proc.stdout.on('data', (data) => process.stdout.write(data));
      proc.stderr.on('data', (data) => process.stderr.write(data));

      proc.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${secret.name} set successfully\n`);
        } else {
          console.log(`⚠️  ${secret.name} might have failed (code: ${code})\n`);
        }
        resolve();
      });
    });
  }

  console.log('🎉 All secrets set! The functions should work now.');
}

setSecrets();