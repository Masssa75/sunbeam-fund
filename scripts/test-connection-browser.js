#!/usr/bin/env node

const { chromium } = require('playwright');

async function testConnectionStatus() {
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

    console.log('4. Waiting for notification bell...');
    await page.waitForSelector('button svg path[d*="M15 17h5l-1.405"]', { timeout: 10000 });

    // Wait a bit for the NotificationBell component to load its data
    console.log('5. Waiting for notification data to load...');
    await page.waitForTimeout(3000);

    console.log('6. Clicking notification bell...');
    await page.click('button svg path[d*="M15 17h5l-1.405"]');

    console.log('7. Waiting for dropdown to appear...');
    await page.waitForSelector('text=Notifications', { timeout: 5000 });

    // Take screenshot of the dropdown
    await page.screenshot({ path: 'notification-dropdown-cyrator.png', fullPage: false });

    // Check what's in the dropdown
    const dropdownContent = await page.evaluate(() => {
      const dropdown = document.querySelector('div.absolute.right-0.mt-2.w-96');
      if (dropdown) {
        // Find all text elements to see what's there
        const allText = Array.from(dropdown.querySelectorAll('*')).map(el => el.textContent?.trim()).filter(t => t);
        
        return {
          hasConnectedText: dropdown.textContent.includes('Connected to Telegram'),
          hasEnableButton: dropdown.textContent.includes('Enable Push Notifications'),
          hasUsername: dropdown.textContent.includes('@cyrator007'),
          allText: allText,
          htmlSnippet: dropdown.innerHTML.substring(0, 500)
        };
      }
      return null;
    });

    console.log('\n8. Dropdown content analysis:');
    console.log('   - Has "Connected to Telegram":', dropdownContent?.hasConnectedText);
    console.log('   - Has "Enable Push Notifications":', dropdownContent?.hasEnableButton);
    console.log('   - Has username @cyrator007:', dropdownContent?.hasUsername);
    console.log('   - Unique text elements:', dropdownContent?.allText?.length);

    if (dropdownContent?.hasEnableButton && !dropdownContent?.hasConnectedText) {
      console.log('\n❌ Issue confirmed: User is connected in database but UI shows "Enable Push Notifications"');
    } else if (dropdownContent?.hasConnectedText) {
      console.log('\n✅ Working correctly: UI shows Telegram connection status');
    }

    console.log('\n✅ Test completed. Check notification-dropdown-cyrator.png for visual confirmation.');

    // Keep browser open for a moment
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testConnectionStatus().catch(console.error);