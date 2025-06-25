const { chromium } = require('playwright');

async function testErrorScenario() {
  const browser = await chromium.launch({ 
    headless: false, // Run with UI to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Set up dialog handler
  const dialogs = [];
  page.on('dialog', async dialog => {
    console.log('==== ALERT DETECTED ====');
    console.log('Message:', dialog.message());
    console.log('========================');
    dialogs.push(dialog.message());
    await dialog.accept();
  });
  
  // Log all console messages
  page.on('console', msg => {
    console.log('Browser:', msg.text());
  });
  
  try {
    console.log('Testing error scenario...\n');
    
    // Login
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    
    console.log('Logged in successfully\n');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Click notification bell
    await page.click('button:has(svg[stroke="currentColor"]):has(path[d*="M15 17h5l-1.405"])');
    await page.waitForTimeout(1000);
    
    // Try clicking the button multiple times quickly (simulate double-click)
    const connectButton = await page.locator('button:has-text("Enable Push Notifications")').first();
    if (await connectButton.isVisible()) {
      console.log('Clicking button multiple times quickly...');
      await connectButton.click();
      await connectButton.click();
      await connectButton.click();
    }
    
    // Wait to see if any errors appear
    await page.waitForTimeout(5000);
    
    if (dialogs.length > 0) {
      console.log('\n🚨 ERRORS DETECTED:');
      dialogs.forEach(msg => console.log('- ' + msg));
    } else {
      console.log('\n✅ No errors detected');
    }
    
    console.log('\nPress Ctrl+C to close browser...');
    await page.waitForTimeout(60000); // Keep browser open
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testErrorScenario().catch(console.error);