const { chromium } = require('playwright');

async function testLoginCachingIssue() {
  console.log('=== Testing Login with Cache Clearing ===\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Create context with cache disabled
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    // Disable cache
    bypassCSP: true,
    offline: false,
    // Clear all storage
    storageState: {
      cookies: [],
      origins: []
    }
  });
  
  // Also set extra headers to prevent caching
  await context.setExtraHTTPHeaders({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  const page = await context.newPage();
  
  // Monitor console for errors
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  // Monitor network requests
  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('supabase')) {
      console.log(`→ ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/') || response.url().includes('supabase')) {
      console.log(`← ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    // Step 1: Clear everything and go to login
    console.log('1. Navigating to login page with cleared cache...');
    await page.goto('https://sunbeam.capital/login', {
      waitUntil: 'networkidle'
    });
    
    // Take screenshot
    await page.screenshot({ path: 'login-fresh.png' });
    
    // Step 2: Try logging in
    console.log('\n2. Attempting login with marc@cyrator.com...');
    await page.fill('input[type="email"]', 'marc@cyrator.com');
    await page.fill('input[type="password"]', '123456');
    
    // Intercept the form submission to see what happens
    const navigationPromise = page.waitForNavigation({ 
      timeout: 30000,
      waitUntil: 'networkidle' 
    }).catch(() => null);
    
    await page.click('button[type="submit"]');
    
    // Wait for either navigation or error
    await Promise.race([
      navigationPromise,
      page.waitForSelector('text=Invalid email or password', { timeout: 5000 }).catch(() => null),
      page.waitForTimeout(5000)
    ]);
    
    const currentUrl = page.url();
    console.log('\nCurrent URL:', currentUrl);
    
    // Check for error messages
    const errorVisible = await page.locator('text=Invalid email or password').isVisible().catch(() => false);
    if (errorVisible) {
      console.log('❌ Error message visible: "Invalid email or password"');
    }
    
    // Check if we're logged in
    if (currentUrl.includes('/admin') || currentUrl === 'https://sunbeam.capital/') {
      console.log('✅ Login successful!');
      
      // Check local storage and cookies
      const localStorage = await page.evaluate(() => {
        return Object.keys(window.localStorage).map(key => ({
          key,
          value: window.localStorage.getItem(key)?.substring(0, 50) + '...'
        }));
      });
      
      console.log('\nLocal Storage keys:', localStorage.map(item => item.key));
      
      const cookies = await context.cookies();
      console.log('\nCookies:', cookies.map(c => c.name));
    } else {
      console.log('❌ Still on login page');
    }
    
    await page.screenshot({ path: 'login-result.png' });
    
    // Step 3: Test password reset flow
    console.log('\n3. Testing password reset flow...');
    if (!currentUrl.includes('/login')) {
      await page.goto('https://sunbeam.capital/login');
    }
    
    // Look for the forgot password button
    const forgotButton = await page.locator('button:has-text("Forgot your password?")');
    if (await forgotButton.isVisible()) {
      console.log('Found "Forgot your password?" button');
      await forgotButton.click();
      await page.waitForTimeout(1000);
      
      // Check if mode changed
      const resetTitle = await page.locator('text=Reset your password').isVisible();
      if (resetTitle) {
        console.log('✅ Switched to password reset mode');
        
        // Try to reset password
        await page.fill('input[type="email"]', 'marc@cyrator.com');
        await page.click('button[type="submit"]');
        
        // Wait for response
        await page.waitForTimeout(3000);
        
        // Check for success message
        const successMsg = await page.locator('text=Check your email').isVisible().catch(() => false);
        const errorMsg = await page.locator('.bg-red-50').isVisible().catch(() => false);
        
        if (successMsg) {
          console.log('✅ Password reset email sent successfully');
        } else if (errorMsg) {
          const errorText = await page.locator('.bg-red-50').textContent();
          console.log('❌ Password reset error:', errorText);
        }
      }
    }
    
    await page.screenshot({ path: 'password-reset-result.png' });
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    console.log('\n✅ Test complete. Browser will remain open for inspection...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

testLoginCachingIssue().catch(console.error);