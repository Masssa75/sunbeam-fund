#!/usr/bin/env node

/**
 * Alternative method to create GitHub repo using the GitHub API
 * Requires GITHUB_TOKEN in environment or .env file
 */

require('dotenv').config();
const https = require('https');

const REPO_NAME = 'sunbeam-fund';
const REPO_DESCRIPTION = 'Crypto fund management system for Sunbeam Fund';

if (!process.env.GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN not found in environment');
  console.log('\nTo use this script:');
  console.log('1. Create a GitHub Personal Access Token:');
  console.log('   https://github.com/settings/tokens/new');
  console.log('2. Add to .env file:');
  console.log('   GITHUB_TOKEN=your_token_here');
  process.exit(1);
}

const data = JSON.stringify({
  name: REPO_NAME,
  description: REPO_DESCRIPTION,
  private: false,
  has_issues: true,
  has_projects: false,
  has_wiki: false
});

const options = {
  hostname: 'api.github.com',
  path: '/user/repos',
  method: 'POST',
  headers: {
    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    'User-Agent': 'Sunbeam-Fund-App',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    const response = JSON.parse(body);
    
    if (res.statusCode === 201) {
      console.log('✅ Repository created successfully!');
      console.log(`🔗 URL: ${response.html_url}`);
      console.log('\n📝 Next steps:');
      console.log(`git remote add origin ${response.ssh_url}`);
      console.log('git push -u origin main');
    } else {
      console.error('❌ Failed to create repository');
      console.error(response.message || body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error);
});

req.write(data);
req.end();