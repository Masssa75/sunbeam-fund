const { chromium } = require('playwright');

async function testLoginFix() {
  console.log('Testing login fix for marc@cyrator.com...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. First test the API directly
    console.log('1. Testing login API directly...');
    
    const apiResponse = await page.evaluate(async () => {
      const response = await fetch('https://sunbeam.capital/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'marc@cyrator.com',
          password: '123456'
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      return {
        status: response.status,
        data: data
      };
    });
    
    console.log('API Response:', JSON.stringify(apiResponse, null, 2));
    
    // 2. Now test through the UI
    console.log('\n2. Testing login through UI...');
    await page.goto('https://sunbeam.capital/login');
    
    // Take screenshot before login
    await page.screenshot({ path: 'login-before.png', fullPage: true });
    console.log('📸 Screenshot saved: login-before.png');
    
    // Fill login form
    await page.fill('input[type="email"]', 'marc@cyrator.com');
    await page.fill('input[type="password"]', '123456');
    
    // Click sign in button
    await page.click('button:has-text("Sign in")');
    
    // Wait for either success (redirect) or error message
    const result = await Promise.race([
      page.waitForURL('https://sunbeam.capital/', { timeout: 10000 }).then(() => 'success'),
      page.waitForSelector('.text-red-600', { timeout: 10000 }).then(() => 'error'),
      page.waitForTimeout(10000).then(() => 'timeout')
    ]);
    
    // Take screenshot after login attempt
    await page.screenshot({ path: 'login-after.png', fullPage: true });
    console.log('📸 Screenshot saved: login-after.png');
    
    if (result === 'success') {
      console.log('\n✅ Login successful! Redirected to dashboard.');
      
      // Check if we can see investor dashboard elements
      const hasPortfolio = await page.locator('text=Current Standing').count() > 0;
      if (hasPortfolio) {
        console.log('✅ Investor dashboard loaded correctly');
      }
    } else if (result === 'error') {
      const errorText = await page.locator('.text-red-600').textContent();
      console.log('\n❌ Login failed with error:', errorText);
    } else {
      console.log('\n❌ Login timed out - no redirect or error message');
    }
    
    // 3. Check session status
    console.log('\n3. Checking session status...');
    await page.goto('https://sunbeam.capital/api/auth/session/');
    const sessionText = await page.locator('body').textContent();
    console.log('Session response:', sessionText);
    
  } catch (error) {
    console.error('Error during test:', error.message);
    await page.screenshot({ path: 'login-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: login-error.png');
  } finally {
    await browser.close();
  }
}

testLoginFix().catch(console.error);