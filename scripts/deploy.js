#!/usr/bin/env node

/**
 * Deployment helper script for Sunbeam Fund
 * Automates common deployment tasks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Sunbeam Fund Deployment Script\n');

// Check if git is clean
try {
  const gitStatus = execSync('git status --porcelain').toString();
  if (gitStatus) {
    console.log('⚠️  Warning: You have uncommitted changes:');
    console.log(gitStatus);
    console.log('Consider committing your changes before deploying.\n');
  }
} catch (error) {
  console.error('❌ Git not initialized. Please run: git init');
  process.exit(1);
}

// Check if remote is set
try {
  const remote = execSync('git remote -v').toString();
  if (!remote) {
    console.log('❌ No git remote found. Please add your GitHub repository:');
    console.log('   git remote add origin https://github.com/YOUR_USERNAME/sunbeam-fund.git');
    process.exit(1);
  }
  console.log('✅ Git remote configured');
} catch (error) {
  console.error('❌ Error checking git remote:', error.message);
}

// Build the project
console.log('\n📦 Building the project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Check for Netlify CLI
try {
  execSync('netlify --version', { stdio: 'ignore' });
  console.log('\n✅ Netlify CLI detected');
  
  console.log('\n🌐 To deploy to Netlify, run:');
  console.log('   netlify deploy --prod');
  console.log('\nOr for preview deployment:');
  console.log('   netlify deploy');
} catch (error) {
  console.log('\n📌 Netlify CLI not found. To install:');
  console.log('   npm install -g netlify-cli');
  console.log('\nThen run:');
  console.log('   netlify init');
  console.log('   netlify deploy --prod');
}

console.log('\n📚 For detailed deployment instructions, see DEPLOYMENT.md');
console.log('\n✨ Happy deploying!');