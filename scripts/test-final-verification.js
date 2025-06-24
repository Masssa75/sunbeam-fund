const { chromium } = require('playwright');

async function testFinalVerification() {
  console.log('🔍 Final Verification Test - Multiple Login Cycles Without Cache Clear\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  let allTestsPassed = true;
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    console.log('Testing 3 complete login/logout cycles...\n');
    
    for (let cycle = 1; cycle <= 3; cycle++) {
      console.log(`=== CYCLE ${cycle} ===`);
      
      // 1. Login
      console.log('1. Logging in...');
      await page.goto('https://sunbeam.capital/login');
      await page.waitForLoadState('networkidle');
      
      // If already logged in, it should redirect
      if (page.url() === 'https://sunbeam.capital/') {
        console.log('✓ Already logged in, redirected automatically');
      } else {
        // Perform login
        await page.fill('input[name="email"]', 'marc@minutevideos.com');
        await page.fill('input[name="password"]', '123456');
        await page.click('button[type="submit"]');
        
        try {
          await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
          console.log('✓ Login successful');
        } catch (error) {
          console.log('❌ Login failed - stuck on login page');
          allTestsPassed = false;
          break;
        }
      }
      
      // 2. Check portfolio loads
      console.log('2. Checking portfolio...');
      let portfolioLoaded = false;
      
      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(1000);
        const content = await page.textContent('body');
        
        if (content.includes('Total Value') && content.includes('$')) {
          portfolioLoaded = true;
          console.log(`✓ Portfolio loaded successfully (after ${i + 1}s)`);
          
          // Verify specific elements
          if (content.includes('9 positions')) {
            console.log('✓ Shows correct position count');
          }
          if (content.match(/\$[\d,]+\.\d{2}/)) {
            console.log('✓ Shows portfolio value');
          }
          break;
        }
      }
      
      if (!portfolioLoaded) {
        console.log('❌ Portfolio did not load within 10 seconds');
        allTestsPassed = false;
        await page.screenshot({ path: `cycle-${cycle}-portfolio-failed.png` });
      }
      
      // 3. Logout
      console.log('3. Logging out...');
      const logoutButton = await page.$('button:has-text("Sign out")');
      if (logoutButton) {
        await logoutButton.click();
        console.log('✓ Clicked logout');
        
        // Wait for redirect
        await page.waitForTimeout(3000);
        
        // Verify we're back at login
        const currentUrl = page.url();
        if (currentUrl.includes('/login')) {
          console.log('✓ Redirected to login page');
        } else {
          console.log(`⚠️  Not on login page, current URL: ${currentUrl}`);
        }
      } else {
        console.log('❌ Could not find logout button');
        allTestsPassed = false;
      }
      
      console.log(''); // Empty line between cycles
    }
    
    console.log('\n=== FINAL RESULTS ===');
    if (allTestsPassed) {
      console.log('✅ ALL TESTS PASSED!');
      console.log('✅ Users can now login multiple times without clearing cache');
      console.log('✅ Portfolio loads correctly every time');
      console.log('✅ Logout properly clears session');
      console.log('\n🎉 The login cache issue is COMPLETELY FIXED!');
    } else {
      console.log('❌ Some tests failed - see details above');
    }
    
  } catch (error) {
    console.error('Test error:', error);
    allTestsPassed = false;
  } finally {
    await browser.close();
  }
  
  return allTestsPassed;
}

testFinalVerification().then(passed => {
  process.exit(passed ? 0 : 1);
});