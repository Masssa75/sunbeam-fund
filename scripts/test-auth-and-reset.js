const { chromium } = require('playwright');

async function testAuthAndReset() {
  console.log('=== Testing Login and Password Reset ===\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser window for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    // Clear all cookies and cache
    storageState: undefined
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
    }
  });
  
  // Monitor network requests
  page.on('response', response => {
    if (response.url().includes('/api/') && response.status() >= 400) {
      console.log(`❌ API Error: ${response.url()} - Status: ${response.status()}`);
    }
  });
  
  try {
    // Test 1: Try logging in with marc@cyrator.com
    console.log('1. Testing login with marc@cyrator.com...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'login-page.png', fullPage: true });
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'marc@cyrator.com');
    await page.fill('input[type="password"]', '123456');
    
    // Click sign in
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Check if we're still on login page
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);
    
    // Check for error message
    const errorElement = await page.locator('text=Invalid email or password').first();
    const hasError = await errorElement.count() > 0;
    if (hasError) {
      console.log('❌ Login failed - "Invalid email or password" error shown');
      await page.screenshot({ path: 'login-error.png', fullPage: true });
    } else if (currentUrl.includes('/login')) {
      console.log('❌ Login failed - Still on login page');
    } else {
      console.log('✅ Login successful - Redirected to:', currentUrl);
    }
    
    // Test 2: Test password reset
    console.log('\n2. Testing password reset functionality...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    // Click "Forgot your password?" link
    const forgotLink = await page.locator('text=Forgot your password?').first();
    if (await forgotLink.count() > 0) {
      await forgotLink.click();
      await page.waitForLoadState('networkidle');
      
      console.log('Current URL after clicking forgot password:', page.url());
      await page.screenshot({ path: 'forgot-password-page.png', fullPage: true });
      
      // Fill in email for password reset
      await page.fill('input[type="email"]', 'marc@cyrator.com');
      
      // Look for submit button
      const resetButton = await page.locator('button:has-text("Send reset link"), button:has-text("Reset password"), button[type="submit"]').first();
      if (await resetButton.count() > 0) {
        console.log('Found reset button, clicking...');
        await resetButton.click();
        
        // Wait for response
        await page.waitForTimeout(5000);
        
        // Check for success or error message
        const successMessage = await page.locator('text=Check your email, text=email has been sent, text=reset link').first();
        const errorMessage = await page.locator('text=error, text=failed').first();
        
        if (await successMessage.count() > 0) {
          console.log('✅ Password reset email sent successfully');
          const successText = await successMessage.textContent();
          console.log('Success message:', successText);
        } else if (await errorMessage.count() > 0) {
          console.log('❌ Password reset failed');
          const errorText = await errorMessage.textContent();
          console.log('Error message:', errorText);
        } else {
          console.log('⚠️ No clear success or error message found');
        }
        
        await page.screenshot({ path: 'reset-result.png', fullPage: true });
      } else {
        console.log('❌ Could not find reset button');
      }
    } else {
      console.log('❌ Could not find "Forgot your password?" link');
    }
    
    // Test 3: Check Supabase auth configuration
    console.log('\n3. Checking Supabase auth endpoints...');
    
    // Test the auth API directly
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('https://gualxudgbmpuhjbumfeh.supabase.co/auth/v1/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzNjI1NDAsImV4cCI6MjAzNDkzODU0MH0.LXnDvD1OAkPGlLX6lePKFBCp3Tpay0_bW7OyygCvyH4'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'testpassword123'
          })
        });
        return {
          status: res.status,
          ok: res.ok,
          headers: Object.fromEntries(res.headers.entries())
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('Supabase auth endpoint test:', response);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n✅ Test complete. Browser window will remain open for 30 seconds...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

testAuthAndReset().catch(console.error);