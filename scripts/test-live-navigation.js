const { chromium } = require('playwright');

async function testLiveNavigation() {
  console.log('🧪 Testing live navigation on sunbeam.capital...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show browser to see what's happening
    slowMo: 500 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser console error:', msg.text());
      }
    });
    
    console.log('1️⃣ Loading sunbeam.capital...');
    await page.goto('https://sunbeam.capital', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check what navigation elements are present
    const navHTML = await page.locator('nav').innerHTML();
    console.log('\n📋 Navigation HTML:');
    console.log(navHTML.substring(0, 500) + '...\n');
    
    // Check if it's the basic nav or full nav
    const hasSignInLink = await page.locator('nav a:has-text("Sign In")').count() > 0;
    const hasManageInvestors = await page.locator('nav a:has-text("Manage Investors")').count() > 0;
    const hasEmail = await page.locator('nav').textContent().then(text => text.includes('@'));
    
    console.log('🔍 Navigation analysis:');
    console.log(`   - Has "Sign In" link: ${hasSignInLink}`);
    console.log(`   - Has "Manage Investors" link: ${hasManageInvestors}`);
    console.log(`   - Shows email address: ${hasEmail}`);
    
    // Take screenshot
    await page.screenshot({ path: 'live-navigation-initial.png' });
    console.log('\n📸 Screenshot saved: live-navigation-initial.png');
    
    // Try logging in
    console.log('\n2️⃣ Navigating to login page...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForTimeout(1000);
    
    console.log('3️⃣ Logging in...');
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    console.log('4️⃣ Waiting for redirect...');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Check navigation after login
    const navHTMLAfterLogin = await page.locator('nav').innerHTML();
    console.log('\n📋 Navigation HTML after login:');
    console.log(navHTMLAfterLogin.substring(0, 500) + '...\n');
    
    const hasSignOutLink = await page.locator('nav:has-text("Sign out")').count() > 0;
    const hasManageInvestorsAfter = await page.locator('nav a:has-text("Manage Investors")').count() > 0;
    const hasEmailAfter = await page.locator('nav').textContent().then(text => text.includes('marc@minutevideos.com'));
    
    console.log('🔍 Navigation analysis after login:');
    console.log(`   - Has "Sign out" link: ${hasSignOutLink}`);
    console.log(`   - Has "Manage Investors" link: ${hasManageInvestorsAfter}`);
    console.log(`   - Shows email address: ${hasEmailAfter}`);
    
    // Take screenshot after login
    await page.screenshot({ path: 'live-navigation-logged-in.png' });
    console.log('\n📸 Screenshot saved: live-navigation-logged-in.png');
    
    // Check JavaScript console for errors
    const errors = await page.evaluate(() => {
      const logs = [];
      const originalError = console.error;
      console.error = (...args) => {
        logs.push(args.join(' '));
        originalError.apply(console, args);
      };
      return logs;
    });
    
    if (errors.length > 0) {
      console.log('\n❌ JavaScript errors found:');
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLiveNavigation().catch(console.error);