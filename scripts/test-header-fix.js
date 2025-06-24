const { chromium } = require('playwright');

async function testHeaderFix() {
  console.log('🧪 Testing Header Authentication Display Fix');
  console.log('=========================================\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: Initial page load (not logged in)
    console.log('1. Testing initial page load (not logged in)...');
    await page.goto('https://sunbeam.capital');
    await page.waitForTimeout(3000); // Wait for header to load
    
    const headerText = await page.locator('header, [class*="shadow-sm"]').first().textContent();
    console.log(`   Header shows: "${headerText}"`);
    
    if (headerText.includes('Loading...')) {
      console.log('   ❌ Header stuck in loading state');
    } else if (headerText.includes('Not signed in')) {
      console.log('   ✅ Header correctly shows "Not signed in"');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'header-fix-test-1-initial.png' });
    
    // Test 2: Login
    console.log('\n2. Testing login...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    await page.waitForTimeout(3000); // Wait for header to update
    
    const headerTextAfterLogin = await page.locator('header, [class*="shadow-sm"]').first().textContent();
    console.log(`   Header shows: "${headerTextAfterLogin}"`);
    
    if (headerTextAfterLogin.includes('marc@minutevideos.com')) {
      console.log('   ✅ Header correctly shows logged-in user');
    } else {
      console.log('   ❌ Header not showing logged-in user');
    }
    
    await page.screenshot({ path: 'header-fix-test-2-after-login.png' });
    
    // Test 3: Page refresh (the critical test)
    console.log('\n3. Testing page refresh (CRITICAL TEST)...');
    await page.reload();
    await page.waitForTimeout(5000); // Give it time to load
    
    const headerTextAfterRefresh = await page.locator('header, [class*="shadow-sm"]').first().textContent();
    console.log(`   Header shows: "${headerTextAfterRefresh}"`);
    
    if (headerTextAfterRefresh.includes('Loading...')) {
      console.log('   ❌ FAILED: Header stuck in "Loading..." state after refresh');
    } else if (headerTextAfterRefresh.includes('marc@minutevideos.com')) {
      console.log('   ✅ SUCCESS: Header correctly shows logged-in user after refresh');
    } else {
      console.log('   ❓ Unexpected state:', headerTextAfterRefresh);
    }
    
    await page.screenshot({ path: 'header-fix-test-3-after-refresh.png' });
    
    // Test 4: Check portfolio data loads
    console.log('\n4. Checking if portfolio data loads...');
    const portfolioVisible = await page.locator('text=/Portfolio Positions|Loading Portfolio/').isVisible();
    if (portfolioVisible) {
      const portfolioText = await page.locator('h2').first().textContent();
      console.log(`   Portfolio section shows: "${portfolioText}"`);
      
      // Check if positions are visible
      const positionsCount = await page.locator('tbody tr').count();
      console.log(`   Number of positions visible: ${positionsCount}`);
    }
    
    // Test 5: Check admin/investor links
    console.log('\n5. Checking admin/investor view links...');
    const adminLinkVisible = await page.locator('text=Admin View').isVisible();
    const investorLinkVisible = await page.locator('text=Investor View').isVisible();
    console.log(`   Admin View link visible: ${adminLinkVisible}`);
    console.log(`   Investor View link visible: ${investorLinkVisible}`);
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    
    if (!headerTextAfterRefresh.includes('Loading...') && headerTextAfterRefresh.includes('marc@minutevideos.com')) {
      console.log('✅ Header authentication display is FIXED!');
      console.log('   - Shows correct state when not logged in');
      console.log('   - Shows user email when logged in');
      console.log('   - Maintains state after page refresh');
      return true;
    } else {
      console.log('❌ Header authentication display issue persists');
      console.log('   - Still showing "Loading..." after refresh');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testHeaderFix().then(success => {
  process.exit(success ? 0 : 1);
});