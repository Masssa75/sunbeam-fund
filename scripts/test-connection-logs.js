#!/usr/bin/env node

const { chromium } = require('playwright');

async function testConnectionLogs() {
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
    
    // Make a direct API call with better error handling
    console.log('\n4. Testing connection-status API directly:');
    const result = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/notifications/connection-status/');
        const text = await response.text();
        
        // Try to get server logs from response headers if available
        const headers = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          json = { parseError: true, text };
        }
        
        return {
          status: response.status,
          headers,
          body: json,
          rawText: text
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Response:', JSON.stringify(result, null, 2));

    // Also check what the debug endpoint shows
    console.log('\n5. Testing debug endpoint:');
    const debugResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/test-connection-debug/');
        const json = await response.json();
        return json;
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Debug response summary:');
    console.log('- Step:', debugResult.step);
    console.log('- Has user:', !!debugResult.user);
    console.log('- Has investor:', !!debugResult.investor);
    console.log('- Has telegram:', !!debugResult.telegram);
    console.log('- User email:', debugResult.user?.email);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testConnectionLogs().catch(console.error);