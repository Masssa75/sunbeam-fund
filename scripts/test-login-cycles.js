const { chromium } = require('playwright');

async function testLoginCycles() {
  console.log('Testing multiple login/logout cycles...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
    
    // Test 5 login/logout cycles
    for (let i = 1; i <= 5; i++) {
      console.log(`\n=== Cycle ${i} ===`);
      
      // Go to login page
      console.log('1. Navigating to login page...');
      await page.goto('https://sunbeam.capital/login');
      await page.waitForLoadState('networkidle');
      
      // Check if already logged in (should redirect)
      const currentUrl = page.url();
      if (currentUrl === 'https://sunbeam.capital/') {
        console.log('✓ Already logged in, redirected to portfolio');
        
        // Find and click logout
        const logoutButton = await page.$('button:has-text("Sign out")');
        if (logoutButton) {
          await logoutButton.click();
          console.log('✓ Clicked logout button');
          await page.waitForTimeout(3000);
          continue;
        }
      }
      
      // Should be on login page now
      console.log('2. Performing login...');
      await page.fill('input[name="email"]', 'marc@minutevideos.com');
      await page.fill('input[name="password"]', '123456');
      await page.click('button[type="submit"]');
      
      // Wait for redirect
      try {
        await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
        console.log('✓ Login successful - redirected to portfolio');
      } catch (error) {
        console.log('❌ Login failed - did not redirect');
        const loginPageContent = await page.textContent('body');
        if (loginPageContent.includes('Processing')) {
          console.log('   Stuck on "Processing..." state');
        }
        await page.screenshot({ path: `test-cycle-${i}-login-failed.png` });
        break;
      }
      
      // Check if portfolio loads
      await page.waitForTimeout(3000);
      const portfolioContent = await page.textContent('body');
      if (portfolioContent.includes('Loading Portfolio')) {
        console.log('❌ Portfolio stuck on "Loading Portfolio..."');
        await page.screenshot({ path: `test-cycle-${i}-portfolio-stuck.png` });
        break;
      } else if (portfolioContent.includes('Total Value')) {
        console.log('✓ Portfolio loaded successfully');
      }
      
      // Logout
      console.log('3. Logging out...');
      const logoutButton = await page.$('button:has-text("Sign out")');
      if (logoutButton) {
        await logoutButton.click();
        console.log('✓ Clicked logout button');
        
        // Wait for redirect to login page
        try {
          await page.waitForURL('https://sunbeam.capital/login', { timeout: 10000 });
          console.log('✓ Redirected to login page after logout');
        } catch (error) {
          console.log('❌ Did not redirect to login page after logout');
          const currentUrl = page.url();
          console.log('   Current URL:', currentUrl);
        }
        
        await page.waitForTimeout(2000);
      } else {
        console.log('❌ Could not find logout button');
        break;
      }
    }
    
    console.log('\n=== Test Summary ===');
    console.log('If all cycles completed successfully, the login/logout issue is fixed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testLoginCycles();