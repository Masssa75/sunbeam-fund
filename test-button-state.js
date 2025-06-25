const { chromium } = require('playwright');

async function testButtonState() {
  console.log('Testing button state...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show browser to see what's happening
    slowMo: 500      // Slow down actions
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
    
    console.log('1. Navigating to login...');
    await page.goto('https://sunbeam.capital/login');
    
    console.log('2. Logging in...');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    console.log('✓ Logged in successfully');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('3. Clicking notification bell...');
    const bellButton = await page.locator('button').filter({ has: page.locator('svg path[d*="M15 17h5l-1.405"]') }).first();
    await bellButton.click();
    
    console.log('4. Waiting for dropdown to load...');
    await page.waitForTimeout(3000);
    
    console.log('5. Checking button state...');
    const button = await page.locator('button:has-text("Enable Push Notifications")').first();
    
    if (await button.count() > 0) {
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      const isDisabled = await button.isDisabled();
      
      console.log(`   Button found: Yes`);
      console.log(`   Is visible: ${isVisible}`);
      console.log(`   Is enabled: ${isEnabled}`);
      console.log(`   Is disabled: ${isDisabled}`);
      
      // Get the disabled attribute
      const disabledAttr = await button.getAttribute('disabled');
      console.log(`   Disabled attribute: ${disabledAttr}`);
      
      // Get button HTML
      const buttonHTML = await button.evaluate(el => el.outerHTML);
      console.log(`   Button HTML: ${buttonHTML}`);
      
      // Check if loading state
      const loadingText = await page.locator('text=Loading').count();
      console.log(`   Loading text visible: ${loadingText > 0}`);
      
      // Try clicking anyway
      if (isVisible) {
        console.log('\n6. Attempting to click button...');
        try {
          await button.click({ force: true });
          console.log('   ✓ Button clicked!');
          
          // Wait to see what happens
          await page.waitForTimeout(2000);
          
          // Check if a new window opened
          const pages = context.pages();
          console.log(`   Number of pages open: ${pages.length}`);
        } catch (error) {
          console.log('   ❌ Click failed:', error.message);
        }
      }
    } else {
      console.log('   ❌ Button not found');
    }
    
    console.log('\n[Press Ctrl+C to close browser]');
    await page.waitForTimeout(60000); // Keep browser open for inspection
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testButtonState().catch(console.error);