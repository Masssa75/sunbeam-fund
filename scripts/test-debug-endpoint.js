#!/usr/bin/env node

const { chromium } = require('playwright');

async function testDebugEndpoint() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('1. Navigating to login page...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');

    console.log('2. Logging in as marc@cyrator.com...');
    await page.fill('input[type="email"]', 'marc@cyrator.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    console.log('3. Waiting for portfolio to load...');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    await page.waitForSelector('text=Portfolio', { timeout: 10000 });

    console.log('4. Testing debug endpoint...');
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/test-connection-debug/');
      return await res.json();
    });

    console.log('\nDebug response:', JSON.stringify(response, null, 2));

    console.log('\n5. Testing connection-status endpoint...');
    const statusResponse = await page.evaluate(async () => {
      const res = await fetch('/api/notifications/connection-status/');
      return await res.json();
    });

    console.log('\nConnection status response:', JSON.stringify(statusResponse, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testDebugEndpoint().catch(console.error);