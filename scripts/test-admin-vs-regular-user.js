const { chromium } = require('playwright');

async function testAdminVsRegularUser() {
  console.log('🧪 Testing Admin vs Regular User Experience');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Test 1: Admin user experience
    console.log('\n1. Testing Admin User Experience...');
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    
    await adminPage.goto('https://sunbeam.capital/login');
    await adminPage.fill('input[type="email"]', 'marc@minutevideos.com');
    await adminPage.fill('input[type="password"]', '123456');
    await adminPage.click('button[type="submit"]');
    
    // Wait for login and redirect
    await adminPage.waitForTimeout(5000);
    
    const adminContent = await adminPage.textContent('body').catch(() => '');
    const hasPortfolioPositions = adminContent.includes('Portfolio Positions');
    const hasReportGenerator = adminContent.includes('Generate Monthly Report');
    const hasAdminLinks = adminContent.includes('View All Reports');
    
    console.log('   ✅ Admin sees Portfolio Positions:', hasPortfolioPositions);
    console.log('   ✅ Admin sees Report Generator:', hasReportGenerator);
    console.log('   ✅ Admin sees admin links:', hasAdminLinks);
    console.log('   🔍 Admin page URL:', adminPage.url());
    
    await adminPage.screenshot({ path: 'admin-user-dashboard.png', fullPage: true });
    
    // Check session API for admin
    const adminSession = await adminPage.evaluate(async () => {
      const res = await fetch('/api/auth/session/');
      return await res.json();
    });
    
    console.log('   📊 Admin session:', { 
      authenticated: adminSession.authenticated, 
      isAdmin: adminSession.isAdmin, 
      isInvestor: adminSession.isInvestor 
    });
    
    await adminContext.close();
    
    // Test 2: Try to create a regular user and test
    console.log('\n2. Testing Regular User Sign Up...');
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    
    // First check if test user already exists by trying to sign in
    await userPage.goto('https://sunbeam.capital/login');
    await userPage.fill('input[type="email"]', 'test@sunbeam.capital');
    await userPage.fill('input[type="password"]', 'password123');
    await userPage.click('button[type="submit"]');
    
    await userPage.waitForTimeout(5000);
    
    let regularUserContent = await userPage.textContent('body').catch(() => '');
    
    // If login failed, try signing up
    if (regularUserContent.includes('Invalid email or password') || userPage.url().includes('/login')) {
      console.log('   📝 Test user does not exist, trying signup...');
      
      await userPage.goto('https://sunbeam.capital/login?mode=signup');
      await userPage.fill('input[type="email"]', 'test@sunbeam.capital');
      await userPage.fill('input[type="password"]', 'password123');
      
      // Check if there's a signup button or if it's still login
      const isSignupMode = await userPage.locator('text=Create Account').count() > 0;
      if (isSignupMode) {
        await userPage.click('button:has-text("Create Account")');
      } else {
        await userPage.click('button[type="submit"]');
      }
      
      await userPage.waitForTimeout(5000);
      regularUserContent = await userPage.textContent('body').catch(() => '');
    }
    
    // Check what content the regular user sees
    const hasWelcomeMessage = regularUserContent.includes('Welcome to Sunbeam Fund');
    const hasThankYouMessage = regularUserContent.includes('Thank you for signing up');
    const hasInvestorMessage = regularUserContent.includes('enable your investor account');
    const isStillOnLogin = userPage.url().includes('/login');
    
    console.log('   🔍 Regular user page URL:', userPage.url());
    console.log('   ✅ Shows welcome message:', hasWelcomeMessage);
    console.log('   ✅ Shows thank you message:', hasThankYouMessage);
    console.log('   ✅ Shows investor account message:', hasInvestorMessage);
    console.log('   ❓ Still on login page:', isStillOnLogin);
    
    if (!isStillOnLogin) {
      // Check session API for regular user
      const userSession = await userPage.evaluate(async () => {
        const res = await fetch('/api/auth/session/');
        return await res.json();
      });
      
      console.log('   📊 Regular user session:', { 
        authenticated: userSession.authenticated, 
        isAdmin: userSession.isAdmin, 
        isInvestor: userSession.isInvestor 
      });
    }
    
    await userPage.screenshot({ path: 'regular-user-experience.png', fullPage: true });
    await userContext.close();
    
    console.log('\n✅ User comparison test completed!');
    console.log('📸 Screenshots: admin-user-dashboard.png, regular-user-experience.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testAdminVsRegularUser().catch(console.error);