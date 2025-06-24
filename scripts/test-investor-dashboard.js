const { chromium } = require('playwright');

async function testInvestorDashboard() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔍 Testing New Investor Dashboard...\n');
    
    // 1. Test as admin viewing investor
    console.log('1. Testing admin View as Investor...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    console.log('✅ Logged in as admin');
    
    // Navigate to investors page
    await page.goto('https://sunbeam.capital/admin/investors');
    await page.waitForSelector('h1:has-text("Manage Users & Investors")', { timeout: 10000 });
    
    // Find and click View as for first investor
    const menuButtons = await page.locator('svg path[d*="M12 5v.01M12 12v.01M12 19v.01"]').all();
    let foundInvestor = false;
    
    for (let i = 0; i < menuButtons.length; i++) {
      await menuButtons[i].click();
      await page.waitForTimeout(500);
      
      const viewAsButton = await page.locator('text=View as investor').count();
      if (viewAsButton > 0) {
        console.log('✅ Found investor, clicking View as...');
        await page.click('text=View as investor');
        foundInvestor = true;
        break;
      } else {
        // Click outside to close menu
        await page.click('h1');
        await page.waitForTimeout(200);
      }
    }
    
    if (foundInvestor) {
      await page.waitForTimeout(3000); // Wait for navigation
      
      // Check for investor portal elements
      const hasInvestorPortal = await page.locator('text=Investor Portal').count() > 0;
      console.log(`✅ Investor Portal header: ${hasInvestorPortal ? 'Found' : 'Not found'}`);
      
      const hasCurrentStanding = await page.locator('text=Your Current Standing').count() > 0;
      console.log(`✅ Current Standing section: ${hasCurrentStanding ? 'Found' : 'Not found'}`);
      
      const hasMonthlyReports = await page.locator('text=Monthly Reports').count() > 0;
      console.log(`✅ Monthly Reports section: ${hasMonthlyReports ? 'Found' : 'Not found'}`);
      
      // Take screenshot
      await page.screenshot({ path: 'investor-dashboard-new.png', fullPage: true });
      console.log('✅ Screenshot saved as investor-dashboard-new.png');
    }
    
    // 2. Test logging in as investor directly
    console.log('\n2. Testing direct investor login...');
    
    // First, logout
    await page.goto('https://sunbeam.capital/api/auth/logout');
    await page.waitForTimeout(1000);
    
    // Login as test investor
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'test.investor@sunbeam.capital');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    // Check if investor dashboard loads
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('❌ Login failed - investor might not have correct credentials');
    } else {
      const hasInvestorView = await page.locator('text=Investor Portal').count() > 0 ||
                              await page.locator('text=Your Current Standing').count() > 0;
      console.log(`✅ Investor view loaded: ${hasInvestorView ? 'Yes' : 'No'}`);
      
      await page.screenshot({ path: 'investor-direct-login.png', fullPage: true });
      console.log('✅ Screenshot saved as investor-direct-login.png');
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'investor-dashboard-error.png', fullPage: true });
    console.log('Screenshot saved as investor-dashboard-error.png');
  } finally {
    await browser.close();
  }
}

testInvestorDashboard().catch(console.error);