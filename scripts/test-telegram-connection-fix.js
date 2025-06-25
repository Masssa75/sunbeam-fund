const { chromium } = require('playwright');

async function testTelegramFix() {
  const browser = await chromium.launch({ 
    headless: false, // Show browser to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Log all console messages
  page.on('console', msg => {
    console.log('Browser:', msg.text());
  });
  
  // Log all network requests
  page.on('response', response => {
    if (response.url().includes('/api/telegram/generate-token')) {
      console.log('\n=== GENERATE TOKEN RESPONSE ===');
      console.log('Status:', response.status());
      response.text().then(text => {
        console.log('Body:', text);
        console.log('==============================\n');
      });
    }
  });
  
  try {
    console.log('1. Logging in as marc@minutevideos.com...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    console.log('2. Login successful');
    
    // Clear any existing modals
    await page.keyboard.press('Escape');
    
    // Wait for page to stabilize
    await page.waitForTimeout(3000);
    
    console.log('3. Clicking notification bell...');
    await page.click('button:has(svg[stroke="currentColor"]):has(path[d*="M15 17h5l-1.405"])');
    
    // Wait for dropdown and API calls
    await page.waitForTimeout(3000);
    
    // Check if button is visible
    const connectButton = await page.locator('button:has-text("Enable Push Notifications")').first();
    if (await connectButton.isVisible()) {
      console.log('4. Found button, clicking it...');
      await connectButton.click();
      
      // Wait to see response
      await page.waitForTimeout(3000);
    }
    
    console.log('5. Test complete. Check console output above.');
    console.log('Press Ctrl+C to close browser...');
    
    // Keep browser open
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: 'telegram-fix-error.png' });
  } finally {
    await browser.close();
  }
}

testTelegramFix().catch(console.error);