const { chromium } = require('playwright');

async function testNavigation() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🧪 TESTING NAVIGATION SYSTEM\n');
  console.log('================================\n');
  
  try {
    // Test 1: Check unauthenticated navigation
    console.log('📋 TEST 1: Unauthenticated Navigation');
    console.log('------------------------');
    await page.goto('https://sunbeam.capital');
    await page.waitForLoadState('networkidle');
    
    const signInLink = await page.locator('a:has-text("Sign In")').count();
    console.log(signInLink > 0 ? '✅ Sign In link visible' : '❌ Sign In link missing');
    
    // Test 2: Admin navigation
    console.log('\n📋 TEST 2: Admin Navigation');
    console.log('------------------------');
    
    // Login as admin
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'claude.admin@sunbeam.capital');
    await page.fill('input[type="password"]', 'admin123456');
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
      console.log('✅ Admin login successful');
    } catch (e) {
      console.log('❌ Admin login failed');
      throw e;
    }
    
    // Check navigation items
    await page.waitForTimeout(2000); // Wait for navigation to update
    
    const navItems = {
      'Portfolio': await page.locator('a:has-text("Portfolio")').count(),
      'Manage Investors': await page.locator('a:has-text("Manage Investors")').count(),
      'Reports': await page.locator('a:has-text("Reports")').count(),
      'Preview Investor View': await page.locator('a:has-text("Preview Investor View")').count(),
    };
    
    console.log('\nAdmin Navigation Items:');
    for (const [item, count] of Object.entries(navItems)) {
      console.log(count > 0 ? `✅ ${item}` : `❌ ${item} missing`);
    }
    
    // Check for admin badge
    const adminBadge = await page.locator('span:has-text("Admin")').count();
    console.log(adminBadge > 0 ? '✅ Admin badge visible' : '❌ Admin badge missing');
    
    // Test navigation functionality
    console.log('\n📋 TEST 3: Navigation Functionality');
    console.log('------------------------');
    
    // Click Manage Investors
    await page.click('a:has-text("Manage Investors")');
    await page.waitForLoadState('networkidle');
    const investorsUrl = page.url();
    console.log(investorsUrl.includes('/admin/investors') ? '✅ Navigate to Investors page' : '❌ Navigation failed');
    
    // Click Portfolio
    await page.click('a:has-text("Portfolio")');
    await page.waitForLoadState('networkidle');
    const portfolioUrl = page.url();
    console.log(portfolioUrl.endsWith('/') ? '✅ Navigate to Portfolio page' : '❌ Navigation failed');
    
    // Test 4: Mobile menu
    console.log('\n📋 TEST 4: Mobile Navigation');
    console.log('------------------------');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check if mobile menu button exists
    const mobileMenuButton = await page.locator('button:has(svg)').last();
    const mobileButtonVisible = await mobileMenuButton.isVisible();
    console.log(mobileButtonVisible ? '✅ Mobile menu button visible' : '❌ Mobile menu button missing');
    
    // Click mobile menu
    if (mobileButtonVisible) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
      
      // Check if menu opened
      const mobileNavVisible = await page.locator('.sm\\:hidden').filter({ hasText: 'Portfolio' }).isVisible();
      console.log(mobileNavVisible ? '✅ Mobile menu opens' : '❌ Mobile menu failed to open');
    }
    
    // Take screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ path: 'test-navigation-desktop.png' });
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-navigation-mobile.png' });
    
    console.log('\n📸 Screenshots saved:');
    console.log('   - test-navigation-desktop.png');
    console.log('   - test-navigation-mobile.png');
    
    // Test 5: Logout
    console.log('\n📋 TEST 5: Logout');
    console.log('------------------------');
    
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.click('button:has-text("Sign out")');
    await page.waitForTimeout(2000);
    
    const afterLogoutUrl = page.url();
    console.log(afterLogoutUrl.includes('/login') ? '✅ Logout successful' : '❌ Logout failed');
    
    // Test 6: Investor navigation
    console.log('\n📋 TEST 6: Investor Navigation');
    console.log('------------------------');
    
    // Login as investor
    await page.fill('input[type="email"]', 'test.investor@sunbeam.capital');
    await page.fill('input[type="password"]', 'investor123456');
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
      console.log('✅ Investor login successful');
    } catch (e) {
      console.log('❌ Investor login failed');
    }
    
    await page.waitForTimeout(2000);
    
    // Check investor navigation items
    const investorNavItems = {
      'My Portfolio': await page.locator('a:has-text("My Portfolio")').count(),
      'My Reports': await page.locator('a:has-text("My Reports")').count(),
    };
    
    console.log('\nInvestor Navigation Items:');
    for (const [item, count] of Object.entries(investorNavItems)) {
      console.log(count > 0 ? `✅ ${item}` : `❌ ${item} missing`);
    }
    
    // Check for investor badge
    const investorBadge = await page.locator('span:has-text("Investor")').count();
    console.log(investorBadge > 0 ? '✅ Investor badge visible' : '❌ Investor badge missing');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-navigation-error.png' });
  } finally {
    await browser.close();
    console.log('\n================================');
    console.log('Test complete!');
  }
}

testNavigation().catch(console.error);