const { chromium } = require('playwright');

async function testInvestorViewFix() {
  console.log('🧪 Testing Investor View Fix');
  console.log('============================\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: Login
    console.log('1. Logging in...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    console.log('   ✅ Login successful');
    
    // Test 2: Navigate to investor view
    console.log('\n2. Navigating to Investor View...');
    await page.click('text=Investor View');
    await page.waitForURL('**/investor/**', { timeout: 5000 });
    await page.waitForTimeout(5000); // Give content time to load
    
    // Test 3: Check for loading state
    console.log('\n3. Checking loading state...');
    const loadingVisible = await page.locator('text=/Loading Portfolio/i').isVisible().catch(() => false);
    if (loadingVisible) {
      console.log('   ⚠️  Still showing "Loading Portfolio..."');
      
      // Wait longer
      await page.waitForTimeout(10000);
      const stillLoading = await page.locator('text=/Loading Portfolio/i').isVisible().catch(() => false);
      if (stillLoading) {
        console.log('   ❌ FAILED: Stuck in loading state after 15 seconds');
        await page.screenshot({ path: 'investor-fix-test-stuck-loading.png', fullPage: true });
        return false;
      }
    } else {
      console.log('   ✅ Not stuck in loading state');
    }
    
    // Test 4: Check for portfolio content
    console.log('\n4. Checking for portfolio content...');
    
    // Look for portfolio value
    const portfolioValue = await page.locator('text=/Portfolio Value/i').isVisible();
    console.log(`   Portfolio Value header: ${portfolioValue ? '✅ Found' : '❌ Not found'}`);
    
    // Look for holdings
    const holdings = await page.locator('text=/Your Holdings/i').isVisible();
    console.log(`   Your Holdings section: ${holdings ? '✅ Found' : '❌ Not found'}`);
    
    // Count holding items
    const holdingItems = await page.locator('[class*="bg-gray-50"][class*="rounded-xl"]').count();
    console.log(`   Number of holdings displayed: ${holdingItems}`);
    
    // Look for actual values
    const dollarValues = await page.locator('text=/\\$[0-9,]+/').count();
    console.log(`   Dollar values found: ${dollarValues}`);
    
    // Test 5: Check for specific positions
    console.log('\n5. Checking for specific positions...');
    const positions = ['Kaspa', 'Bittensor', 'Sui', 'Toncoin'];
    for (const position of positions) {
      const found = await page.locator(`text=${position}`).isVisible().catch(() => false);
      console.log(`   ${position}: ${found ? '✅ Found' : '❌ Not found'}`);
    }
    
    // Test 6: Page refresh test
    console.log('\n6. Testing page refresh...');
    await page.reload();
    await page.waitForTimeout(5000);
    
    const loadingAfterRefresh = await page.locator('text=/Loading Portfolio/i').isVisible().catch(() => false);
    const contentAfterRefresh = await page.locator('text=/Your Holdings/i').isVisible().catch(() => false);
    
    console.log(`   After refresh - Loading: ${loadingAfterRefresh ? '❌ Yes' : '✅ No'}`);
    console.log(`   After refresh - Content: ${contentAfterRefresh ? '✅ Visible' : '❌ Not visible'}`);
    
    await page.screenshot({ path: 'investor-fix-test-final.png', fullPage: true });
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    
    const success = !loadingVisible && portfolioValue && holdings && holdingItems > 0 && !loadingAfterRefresh;
    
    if (success) {
      console.log('✅ Investor View is FIXED!');
      console.log('   - No longer stuck in loading state');
      console.log('   - Portfolio data displays correctly');
      console.log('   - Maintains state after refresh');
      console.log(`   - Shows ${holdingItems} holdings`);
    } else {
      console.log('❌ Investor View still has issues');
      if (loadingVisible) console.log('   - Stuck in loading state');
      if (!portfolioValue) console.log('   - Portfolio value not displayed');
      if (!holdings) console.log('   - Holdings not displayed');
      if (holdingItems === 0) console.log('   - No positions shown');
    }
    
    return success;
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: 'investor-fix-test-error.png' });
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testInvestorViewFix().then(success => {
  process.exit(success ? 0 : 1);
});