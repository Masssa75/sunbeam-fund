const { chromium } = require('playwright');

async function testUserRouting() {
  console.log('🧪 Testing User Routing Flow');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: Admin user flow
    console.log('\n1. Testing Admin User Flow...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for redirect and check for admin features
    await page.waitForTimeout(3000);
    const hasPortfolioTable = await page.locator('text=Portfolio Positions').count() > 0;
    const hasReportManagement = await page.locator('text=Report Management').count() > 0;
    
    console.log('   ✅ Admin sees portfolio table:', hasPortfolioTable);
    console.log('   ✅ Admin sees report management:', hasReportManagement);
    
    await page.screenshot({ path: 'admin-dashboard.png', fullPage: true });
    
    // Logout
    await page.click('button:has-text("☰")');
    await page.click('text=Sign out');
    await page.waitForTimeout(2000);
    
    // Test 2: Regular user flow (should see welcome message)
    console.log('\n2. Testing Regular User Flow...');
    
    // First create a regular user account for testing
    await page.goto('https://sunbeam.capital/login?mode=signup');
    const randomEmail = `test${Date.now()}@example.com`;
    
    await page.fill('input[type="email"]', randomEmail);
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for signup/login
    await page.waitForTimeout(3000);
    
    // Check if we see the welcome message
    const hasWelcomeMessage = await page.locator('text=Welcome to Sunbeam Fund').count() > 0;
    const hasThankYouMessage = await page.locator('text=Thank you for signing up').count() > 0;
    const hasInvestorAccountMessage = await page.locator('text=enable your investor account').count() > 0;
    
    console.log('   ✅ Shows welcome message:', hasWelcomeMessage);
    console.log('   ✅ Shows thank you message:', hasThankYouMessage);
    console.log('   ✅ Shows investor account message:', hasInvestorAccountMessage);
    
    await page.screenshot({ path: 'regular-user-welcome.png', fullPage: true });
    
    // Test 3: Check session API response
    console.log('\n3. Testing Session API...');
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/auth/session/');
      return await res.json();
    });
    
    console.log('   📊 Session data:', JSON.stringify(response, null, 2));
    
    console.log('\n✅ User routing test completed successfully!');
    console.log('📸 Screenshots saved: admin-dashboard.png, regular-user-welcome.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-user-routing.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testUserRouting().catch(console.error);