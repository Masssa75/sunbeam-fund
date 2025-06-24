const { chromium } = require('playwright');

async function testImprovedWelcome() {
  console.log('🧪 Testing Improved Welcome Message Design');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('\n1. Logging in as regular user...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'testuser@sunbeam.capital');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for login and redirect
    await page.waitForTimeout(8000);
    
    // Check current state
    const currentUrl = page.url();
    const hasNavigation = await page.locator('nav').count() > 0;
    const pageContent = await page.textContent('body');
    
    console.log('2. Checking improved design...');
    console.log('   🔍 Current URL:', currentUrl);
    console.log('   🎨 Has navigation bar:', hasNavigation);
    
    // Check for welcome message elements
    const hasThankYou = pageContent.includes('Thank you for signing up');
    const hasReviewMessage = pageContent.includes('Your investor account is being reviewed and will be activated shortly');
    const hasGradientBg = await page.locator('.bg-gradient-to-b').count() > 0;
    
    console.log('\n3. Design elements check...');
    console.log('   ✅ Shows "Thank you for signing up":', hasThankYou);
    console.log('   ✅ Shows review message:', hasReviewMessage);
    console.log('   ✅ Has gradient background:', hasGradientBg);
    console.log('   ✅ Navigation hidden:', !hasNavigation);
    
    // Take screenshot
    await page.screenshot({ path: 'improved-welcome-design.png', fullPage: true });
    
    // Test admin user still sees navigation
    console.log('\n4. Testing admin user still has navigation...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(5000);
    
    const adminHasNav = await page.locator('nav').count() > 0;
    const adminHasHeader = await page.locator('text=Sunbeam Fund Management').count() > 0;
    
    console.log('   ✅ Admin has navigation:', adminHasNav);
    console.log('   ✅ Admin sees full header:', adminHasHeader);
    
    await page.screenshot({ path: 'admin-with-navigation.png', fullPage: true });
    
    console.log('\n✅ Improved design test completed!');
    console.log('📸 Screenshots: improved-welcome-design.png, admin-with-navigation.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'improved-design-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testImprovedWelcome().catch(console.error);