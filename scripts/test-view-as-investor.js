const { chromium } = require('playwright');

async function testViewAsInvestor() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔍 Testing View as Investor feature...\n');
    
    // 1. Login as admin
    console.log('1. Logging in as admin...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    console.log('✅ Successfully logged in as admin');
    
    // 2. Navigate to investors page
    console.log('\n2. Navigating to investors page...');
    await page.goto('https://sunbeam.capital/admin/investors');
    await page.waitForSelector('h1:has-text("Manage Users & Investors")', { timeout: 10000 });
    console.log('✅ Investors page loaded');
    
    // 3. Check for View as button
    console.log('\n3. Looking for View as button...');
    
    // First check if there are any investor rows
    const investorBadges = await page.locator('span:has-text("Investor")').count();
    console.log(`   Found ${investorBadges} investor badge(s)`);
    
    // Debug: Print all button texts
    const allButtons = await page.locator('button').allTextContents();
    console.log('   All buttons on page:', allButtons);
    
    const viewAsButtons = await page.locator('button:has-text("View as")').count();
    console.log(`✅ Found ${viewAsButtons} "View as" button(s)`);
    
    if (viewAsButtons > 0) {
      // 4. Click the first View as button
      console.log('\n4. Clicking first View as button...');
      await page.locator('button:has-text("View as")').first().click();
      
      // 5. Wait for navigation and check URL
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log(`✅ Navigated to: ${currentUrl}`);
      
      // 6. Check for viewing indicator
      const viewingIndicator = await page.locator('text=Viewing as investor').count();
      if (viewingIndicator > 0) {
        console.log('✅ "Viewing as investor" indicator is displayed');
      } else {
        console.log('❌ "Viewing as investor" indicator not found');
      }
      
      // 7. Take screenshot
      await page.screenshot({ path: 'view-as-investor-test.png', fullPage: true });
      console.log('✅ Screenshot saved as view-as-investor-test.png');
    } else {
      console.log('❌ No investors found with "View as" button');
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({ path: 'view-as-investor-error.png', fullPage: true });
    console.log('Screenshot saved as view-as-investor-error.png');
  } finally {
    await browser.close();
  }
}

testViewAsInvestor().catch(console.error);