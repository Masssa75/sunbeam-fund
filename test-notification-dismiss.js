const { chromium } = require('playwright');

async function testNotificationDismiss() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Browser error:', msg.text());
    }
  });
  
  // Monitor API calls
  page.on('response', async response => {
    if (response.url().includes('/api/notifications/')) {
      console.log(`\n📡 API Call: ${response.url()}`);
      console.log(`Status: ${response.status()}`);
      try {
        const body = await response.text();
        console.log('Response:', body);
      } catch (e) {
        // Ignore
      }
    }
  });
  
  console.log('1. Navigating to Sunbeam...');
  await page.goto('https://sunbeam.capital');
  
  console.log('2. Logging in as Marc...');
  await page.goto('https://sunbeam.capital/login');
  await page.fill('input[type="email"]', 'marc@cyrator.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForURL('https://sunbeam.capital/admin', { timeout: 30000 });
  console.log('3. Logged in successfully');
  
  // Wait for bell to load
  await page.waitForTimeout(2000);
  
  console.log('4. Clicking notification bell...');
  const bell = await page.locator('button svg[viewBox="0 0 24 24"]').first();
  await bell.click();
  
  // Wait for dropdown
  await page.waitForTimeout(1000);
  
  // Check if notifications exist
  const notifications = await page.locator('[role="alert"], div[class*="hover:bg-gray-50"]').count();
  console.log(`5. Found ${notifications} notifications`);
  
  if (notifications > 0) {
    // Find dismiss button (X icon)
    const dismissButton = await page.locator('button[title="Dismiss notification"]').first();
    if (await dismissButton.isVisible()) {
      console.log('6. Clicking dismiss button...');
      await dismissButton.click();
      
      // Wait for API call
      await page.waitForTimeout(2000);
      
      console.log('7. Refreshing page...');
      await page.reload();
      
      // Wait and click bell again
      await page.waitForTimeout(2000);
      const bellAfter = await page.locator('button svg[viewBox="0 0 24 24"]').first();
      await bellAfter.click();
      
      await page.waitForTimeout(1000);
      
      // Check notifications again
      const notificationsAfter = await page.locator('[role="alert"], div[class*="hover:bg-gray-50"]').count();
      console.log(`8. After refresh: ${notificationsAfter} notifications`);
      
      // Take screenshot
      await page.screenshot({ path: 'notification-test-result.png', fullPage: true });
      console.log('9. Screenshot saved');
    } else {
      console.log('No dismiss button found');
    }
  } else {
    console.log('No notifications to test with');
  }
  
  console.log('\nPress Ctrl+C to exit...');
  await new Promise(() => {}); // Keep browser open
}

testNotificationDismiss().catch(console.error);