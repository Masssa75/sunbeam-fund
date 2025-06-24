const { chromium } = require('playwright');

async function testWelcomeWithConfirmedUser() {
  console.log('🧪 Testing Welcome Message with Confirmed Test User');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('\n1. Logging in with confirmed test user...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'testuser@sunbeam.capital');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for login and redirect
    await page.waitForTimeout(8000);
    
    // Check current state
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');
    
    console.log('2. Checking login result...');
    console.log('   🔍 Current URL:', currentUrl);
    
    // Test session API to see user status
    const sessionResponse = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/auth/session/');
        return await res.json();
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('   📊 Session data:', JSON.stringify({
      authenticated: sessionResponse.authenticated,
      isAdmin: sessionResponse.isAdmin,
      isInvestor: sessionResponse.isInvestor,
      email: sessionResponse.user?.email
    }, null, 2));
    
    // Check for welcome message elements
    const hasWelcomeMessage = pageContent.includes('Welcome to Sunbeam Fund');
    const hasThankYouMessage = pageContent.includes('Thank you for signing up');
    const hasInvestorAccountMessage = pageContent.includes('enable your investor account');
    const isLoggedInAsUser = pageContent.includes('testuser@sunbeam.capital');
    
    console.log('\n3. Testing welcome message display...');
    console.log('   ✅ Shows "Welcome to Sunbeam Fund":', hasWelcomeMessage);
    console.log('   ✅ Shows "Thank you for signing up":', hasThankYouMessage);
    console.log('   ✅ Shows "enable your investor account":', hasInvestorAccountMessage);
    console.log('   ✅ Shows user email:', isLoggedInAsUser);
    
    if (hasWelcomeMessage && hasThankYouMessage && hasInvestorAccountMessage) {
      console.log('\n🎉 SUCCESS: Welcome message is displaying correctly!');
    } else if (currentUrl.includes('/login')) {
      console.log('\n❌ Login failed or user not confirmed');
    } else {
      console.log('\n⚠️  User logged in but not seeing expected welcome message');
      console.log('📄 Page content preview:', pageContent.substring(0, 300) + '...');
    }
    
    await page.screenshot({ path: 'welcome-message-test.png', fullPage: true });
    
    // Test navigation behavior - regular users should not see admin options
    console.log('\n4. Testing navigation restrictions...');
    
    // Look for hamburger menu
    const hasMenu = await page.locator('button:has-text("☰")').count() > 0;
    console.log('   🍔 Has hamburger menu:', hasMenu);
    
    if (hasMenu) {
      await page.click('button:has-text("☰")');
      await page.waitForTimeout(1000);
      
      const menuContent = await page.textContent('body');
      const hasManageInvestors = menuContent.includes('Manage Investors');
      const hasReports = menuContent.includes('Reports');
      
      console.log('   🔒 Shows "Manage Investors" (should be false):', hasManageInvestors);
      console.log('   📊 Shows "Reports" (should be false):', hasReports);
      
      if (!hasManageInvestors && !hasReports) {
        console.log('   ✅ Correctly hiding admin-only navigation');
      } else {
        console.log('   ⚠️  Regular user can see admin navigation');
      }
    }
    
    console.log('\n✅ Welcome message test completed!');
    console.log('📸 Screenshot: welcome-message-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'welcome-message-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testWelcomeWithConfirmedUser().catch(console.error);