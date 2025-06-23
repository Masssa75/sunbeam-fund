#!/usr/bin/env node

/**
 * Run all vital tests to ensure the app is working correctly
 * This should be run after deployments or major changes
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running all vital tests...\n');
console.log('=' .repeat(60));

const tests = [
  {
    name: 'Backend Authentication',
    script: 'test-auth.js',
    description: 'Tests Supabase authentication flow'
  },
  {
    name: 'Full Login Flow',
    script: 'test-full-login-flow.js',
    description: 'Tests complete login with database queries'
  },
  {
    name: 'Browser E2E Test',
    script: 'test-browser-e2e.js',
    description: 'Tests login and portfolio display in real browser'
  }
];

let currentTest = 0;
const results = [];

function runNextTest() {
  if (currentTest >= tests.length) {
    showSummary();
    return;
  }

  const test = tests[currentTest];
  console.log(`\n[${currentTest + 1}/${tests.length}] ${test.name}`);
  console.log(`Description: ${test.description}`);
  console.log('-' .repeat(60));

  const startTime = Date.now();
  const child = spawn('node', [path.join(__dirname, test.script)], {
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const passed = code === 0;
    
    results.push({
      name: test.name,
      passed,
      duration: `${duration}s`,
      code
    });

    console.log(`\nTest completed in ${duration}s - ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('=' .repeat(60));

    currentTest++;
    runNextTest();
  });

  child.on('error', (error) => {
    console.error(`Failed to run test: ${error.message}`);
    results.push({
      name: test.name,
      passed: false,
      duration: '0s',
      error: error.message
    });
    
    currentTest++;
    runNextTest();
  });
}

function showSummary() {
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name} (${result.duration})`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '-' .repeat(60));
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed} ${passed === results.length ? '🎉' : ''}`);
  console.log(`Failed: ${failed}`);
  console.log('=' .repeat(60));
  
  // Exit with error if any tests failed
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please check the output above.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed! The app is working correctly.');
    process.exit(0);
  }
}

// Check if Playwright is installed for browser tests
try {
  require('playwright');
} catch (e) {
  console.log('\n⚠️  WARNING: Playwright not installed. Browser tests will be skipped.');
  console.log('To install: npm install --save-dev playwright');
  console.log('Then: npx playwright install chromium\n');
  
  // Remove browser test from the list
  tests.splice(tests.findIndex(t => t.script === 'test-browser-e2e.js'), 1);
}

// Start running tests
runNextTest();