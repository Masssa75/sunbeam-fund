const { chromium } = require('playwright');

async function debugNotificationBell() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('Browser console:', msg.text()));
  
  // Intercept network requests
  page.on('response', async response => {
    if (response.url().includes('/api/notifications/recent-alerts')) {
      console.log('\n🔔 Notification API Response:');
      console.log('URL:', response.url());
      console.log('Status:', response.status());
      console.log('Headers:', response.headers());
      try {
        const body = await response.text();
        console.log('Body:', body);
      } catch (e) {
        console.log('Could not read body');
      }
    }
  });
  
  console.log('1. Navigating to sunbeam.capital...');
  await page.goto('https://sunbeam.capital');
  
  console.log('2. Logging in...');
  await page.goto('https://sunbeam.capital/login');
  await page.fill('input[type="email"]', 'marc@cyrator.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  await page.waitForURL('https://sunbeam.capital/admin', { timeout: 30000 });
  console.log('3. Logged in successfully, on admin page');
  
  // Click the notification bell
  console.log('4. Clicking notification bell...');
  await page.click('button svg[viewBox="0 0 24 24"]');
  
  // Wait a moment for dropdown to appear
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ path: 'notification-bell-debug.png', fullPage: true });
  console.log('5. Screenshot saved as notification-bell-debug.png');
  
  // Check what's in the dropdown
  const dropdownContent = await page.textContent('div.absolute.right-0.mt-2.w-96');
  console.log('\n📋 Dropdown content:', dropdownContent);
  
  console.log('\nPress Ctrl+C to exit...');
  // Keep browser open
  await new Promise(() => {});
}

debugNotificationBell().catch(console.error);