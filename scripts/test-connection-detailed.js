#!/usr/bin/env node

const { chromium } = require('playwright');

async function testConnectionDetailed() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Enable console logging
    page.on('console', msg => {
      console.log(`[Browser ${msg.type()}]:`, msg.text());
    });

    // Capture the connection-status response
    let connectionStatusResponse = null;
    page.on('response', async response => {
      if (response.url().includes('/api/notifications/connection-status/')) {
        connectionStatusResponse = {
          status: response.status(),
          headers: response.headers(),
          body: await response.text()
        };
        console.log('\n[Network] Connection status API response:');
        console.log('  Status:', connectionStatusResponse.status);
        console.log('  Body:', connectionStatusResponse.body);
      }
    });

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

    console.log('4. Waiting for API calls to complete...');
    await page.waitForTimeout(5000);

    // Now manually call the API from the browser context
    console.log('\n5. Manually testing API from browser context...');
    const apiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/notifications/connection-status/');
        const text = await response.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          json = null;
        }
        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          text: text,
          json: json
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('\n[Manual API Test]:');
    console.log('  Status:', apiTest.status);
    console.log('  Response:', apiTest.json || apiTest.text);

    // Test the debug endpoint too
    console.log('\n6. Testing debug endpoint...');
    const debugTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/test-connection-debug/');
        const text = await response.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          json = null;
        }
        return {
          status: response.status,
          text: text,
          json: json
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('\n[Debug API Test]:');
    console.log('  Status:', debugTest.status);
    console.log('  Response:', debugTest.json || debugTest.text);

    console.log('\n7. Getting auth session info...');
    const sessionInfo = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/session/');
        const json = await response.json();
        return json;
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('\n[Session Info]:');
    console.log('  User:', sessionInfo.user?.email || 'Not authenticated');
    console.log('  Is Admin:', sessionInfo.isAdmin);

    // Keep browser open for manual inspection
    console.log('\n✅ Test completed. Browser will remain open for 30 seconds...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testConnectionDetailed().catch(console.error);