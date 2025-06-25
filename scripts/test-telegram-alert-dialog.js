const { chromium } = require('playwright');

async function testTelegramAlertDialog() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Set up dialog handler BEFORE any actions
  const dialogs = [];
  page.on('dialog', async dialog => {
    console.log('==== DIALOG DETECTED ====');
    console.log('Type:', dialog.type());
    console.log('Message:', dialog.message());
    console.log('========================');
    dialogs.push({
      type: dialog.type(),
      message: dialog.message()
    });
    await dialog.accept();
  });
  
  // Enhanced logging for all console messages
  page.on('console', msg => {
    if (msg.text().includes('NotificationBell') || msg.text().includes('error') || msg.text().includes('fail')) {
      console.log('Browser console:', msg.text());
    }
  });
  
  try {
    console.log('1. Logging in as marc@cyrator.com (different account)...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@cyrator.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    console.log('2. Login successful');
    
    // Wait for page to stabilize
    await page.waitForTimeout(2000);
    
    console.log('3. Clicking notification bell...');
    await page.click('button:has(svg[stroke="currentColor"]):has(path[d*="M15 17h5l-1.405"])');
    
    // Wait for dropdown
    await page.waitForTimeout(1000);
    
    // Try to click the button multiple times to catch any errors
    const connectButton = await page.locator('button:has-text("Enable Push Notifications")').first();
    if (await connectButton.isVisible()) {
      console.log('4. Found button, clicking it...');
      await connectButton.click();
      
      // Wait for any potential error dialogs
      await page.waitForTimeout(5000);
      
      console.log('5. Checking for dialogs...');
      if (dialogs.length > 0) {
        console.log('FOUND DIALOGS:');
        dialogs.forEach((d, i) => {
          console.log(`Dialog ${i + 1}: ${d.type} - ${d.message}`);
        });
      } else {
        console.log('No dialogs detected');
      }
      
      // Take screenshot
      await page.screenshot({ path: 'telegram-dialog-test.png', fullPage: true });
      console.log('6. Screenshot saved');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testTelegramAlertDialog().catch(console.error);