const { chromium } = require('playwright');

async function testLoginUI() {
  console.log('Testing login through browser UI...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show browser to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Clear any existing sessions
    await context.clearCookies();
    
    console.log('1. Navigating to login page...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'login-page.png', fullPage: true });
    console.log('📸 Screenshot saved: login-page.png');
    
    console.log('2. Filling login form with marc@cyrator.com...');
    
    // Fill the form
    await page.fill('input[type="email"]', 'marc@cyrator.com');
    await page.fill('input[type="password"]', '123456');
    
    // Take screenshot with filled form
    await page.screenshot({ path: 'login-filled.png', fullPage: true });
    console.log('📸 Screenshot saved: login-filled.png');
    
    console.log('3. Clicking Sign in button...');
    
    // Click sign in
    await page.click('button:has-text("Sign in")');
    
    // Wait for navigation or error
    const result = await Promise.race([
      page.waitForURL('https://sunbeam.capital/', { timeout: 15000 })
        .then(() => 'redirected'),
      page.waitForSelector('.text-red-600', { timeout: 15000 })
        .then(() => 'error'),
      page.waitForTimeout(15000).then(() => 'timeout')
    ]);
    
    // Take final screenshot
    await page.screenshot({ path: 'login-result.png', fullPage: true });
    console.log('📸 Screenshot saved: login-result.png');
    
    if (result === 'redirected') {
      console.log('\n✅ Login successful! Redirected to dashboard.');
      
      // Check what's on the page
      const pageTitle = await page.title();
      const url = page.url();
      console.log('Current URL:', url);
      console.log('Page title:', pageTitle);
      
      // Look for investor dashboard elements
      const hasStanding = await page.locator('text=Current Standing').count() > 0;
      const hasPortfolio = await page.locator('text=Portfolio').count() > 0;
      
      if (hasStanding) {
        console.log('✅ Investor dashboard loaded successfully');
      } else if (hasPortfolio) {
        console.log('✅ Main dashboard loaded successfully');
      }
      
    } else if (result === 'error') {
      const errorText = await page.locator('.text-red-600').textContent();
      console.log('\n❌ Login failed with error:', errorText);
      
      // Get the full page content to debug
      const pageContent = await page.content();
      if (pageContent.includes('Invalid email or password')) {
        console.log('Error details: Invalid credentials error shown');
      }
      
    } else {
      console.log('\n❌ Login attempt timed out');
    }
    
    console.log('\nPress any key to close browser...');
    await page.waitForTimeout(5000); // Keep browser open for 5 seconds
    
  } catch (error) {
    console.error('Error during test:', error.message);
    await page.screenshot({ path: 'login-browser-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: login-browser-error.png');
  } finally {
    await browser.close();
  }
}

testLoginUI().catch(console.error);