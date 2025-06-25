const { chromium } = require('playwright');

async function testTelegramConnection() {
  const browser = await chromium.launch({
    headless: false,  // Show browser window
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Enable console logging
    page.on('console', msg => {
      if (msg.text().includes('[NotificationBell]') || msg.text().includes('[generate-token]')) {
        console.log('Browser console:', msg.text());
      }
    });

    // Navigate to login page
    console.log('1. Navigating to login page...');
    await page.goto('https://sunbeam.capital/login');
    
    // Login
    console.log('2. Logging in as marc@minutevideos.com...');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    console.log('3. Login successful, now on dashboard');
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Click on notification bell
    console.log('4. Clicking notification bell...');
    const bellButton = await page.locator('button svg path[d*="M15 17h5l-1.405"]').first().locator('..');
    await bellButton.click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(1000);
    
    // Check if "Enable Push Notifications" button exists
    const connectButton = await page.locator('button:has-text("Enable Push Notifications")');
    const buttonExists = await connectButton.count() > 0;
    
    if (buttonExists) {
      console.log('5. Found "Enable Push Notifications" button, clicking it...');
      
      // Monitor network requests
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/telegram/generate-token/') && 
        response.request().method() === 'POST'
      );
      
      // Click the button
      await connectButton.click();
      
      // Wait for API response
      console.log('6. Waiting for API response...');
      const response = await responsePromise;
      console.log('API Response Status:', response.status());
      
      if (response.ok()) {
        const responseData = await response.json();
        console.log('API Response Data:', responseData);
      } else {
        const responseText = await response.text();
        console.log('API Error Response:', responseText);
      }
      
      // Check for any alerts
      await page.waitForTimeout(2000);
      
      // Take screenshot of final state
      await page.screenshot({ 
        path: 'telegram-connection-test.png', 
        fullPage: true 
      });
      console.log('Screenshot saved to telegram-connection-test.png');
      
    } else {
      console.log('5. User might already be connected or button not found');
      
      // Take screenshot to see current state
      await page.screenshot({ 
        path: 'telegram-connection-state.png', 
        fullPage: true 
      });
      console.log('Screenshot saved to telegram-connection-state.png');
    }
    
    // Keep browser open for manual inspection
    console.log('\nTest complete. Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testTelegramConnection().catch(console.error);