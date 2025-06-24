const { chromium } = require('playwright');

async function testNavigationClientUpdate() {
  console.log('🧪 Testing navigation client-side update...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`[Browser ${msg.type()}]:`, msg.text());
    });
    
    console.log('1️⃣ First, login to get authenticated...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://sunbeam.capital/');
    console.log('✅ Logged in successfully');
    
    console.log('\n2️⃣ Checking initial navigation state...');
    let navText = await page.locator('nav').textContent();
    console.log('Initial nav text:', navText.substring(0, 100) + '...');
    
    console.log('\n3️⃣ Waiting for navigation to update (10 seconds)...');
    await page.waitForTimeout(10000);
    
    navText = await page.locator('nav').textContent();
    console.log('Nav text after 10s:', navText.substring(0, 100) + '...');
    
    // Check specific elements
    const hasSignOut = await page.locator('nav:has-text("Sign out")').count() > 0;
    const hasEmail = navText.includes('marc@minutevideos.com');
    const hasManageInvestors = navText.includes('Manage Investors');
    
    console.log('\n📊 Navigation analysis:');
    console.log('   - Shows "Sign out":', hasSignOut);
    console.log('   - Shows email:', hasEmail);
    console.log('   - Shows "Manage Investors":', hasManageInvestors);
    
    // Try to force a client-side navigation update
    console.log('\n4️⃣ Forcing client-side navigation...');
    await page.evaluate(() => {
      // Try to find React fiber and force update
      const nav = document.querySelector('nav');
      if (nav && nav._reactRootContainer) {
        console.log('Found React root container');
      }
      
      // Check if Navigation component is mounted
      const allScripts = document.querySelectorAll('script');
      let hasNavComponent = false;
      allScripts.forEach(script => {
        if (script.textContent && script.textContent.includes('Navigation')) {
          hasNavComponent = true;
        }
      });
      console.log('Has Navigation component:', hasNavComponent);
    });
    
    // Navigate to another page and back
    console.log('\n5️⃣ Navigating to /report and back...');
    await page.goto('https://sunbeam.capital/report');
    await page.waitForTimeout(2000);
    await page.goto('https://sunbeam.capital/');
    await page.waitForTimeout(2000);
    
    navText = await page.locator('nav').textContent();
    console.log('\nNav text after navigation:', navText.substring(0, 100) + '...');
    
    // Take final screenshot
    await page.screenshot({ path: 'navigation-client-update-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved: navigation-client-update-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testNavigationClientUpdate().catch(console.error);