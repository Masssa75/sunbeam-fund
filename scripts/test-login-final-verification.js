const { chromium } = require('playwright');

async function testLoginFinalVerification() {
  console.log('Final verification of login fix for marc@cyrator.com...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // Clear all cookies first
    await context.clearCookies();
    
    console.log('1. Navigating to login page...');
    await page.goto('https://sunbeam.capital/login', { waitUntil: 'networkidle' });
    
    // Take initial screenshot
    await page.screenshot({ path: 'login-test-initial.png', fullPage: true });
    console.log('📸 Initial screenshot saved');
    
    console.log('\n2. Filling login form...');
    console.log('   Email: marc@cyrator.com');
    console.log('   Password: 123456');
    
    // Fill form fields
    await page.fill('input[type="email"]', 'marc@cyrator.com');
    await page.fill('input[type="password"]', '123456');
    
    // Take screenshot with filled form
    await page.screenshot({ path: 'login-test-filled.png', fullPage: true });
    console.log('📸 Filled form screenshot saved');
    
    console.log('\n3. Submitting login form...');
    
    // Click sign in button
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for one of three outcomes
    const result = await Promise.race([
      page.waitForURL('https://sunbeam.capital/', { timeout: 20000 })
        .then(() => 'success'),
      page.locator('.text-red-800').waitFor({ timeout: 20000 })
        .then(() => 'error'),
      page.waitForTimeout(20000).then(() => 'timeout')
    ]);
    
    // Take final screenshot
    await page.screenshot({ path: 'login-test-final.png', fullPage: true });
    console.log('📸 Final screenshot saved');
    
    if (result === 'success') {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('Successfully redirected to dashboard');
      
      // Check what's on the dashboard
      const url = page.url();
      console.log('Current URL:', url);
      
      // Look for investor elements
      const hasStanding = await page.locator('text=Current Standing').count() > 0;
      const hasNotifications = await page.locator('text=Notifications').count() > 0;
      
      console.log('Dashboard elements found:');
      console.log('- Current Standing:', hasStanding ? 'Yes' : 'No');
      console.log('- Notifications:', hasNotifications ? 'Yes' : 'No');
      
    } else if (result === 'error') {
      const errorElement = page.locator('.text-red-800');
      const errorText = await errorElement.textContent();
      console.log('\n❌ LOGIN FAILED');
      console.log('Error message:', errorText);
      
      // Check if it's the old hardcoded message
      if (errorText.includes('This account exists but may have a different password')) {
        console.log('\n⚠️  The old hardcoded error message is still showing!');
        console.log('The deployment may not have updated yet.');
      }
      
    } else {
      console.log('\n❌ LOGIN TIMEOUT');
      console.log('No response after 20 seconds');
    }
    
    // Additional debugging info
    console.log('\n4. Page state analysis:');
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log('- Page title:', pageTitle);
    console.log('- Current URL:', pageUrl);
    
    // Check for any console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    if (consoleErrors.length > 0) {
      console.log('\nConsole errors detected:');
      consoleErrors.forEach(err => console.log('- ', err));
    }
    
  } catch (error) {
    console.error('\nTest error:', error.message);
    await page.screenshot({ path: 'login-test-error.png', fullPage: true });
    console.log('📸 Error screenshot saved');
  } finally {
    await browser.close();
  }
  
  console.log('\n✅ Test complete. Check screenshots for visual confirmation.');
}

testLoginFinalVerification().catch(console.error);