const { chromium } = require('playwright');

async function testInvestorView() {
  console.log('🧪 Testing Investor View Issue');
  console.log('==============================\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: Login first
    console.log('1. Logging in as admin user...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Verify we're logged in
    const headerText = await page.locator('header, [class*="shadow-sm"]').first().textContent();
    console.log(`   ✅ Logged in successfully: ${headerText.includes('marc@minutevideos.com')}`);
    
    // Test 2: Check if Investor View link is visible
    console.log('\n2. Checking Investor View link visibility...');
    const investorLinkVisible = await page.locator('text=Investor View').isVisible();
    console.log(`   Investor View link visible: ${investorLinkVisible}`);
    
    if (!investorLinkVisible) {
      console.log('   ❌ Investor View link not visible - STOPPING TEST');
      return false;
    }
    
    // Test 3: Click on Investor View
    console.log('\n3. Clicking on Investor View link...');
    await page.click('text=Investor View');
    await page.waitForTimeout(3000);
    
    // Check URL
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (!currentUrl.includes('/investor')) {
      console.log('   ❌ Did not navigate to /investor page');
    }
    
    // Test 4: Check what's displayed on investor page
    console.log('\n4. Checking investor page content...');
    await page.screenshot({ path: 'investor-view-test-1-page-content.png' });
    
    // Check for loading state
    const loadingVisible = await page.locator('text=Loading').isVisible();
    if (loadingVisible) {
      console.log('   ⏳ Page shows "Loading..." state');
      
      // Wait longer to see if it resolves
      await page.waitForTimeout(5000);
      const stillLoading = await page.locator('text=Loading').isVisible();
      if (stillLoading) {
        console.log('   ❌ Still showing "Loading..." after 5 seconds');
      }
    }
    
    // Check for portfolio content
    const portfolioVisible = await page.locator('text=/Portfolio|Holdings/').isVisible();
    console.log(`   Portfolio content visible: ${portfolioVisible}`);
    
    // Check for any error messages
    const errorMessages = await page.locator('text=/error|Error|failed|Failed/i').all();
    if (errorMessages.length > 0) {
      console.log(`   ❌ Found ${errorMessages.length} error message(s) on page`);
      for (const error of errorMessages) {
        const errorText = await error.textContent();
        console.log(`      - ${errorText}`);
      }
    }
    
    // Check page title or heading
    const pageTitle = await page.locator('h1, h2').first().textContent().catch(() => 'No heading found');
    console.log(`   Page heading: "${pageTitle}"`);
    
    // Test 5: Check console errors
    console.log('\n5. Checking for console errors...');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Reload to capture any console errors
    await page.reload();
    await page.waitForTimeout(3000);
    
    if (consoleErrors.length > 0) {
      console.log(`   ❌ Found ${consoleErrors.length} console error(s):`);
      consoleErrors.forEach(err => console.log(`      - ${err}`));
    } else {
      console.log('   ✅ No console errors found');
    }
    
    // Test 6: Compare with admin view
    console.log('\n6. Comparing with admin view...');
    await page.click('text=Admin View');
    await page.waitForTimeout(2000);
    
    const adminContentVisible = await page.locator('text=Portfolio Positions').isVisible();
    console.log(`   Admin view shows portfolio: ${adminContentVisible}`);
    
    // Go back to investor view
    await page.click('text=Investor View');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'investor-view-test-2-final-state.png' });
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    
    const investorPageWorks = portfolioVisible && !loadingVisible && currentUrl.includes('/investor');
    
    if (investorPageWorks) {
      console.log('✅ Investor View is working correctly');
    } else {
      console.log('❌ Investor View has issues:');
      if (!currentUrl.includes('/investor')) console.log('   - Navigation to /investor failed');
      if (loadingVisible) console.log('   - Page stuck in loading state');
      if (!portfolioVisible) console.log('   - Portfolio content not visible');
    }
    
    return investorPageWorks;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    await page.screenshot({ path: 'investor-view-test-error.png' });
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testInvestorView().then(success => {
  process.exit(success ? 0 : 1);
});