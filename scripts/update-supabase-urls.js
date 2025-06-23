#!/usr/bin/env node

/**
 * Script to update Supabase redirect URLs via Management API
 */

const fetch = require('node-fetch');
require('dotenv').config();

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_ID = process.env.SUPABASE_PROJECT_ID;

async function updateRedirectURLs() {
  console.log('Updating Supabase redirect URLs...');
  
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/config/auth`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      site_url: 'https://sunbeam.capital',
      redirect_urls: [
        'https://sunbeam.capital',
        'https://sunbeam.capital/*',
        'https://sunbeam.capital/reset-password',
        'https://sunbeam.capital/verify',
        'https://wonderful-strudel-a9c260.netlify.app',
        'https://wonderful-strudel-a9c260.netlify.app/*'
      ],
      auth_providers: {
        email: true,
        phone: false,
        apple: false,
        google: false,
        github: false,
        facebook: false,
        twitter: false,
        discord: false,
        linkedin: false,
        spotify: false,
        slack: false,
        gitlab: false,
        bitbucket: false,
        azure: false
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error updating redirect URLs:', error);
    return;
  }

  console.log('✅ Redirect URLs updated successfully!');
  console.log('Site URL: https://sunbeam.capital');
  console.log('Email verification will now redirect to the correct domain.');
}

updateRedirectURLs().catch(console.error);