const { chromium } = require('playwright');

async function testDropdownMenu() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔍 Testing Dropdown Menu feature...\n');
    
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
    
    // 3. Take screenshot before opening menu
    await page.screenshot({ path: 'dropdown-menu-before.png', fullPage: true });
    console.log('✅ Screenshot saved as dropdown-menu-before.png');
    
    // 4. Look for three-dot menu buttons
    console.log('\n3. Looking for dropdown menu buttons...');
    const menuButtons = await page.locator('svg path[d*="M12 5v.01M12 12v.01M12 19v.01"]').count();
    console.log(`✅ Found ${menuButtons} menu button(s)`);
    
    if (menuButtons > 0) {
      // 5. Click the first menu button
      console.log('\n4. Clicking first dropdown menu...');
      await page.locator('svg path[d*="M12 5v.01M12 12v.01M12 19v.01"]').first().click();
      
      // Wait for dropdown to appear
      await page.waitForTimeout(500);
      
      // 6. Check for menu items
      const viewAsItem = await page.locator('text=View as investor').count();
      const editItem = await page.locator('text=Edit investor').count();
      const makeInvestorItem = await page.locator('text=Make investor').count();
      const deleteItem = await page.locator('text=Delete user').count();
      
      console.log(`   Found menu items:`);
      console.log(`   - View as investor: ${viewAsItem > 0 ? '✅' : '❌'}`);
      console.log(`   - Edit investor: ${editItem > 0 ? '✅' : '❌'}`);
      console.log(`   - Make investor: ${makeInvestorItem > 0 ? '✅' : '❌'}`);
      console.log(`   - Delete user: ${deleteItem > 0 ? '✅' : '❌'}`);
      
      // 7. Take screenshot with menu open
      await page.screenshot({ path: 'dropdown-menu-open.png', fullPage: true });
      console.log('✅ Screenshot saved as dropdown-menu-open.png');
      
      // 8. Test clicking outside to close
      console.log('\n5. Testing click outside to close menu...');
      await page.click('h1');
      await page.waitForTimeout(500);
      
      const menuStillVisible = await page.locator('text=View as investor').count();
      console.log(`✅ Menu closed after clicking outside: ${menuStillVisible === 0 ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ No dropdown menu buttons found');
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({ path: 'dropdown-menu-error.png', fullPage: true });
    console.log('Screenshot saved as dropdown-menu-error.png');
  } finally {
    await browser.close();
  }
}

testDropdownMenu().catch(console.error);