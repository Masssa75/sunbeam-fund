const { chromium } = require('playwright');

async function testAdminInvestors() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🧪 Testing Admin Investors Page...\n');
    
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'claude.admin@sunbeam.capital');
    await page.fill('input[type="password"]', 'admin123456');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    console.log('✅ Logged in successfully\n');
    
    // Step 2: Navigate to investors page
    console.log('2️⃣ Navigating to investors page...');
    await page.goto('https://sunbeam.capital/admin/investors');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'admin-investors-screenshot.png' });
    
    // Check if page loaded correctly
    const pageTitle = await page.textContent('h1');
    if (pageTitle && pageTitle.includes('Manage Investors')) {
      console.log('✅ Investors page loaded successfully');
      console.log('   Page title:', pageTitle);
    } else {
      console.log('❌ Investors page did not load correctly');
      console.log('   Found:', pageTitle);
    }
    
    // Step 3: Check for users table
    console.log('\n3️⃣ Checking for users table...');
    const tables = await page.$$('table');
    console.log(`   Found ${tables.length} tables`);
    
    // Check for test investor
    const testInvestorRow = await page.locator('text=test.investor@sunbeam.capital').count();
    if (testInvestorRow > 0) {
      console.log('✅ Test investor found in table');
    } else {
      console.log('⚠️  Test investor not found (may not be in investors table yet)');
    }
    
    console.log('\n✨ Admin investors page test complete!');
    console.log('📸 Screenshot saved as: admin-investors-screenshot.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'admin-investors-error.png' });
    console.log('📸 Error screenshot saved as: admin-investors-error.png');
  } finally {
    await browser.close();
  }
}

// Wait 2 minutes for deployment, then test
console.log('⏳ Waiting 2 minutes for deployment to complete...');
setTimeout(() => {
  testAdminInvestors().catch(console.error);
}, 120000);