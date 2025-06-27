const { chromium } = require('playwright');

async function testLoginLandingPage() {
  console.log('Testing login page as landing page...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('1. Testing non-authenticated homepage redirect...');
    await page.goto('https://sunbeam.capital');
    
    // Wait for redirect to login page
    await page.waitForURL(/.*\/login.*/, { timeout: 10000 });
    const currentUrl = page.url();
    
    if (currentUrl.includes('/login')) {
      console.log('✓ Homepage correctly redirects to login page');
    } else {
      console.log('✗ Homepage did not redirect to login page');
      console.log(`  Current URL: ${currentUrl}`);
    }
    
    // Check login page content
    const signInTitle = await page.locator('text=Sign in to Sunbeam Fund').count();
    const emailField = await page.locator('input[type="email"]').count();
    const passwordField = await page.locator('input[type="password"]').count();
    const signInButton = await page.locator('button:has-text("Sign in")').count();
    
    if (signInTitle > 0) {
      console.log('✓ Login page shows correct title');
    } else {
      console.log('✗ Login page title not found');
    }
    
    if (emailField > 0 && passwordField > 0) {
      console.log('✓ Login form fields are present');
    } else {
      console.log('✗ Login form fields missing');
    }
    
    if (signInButton > 0) {
      console.log('✓ Sign in button is present');
    } else {
      console.log('✗ Sign in button missing');
    }
    
    // Check for signup link
    const createAccountLink = await page.locator('text=create a new account').count();
    if (createAccountLink > 0) {
      console.log('✓ Create account link is present');
    } else {
      console.log('✗ Create account link missing');
    }
    
    console.log('\n2. Testing signup mode...');
    
    // Click create account link
    await page.click('text=create a new account');
    await page.waitForTimeout(1000);
    
    // Check if page switched to signup mode
    const signUpButton = await page.locator('button:has-text("Sign Up")').count();
    const createAccountButton = await page.locator('button:has-text("Create Account")').count();
    
    if (signUpButton > 0 || createAccountButton > 0) {
      console.log('✓ Page switches to signup mode');
    } else {
      console.log('✗ Page did not switch to signup mode');
    }
    
    console.log('\n3. Testing login functionality...');
    
    // Switch back to signin mode
    const signInLink = await page.locator('text=sign in').count();
    if (signInLink > 0) {
      await page.click('text=sign in');
      await page.waitForTimeout(1000);
    }
    
    // Test login with valid credentials
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Sign in")');
    
    // Wait for redirect to dashboard
    try {
      await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
      console.log('✓ Login successful - redirects to dashboard');
      
      // Check if dashboard is loaded
      const dashboardTitle = await page.locator('text=Sunbeam Fund Management').count();
      if (dashboardTitle > 0) {
        console.log('✓ Dashboard loads correctly after login');
      } else {
        console.log('✗ Dashboard title not found after login');
      }
      
    } catch (error) {
      console.log('✗ Login failed or did not redirect properly');
    }
    
    console.log('\n4. Testing authenticated user access...');
    
    // Try visiting homepage again (should show dashboard, not redirect)
    await page.goto('https://sunbeam.capital');
    await page.waitForTimeout(2000);
    
    const currentUrlAfterLogin = page.url();
    if (currentUrlAfterLogin === 'https://sunbeam.capital/') {
      console.log('✓ Authenticated users stay on homepage (no redirect)');
    } else {
      console.log('✗ Authenticated users redirected unnecessarily');
      console.log(`  Current URL: ${currentUrlAfterLogin}`);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'login-landing-test.png', fullPage: true });
    console.log('\nScreenshot saved as login-landing-test.png');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testLoginLandingPage().catch(console.error);