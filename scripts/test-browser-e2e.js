const { chromium } = require('playwright');

async function testFullE2E() {
  console.log('🧪 Starting full E2E browser test...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await chromium.launch({ 
      headless: true,
      timeout: 60000 
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('[PortfolioTable]')) {
        console.log('   Browser console:', msg.text());
      }
    });
    
    // 1. Test Homepage
    console.log('1. Testing Homepage (https://sunbeam.capital)');
    console.log('   - Navigating to homepage...');
    
    await page.goto('https://sunbeam.capital', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for React to render
    console.log('   - Waiting for React to render...');
    await page.waitForTimeout(5000);
    
    // Check what's displayed
    const bodyText = await page.textContent('body');
    console.log('   - Checking page content...');
    
    if (bodyText.includes('Loading Portfolio...')) {
      console.log('   ❌ FAIL: Still showing "Loading Portfolio..."');
    } else if (bodyText.includes('Authentication Required')) {
      console.log('   ✅ SUCCESS: Shows "Authentication Required"');
    } else if (bodyText.includes('Portfolio Overview')) {
      console.log('   ⚠️  WARNING: Shows portfolio without auth');
    } else {
      console.log('   ℹ️  Page content preview:', bodyText.substring(0, 150).replace(/\s+/g, ' ') + '...');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'homepage-screenshot.png' });
    console.log('   - Screenshot saved: homepage-screenshot.png');
    
    // 2. Test Login Link
    console.log('\n2. Testing Login Navigation');
    const loginLink = await page.$('a[href="/login"]');
    
    if (loginLink) {
      console.log('   ✅ Found login link');
      
      // Click login
      console.log('   - Clicking login link...');
      await loginLink.click();
      await page.waitForLoadState('networkidle');
      
      // 3. Test Login Page
      console.log('\n3. Testing Login Page');
      
      // Wait for form elements
      try {
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        console.log('   ✅ Login form loaded');
        
        // Fill credentials
        console.log('   - Entering credentials...');
        await page.fill('input[type="email"]', 'marc@minutevideos.com');
        await page.fill('input[type="password"]', '123456');
        
        // Take screenshot before submit
        await page.screenshot({ path: 'login-form-screenshot.png' });
        console.log('   - Screenshot saved: login-form-screenshot.png');
        
        // Submit form
        console.log('   - Submitting login form...');
        const submitButton = await page.$('button[type="submit"]');
        await submitButton.click();
        
        // Wait for navigation or processing
        console.log('   - Waiting for authentication...');
        
        // Wait for either success or error
        await Promise.race([
          page.waitForURL('https://sunbeam.capital/', { timeout: 15000 }),
          page.waitForSelector('.text-red-800', { timeout: 15000 }), // Error message
          page.waitForTimeout(15000)
        ]);
        
        // Check result
        await page.waitForTimeout(3000); // Extra time for React to render
        
        // 4. Test Portfolio Display
        console.log('\n4. Testing Portfolio Display');
        const afterLoginText = await page.textContent('body');
        const currentUrl = page.url();
        
        console.log('   - Current URL:', currentUrl);
        
        if (afterLoginText.includes('Portfolio Overview')) {
          console.log('   ✅ SUCCESS: Portfolio is displayed!');
          
          // Check for positions
          const positions = await page.$$('.border.rounded-lg.p-4');
          console.log(`   ✅ Found ${positions.length} portfolio positions`);
          
          // Get total value
          const totalValue = await page.textContent('text=/Total Portfolio Value/');
          if (totalValue) {
            console.log('   ✅', totalValue);
          }
          
        } else if (afterLoginText.includes('Loading Portfolio...')) {
          console.log('   ❌ FAIL: Still showing "Loading Portfolio..." after login');
        } else if (afterLoginText.includes('Invalid login credentials')) {
          console.log('   ❌ FAIL: Login failed - invalid credentials');
        } else if (afterLoginText.includes('Processing...')) {
          console.log('   ⚠️  WARNING: Login still processing after 15 seconds');
        } else {
          console.log('   ❓ UNKNOWN STATE');
          console.log('   Page preview:', afterLoginText.substring(0, 200).replace(/\s+/g, ' ') + '...');
        }
        
        // Final screenshot
        await page.screenshot({ path: 'after-login-screenshot.png' });
        console.log('   - Screenshot saved: after-login-screenshot.png');
        
      } catch (error) {
        console.log('   ❌ ERROR:', error.message);
        await page.screenshot({ path: 'error-screenshot.png' });
        console.log('   - Error screenshot saved: error-screenshot.png');
      }
      
    } else {
      console.log('   ❌ No login link found on homepage');
      
      // Try to find any auth-related elements
      const authElements = await page.$$('text=/[Aa]uth|[Ll]ogin|[Ss]ign/');
      console.log(`   - Found ${authElements.length} auth-related elements`);
    }
    
    // 5. Summary
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY:');
    console.log('- Homepage loads: ✅');
    console.log('- Shows auth state: ' + (bodyText.includes('Authentication Required') ? '✅' : '❌'));
    console.log('- Login form works: ' + (await page.$('input[type="email"]') ? '✅' : '❌'));
    console.log('- Can authenticate: TBD (check screenshots)');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testFullE2E().catch(console.error);