const { chromium } = require('playwright');

async function testTelegramConnectionDebug() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enhanced logging for all console messages
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });
  
  // Log all network requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log('API Request:', request.method(), request.url());
    }
  });
  
  // Log all network responses
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log('API Response:', response.status(), response.url());
    }
  });
  
  // Capture any page errors
  page.on('pageerror', error => {
    console.error('Page error:', error.message);
  });
  
  try {
    console.log('1. Navigating to login page...');
    await page.goto('https://sunbeam.capital/login');
    
    console.log('2. Logging in as marc@minutevideos.com...');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    console.log('3. Login successful, now on dashboard');
    
    // Wait a bit for page to stabilize
    await page.waitForTimeout(2000);
    
    console.log('4. Clicking notification bell...');
    await page.click('button:has(svg[stroke="currentColor"]):has(path[d*="M15 17h5l-1.405"])');
    
    // Wait for dropdown to open
    await page.waitForTimeout(1000);
    
    // Check if we see the "Enable Push Notifications" button
    const connectButton = await page.locator('button:has-text("Enable Push Notifications")').first();
    if (await connectButton.isVisible()) {
      console.log('5. Found "Enable Push Notifications" button, clicking it...');
      
      // Set up promise to catch the window.open call
      const newPagePromise = context.waitForEvent('page');
      
      await connectButton.click();
      
      // Wait a bit to see what happens
      await page.waitForTimeout(3000);
      
      // Check if a new tab was opened
      try {
        const newPage = await Promise.race([
          newPagePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('No new tab opened')), 5000))
        ]);
        console.log('6. New tab opened with URL:', newPage.url());
        await newPage.close();
      } catch (e) {
        console.log('6. No new tab opened:', e.message);
      }
      
      // Check if any error dialog appeared
      const dialogs = [];
      page.on('dialog', dialog => {
        console.log('Dialog appeared:', dialog.type(), dialog.message());
        dialogs.push(dialog);
      });
      
      // Wait a bit more to catch any delayed errors
      await page.waitForTimeout(2000);
      
      // Take a screenshot to see the final state
      await page.screenshot({ path: 'telegram-connection-debug.png', fullPage: true });
      console.log('7. Screenshot saved as telegram-connection-debug.png');
      
      // Check if the dropdown is still open and what it shows
      const dropdownContent = await page.locator('.absolute.right-0.mt-2.w-96').textContent().catch(() => null);
      if (dropdownContent) {
        console.log('8. Dropdown content:', dropdownContent);
      }
      
    } else {
      console.log('5. No "Enable Push Notifications" button found');
      const dropdownContent = await page.locator('.absolute.right-0.mt-2.w-96').textContent();
      console.log('Dropdown content:', dropdownContent);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'telegram-connection-error.png', fullPage: true });
    console.log('Error screenshot saved as telegram-connection-error.png');
  } finally {
    await browser.close();
  }
}

testTelegramConnectionDebug().catch(console.error);