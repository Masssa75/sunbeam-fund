#!/usr/bin/env node

const { chromium } = require('playwright');

async function testNotificationStatus() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[Browser ${msg.type()}]:`, msg.text());
      }
    });

    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('/api/notifications/') || request.url().includes('/api/telegram/')) {
        console.log(`[Request] ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/notifications/') || response.url().includes('/api/telegram/')) {
        console.log(`[Response] ${response.status()} ${response.url()}`);
      }
    });

    console.log('1. Navigating to login page...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');

    console.log('2. Logging in as marc@minutevideos.com...');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    console.log('3. Waiting for portfolio to load...');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    await page.waitForSelector('text=Portfolio', { timeout: 10000 });

    console.log('4. Waiting for notification bell...');
    await page.waitForSelector('button svg path[d*="M15 17h5l-1.405"]', { timeout: 10000 });

    console.log('5. Clicking notification bell...');
    await page.click('button svg path[d*="M15 17h5l-1.405"]');

    console.log('6. Waiting for dropdown to appear...');
    await page.waitForSelector('text=Notifications', { timeout: 5000 });

    // Take screenshot of the dropdown
    await page.screenshot({ path: 'notification-dropdown.png', fullPage: false });

    // Check what's in the dropdown
    const dropdownContent = await page.evaluate(() => {
      const dropdown = document.querySelector('div.absolute.right-0.mt-2.w-96');
      if (dropdown) {
        return {
          html: dropdown.innerHTML,
          hasConnectedText: dropdown.textContent.includes('Connected to Telegram'),
          hasEnableButton: dropdown.textContent.includes('Enable Push Notifications'),
          textContent: dropdown.textContent
        };
      }
      return null;
    });

    console.log('7. Dropdown content analysis:');
    console.log('   - Has "Connected to Telegram":', dropdownContent?.hasConnectedText);
    console.log('   - Has "Enable Push Notifications":', dropdownContent?.hasEnableButton);

    // Also check the API response directly
    console.log('\n8. Testing API directly...');
    const cookies = await context.cookies();
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const fetch = require('node-fetch');
    const response = await fetch('https://sunbeam.capital/api/notifications/connection-status/', {
      headers: {
        'Cookie': cookieString
      }
    });

    const data = await response.json();
    console.log('   API Response:', data);

    console.log('\n✅ Test completed. Check notification-dropdown.png for visual confirmation.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testNotificationStatus().catch(console.error);