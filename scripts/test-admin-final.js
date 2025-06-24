const { chromium } = require('playwright');

async function finalAdminTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🧪 FINAL ADMIN SYSTEM TEST\n');
  console.log('================================\n');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  function logTest(name, passed, details = '') {
    if (passed) {
      console.log(`✅ ${name}`);
      results.passed++;
    } else {
      console.log(`❌ ${name}${details ? ': ' + details : ''}`);
      results.failed++;
    }
    results.details.push({ name, passed, details });
  }
  
  try {
    // Test 1: Admin Login
    console.log('📋 AUTHENTICATION TESTS');
    console.log('------------------------');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'claude.admin@sunbeam.capital');
    await page.fill('input[type="password"]', 'admin123456');
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
      logTest('Admin login');
    } catch (e) {
      logTest('Admin login', false, 'Login failed');
      throw e;
    }
    
    // Test 2: Admin Navigation
    console.log('\n📋 NAVIGATION TESTS');
    console.log('------------------------');
    
    // Check for Investors link
    const investorsLink = await page.locator('a:has-text("Investors")').count();
    logTest('Investors link in navigation', investorsLink > 0);
    
    // Navigate to investors page
    await page.goto('https://sunbeam.capital/admin/investors');
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    logTest('Investors page accessible', url.includes('/admin/investors'));
    
    // Test 3: Page Structure
    console.log('\n📋 PAGE STRUCTURE TESTS');
    console.log('------------------------');
    
    const pageTitle = await page.textContent('h1');
    logTest('Page title correct', pageTitle?.includes('Manage Investors'));
    
    const tables = await page.$$('table');
    logTest('Tables present', tables.length >= 2, `Found ${tables.length} tables`);
    
    const currentInvestorsHeading = await page.locator('h2:has-text("Current Investors")').count();
    logTest('Current Investors section', currentInvestorsHeading > 0);
    
    const registeredUsersHeading = await page.locator('h2:has-text("Registered Users")').count();
    logTest('Registered Users section', registeredUsersHeading > 0);
    
    // Test 4: Data Display
    console.log('\n📋 DATA DISPLAY TESTS');
    console.log('------------------------');
    
    // Wait a moment for data to load
    await page.waitForTimeout(2000);
    
    // Check what the page is showing
    const pageContent = await page.evaluate(() => {
      const body = document.body.textContent || '';
      return {
        hasNoInvestors: body.includes('No investors yet'),
        hasNoUsers: body.includes('No non-investor users'),
        hasTestInvestor: body.includes('test.investor@sunbeam.capital'),
        hasClaudeAdmin: body.includes('claude.admin@sunbeam.capital'),
        hasMarcAdmin: body.includes('marc@cyrator.com') || body.includes('marc@minutevideos.com')
      };
    });
    
    logTest('Shows admin users', pageContent.hasClaudeAdmin || pageContent.hasMarcAdmin);
    logTest('Shows test investor', pageContent.hasTestInvestor);
    
    // Take screenshot
    await page.screenshot({ path: 'final-admin-test.png' });
    console.log('\n📸 Screenshot: final-admin-test.png');
    
    // Test 5: Functionality Tests
    console.log('\n📋 FUNCTIONALITY TESTS');
    console.log('------------------------');
    
    // Check for Make Investor buttons
    const makeInvestorButtons = await page.locator('button:has-text("Make Investor")').count();
    logTest('Make Investor buttons available', makeInvestorButtons > 0, `Found ${makeInvestorButtons} buttons`);
    
    // If there are buttons, try clicking one
    if (makeInvestorButtons > 0) {
      await page.locator('button:has-text("Make Investor")').first().click();
      await page.waitForTimeout(500);
      
      const modalVisible = await page.locator('h3:has-text("Convert to Investor")').isVisible();
      logTest('Convert modal appears', modalVisible);
      
      if (modalVisible) {
        await page.locator('button:has-text("Cancel")').click();
        await page.waitForTimeout(500);
      }
    }
    
    // Test 6: Logout
    console.log('\n📋 LOGOUT TEST');
    console.log('------------------------');
    
    await page.locator('button:has-text("Sign out")').click();
    await page.waitForTimeout(2000);
    
    const afterLogoutUrl = page.url();
    logTest('Logout successful', afterLogoutUrl.includes('/login'));
    
  } catch (error) {
    console.error('\n💥 Critical error:', error.message);
    await page.screenshot({ path: 'final-admin-error.png' });
  } finally {
    await browser.close();
    
    // Summary
    console.log('\n================================');
    console.log('📊 FINAL TEST SUMMARY');
    console.log('================================');
    console.log(`Total Tests: ${results.passed + results.failed}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    
    if (results.failed > 0) {
      console.log('\nFailed Tests:');
      results.details.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.name}${r.details ? ': ' + r.details : ''}`);
      });
    }
    
    console.log('\n' + (results.failed === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️  Some tests need attention'));
  }
}

// Wait for deployment then run test
console.log('⏳ Waiting 2 minutes for deployment...\n');
setTimeout(() => {
  finalAdminTest().catch(console.error);
}, 120000);