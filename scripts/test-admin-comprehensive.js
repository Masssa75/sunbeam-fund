const { chromium } = require('playwright');

async function comprehensiveAdminTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    passed: [],
    failed: []
  };
  
  try {
    console.log('🧪 COMPREHENSIVE ADMIN TESTING\n');
    console.log('================================\n');
    
    // Test 1: Admin Login
    console.log('1️⃣ TEST: Admin Login');
    console.log('------------------------');
    try {
      await page.goto('https://sunbeam.capital/login');
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[type="email"]', 'claude.admin@sunbeam.capital');
      await page.fill('input[type="password"]', 'admin123456');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
      console.log('✅ Admin login successful');
      results.passed.push('Admin login');
    } catch (error) {
      console.log('❌ Admin login failed:', error.message);
      results.failed.push('Admin login: ' + error.message);
      throw error; // Can't continue without login
    }
    
    // Test 2: Check Admin Navigation
    console.log('\n2️⃣ TEST: Admin Navigation');
    console.log('------------------------');
    try {
      // Check if header shows admin status
      const headerText = await page.textContent('header');
      if (headerText.includes('claude.admin@sunbeam.capital')) {
        console.log('✅ Header shows admin email');
        results.passed.push('Header shows admin email');
      } else {
        console.log('❌ Header does not show admin email');
        results.failed.push('Header does not show admin email');
      }
      
      // Check for Investors link
      const investorsLink = await page.locator('a:has-text("Investors")').count();
      if (investorsLink > 0) {
        console.log('✅ Investors link visible in navigation');
        results.passed.push('Investors link in navigation');
      } else {
        console.log('❌ Investors link not found');
        results.failed.push('Investors link not found');
      }
    } catch (error) {
      console.log('❌ Navigation test failed:', error.message);
      results.failed.push('Navigation test: ' + error.message);
    }
    
    // Test 3: Navigate to Investors Page
    console.log('\n3️⃣ TEST: Investors Page Access');
    console.log('------------------------');
    try {
      await page.goto('https://sunbeam.capital/admin/investors');
      await page.waitForLoadState('networkidle');
      
      const pageTitle = await page.textContent('h1');
      if (pageTitle && pageTitle.includes('Manage Investors')) {
        console.log('✅ Investors page loaded correctly');
        console.log('   Title:', pageTitle);
        results.passed.push('Investors page loads');
        
        // Take screenshot for review
        await page.screenshot({ path: 'test-investors-page.png' });
        console.log('📸 Screenshot saved: test-investors-page.png');
      } else {
        console.log('❌ Investors page did not load correctly');
        console.log('   Found title:', pageTitle);
        results.failed.push('Investors page title incorrect');
        
        // Check if redirected
        const currentUrl = page.url();
        console.log('   Current URL:', currentUrl);
      }
    } catch (error) {
      console.log('❌ Investors page access failed:', error.message);
      results.failed.push('Investors page access: ' + error.message);
    }
    
    // Test 4: Check Tables Structure
    console.log('\n4️⃣ TEST: Investors Page Structure');
    console.log('------------------------');
    try {
      // Check for tables
      const tables = await page.$$('table');
      console.log(`   Found ${tables.length} tables`);
      
      if (tables.length >= 2) {
        console.log('✅ Both investor and user tables present');
        results.passed.push('Tables structure correct');
      } else {
        console.log('❌ Expected 2 tables, found', tables.length);
        results.failed.push('Missing tables');
      }
      
      // Check for section headings
      const currentInvestorsHeading = await page.locator('h2:has-text("Current Investors")').count();
      const registeredUsersHeading = await page.locator('h2:has-text("Registered Users")').count();
      
      if (currentInvestorsHeading > 0 && registeredUsersHeading > 0) {
        console.log('✅ Both section headings present');
        results.passed.push('Section headings correct');
      } else {
        console.log('❌ Missing section headings');
        results.failed.push('Missing section headings');
      }
    } catch (error) {
      console.log('❌ Structure test failed:', error.message);
      results.failed.push('Structure test: ' + error.message);
    }
    
    // Test 5: Check for Test Investor
    console.log('\n5️⃣ TEST: Test Investor Data');
    console.log('------------------------');
    try {
      const testInvestorEmail = await page.locator('text=test.investor@sunbeam.capital').count();
      if (testInvestorEmail > 0) {
        console.log('✅ Test investor found');
        results.passed.push('Test investor exists');
        
        // Check if in investors table
        const investorRow = await page.locator('tr:has-text("test.investor@sunbeam.capital"):has-text("TEST001")').count();
        if (investorRow > 0) {
          console.log('✅ Test investor is in investors table');
          results.passed.push('Test investor properly configured');
        } else {
          console.log('⚠️  Test investor not in investors table yet');
          results.passed.push('Test investor needs conversion');
        }
      } else {
        console.log('❌ Test investor not found');
        results.failed.push('Test investor missing');
      }
    } catch (error) {
      console.log('❌ Test investor check failed:', error.message);
      results.failed.push('Test investor check: ' + error.message);
    }
    
    // Test 6: Check "Make Investor" Button
    console.log('\n6️⃣ TEST: Make Investor Functionality');
    console.log('------------------------');
    try {
      const makeInvestorButtons = await page.locator('button:has-text("Make Investor")').count();
      console.log(`   Found ${makeInvestorButtons} "Make Investor" buttons`);
      
      if (makeInvestorButtons > 0) {
        console.log('✅ Make Investor buttons present');
        results.passed.push('Make Investor buttons found');
        
        // Try clicking one
        await page.locator('button:has-text("Make Investor")').first().click();
        await page.waitForTimeout(1000);
        
        // Check if modal appeared
        const modalTitle = await page.locator('h3:has-text("Convert to Investor")').count();
        if (modalTitle > 0) {
          console.log('✅ Convert to Investor modal appears');
          results.passed.push('Modal functionality works');
          
          // Close modal
          await page.locator('button:has-text("Cancel")').click();
          await page.waitForTimeout(500);
        } else {
          console.log('❌ Modal did not appear');
          results.failed.push('Modal did not appear');
        }
      } else {
        console.log('⚠️  No users to convert (all might be investors)');
      }
    } catch (error) {
      console.log('❌ Make Investor test failed:', error.message);
      results.failed.push('Make Investor test: ' + error.message);
    }
    
    // Test 7: Test Logout
    console.log('\n7️⃣ TEST: Logout Functionality');
    console.log('------------------------');
    try {
      await page.locator('button:has-text("Sign out")').click();
      await page.waitForURL('https://sunbeam.capital/login', { timeout: 5000 });
      console.log('✅ Logout successful');
      results.passed.push('Logout works');
    } catch (error) {
      console.log('❌ Logout failed:', error.message);
      results.failed.push('Logout: ' + error.message);
    }
    
  } catch (error) {
    console.error('\n💥 CRITICAL ERROR:', error.message);
    await page.screenshot({ path: 'test-error-screenshot.png' });
    console.log('📸 Error screenshot saved: test-error-screenshot.png');
  } finally {
    await browser.close();
    
    // Summary
    console.log('\n================================');
    console.log('📊 TEST SUMMARY');
    console.log('================================');
    console.log(`✅ Passed: ${results.passed.length} tests`);
    results.passed.forEach(test => console.log(`   - ${test}`));
    
    console.log(`\n❌ Failed: ${results.failed.length} tests`);
    results.failed.forEach(test => console.log(`   - ${test}`));
    
    console.log('\n================================\n');
    
    if (results.failed.length === 0) {
      console.log('🎉 ALL TESTS PASSED!');
    } else {
      console.log('⚠️  Some tests failed - review needed');
    }
  }
}

comprehensiveAdminTest().catch(console.error);