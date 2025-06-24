const { chromium } = require('playwright');

async function testManualSignup() {
  console.log('🧪 Testing Manual Signup Process and Welcome Message');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser so we can see what happens
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('\n1. Opening signup page...');
    await page.goto('https://sunbeam.capital/login?mode=signup');
    
    // Generate a unique email for this test
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;
    
    console.log(`2. Filling out signup form with email: ${testEmail}`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Take a screenshot before submitting
    await page.screenshot({ path: 'before-signup.png', fullPage: true });
    
    console.log('3. Submitting signup form...');
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(10000);
    
    // Check what happened
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');
    
    console.log('4. Checking result...');
    console.log('   🔍 Current URL:', currentUrl);
    
    if (pageContent.includes('Check your email for the confirmation link')) {
      console.log('   ✅ Signup successful - email confirmation required');
      console.log('   📧 User needs to confirm email before logging in');
    } else if (pageContent.includes('Welcome to Sunbeam Fund')) {
      console.log('   ✅ Signup successful and logged in - seeing welcome message!');
    } else if (pageContent.includes('already registered')) {
      console.log('   ⚠️  Email already registered, trying to sign in instead...');
      
      // Switch to signin mode and try logging in
      await page.click('text=Sign in');
      await page.waitForTimeout(2000);
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      const signInContent = await page.textContent('body');
      if (signInContent.includes('Welcome to Sunbeam Fund')) {
        console.log('   ✅ Sign in successful - seeing welcome message!');
      } else {
        console.log('   ❌ Sign in failed or confirmation needed');
      }
    } else {
      console.log('   ❓ Unexpected result');
    }
    
    await page.screenshot({ path: 'after-signup-attempt.png', fullPage: true });
    
    // If we're still on login page, let's try with a confirmed account
    if (currentUrl.includes('/login')) {
      console.log('\n5. Trying with existing confirmed account (test@sunbeam.capital)...');
      
      await page.goto('https://sunbeam.capital/login');
      await page.fill('input[type="email"]', 'test@sunbeam.capital');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      const finalUrl = page.url();
      const finalContent = await page.textContent('body');
      
      console.log('   🔍 Final URL:', finalUrl);
      if (finalContent.includes('Welcome to Sunbeam Fund')) {
        console.log('   ✅ Welcome message displayed successfully!');
      } else if (finalContent.includes('Invalid email or password')) {
        console.log('   ❌ Test account does not exist or wrong password');
      } else {
        console.log('   📄 Content preview:', finalContent.substring(0, 200) + '...');
      }
      
      await page.screenshot({ path: 'test-account-login.png', fullPage: true });
    }
    
    console.log('\n✅ Manual signup test completed!');
    console.log('📸 Screenshots: before-signup.png, after-signup-attempt.png, test-account-login.png');
    console.log('\n🎯 Keep browser open for 30 seconds to inspect manually...');
    
    // Keep browser open for manual inspection
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'signup-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testManualSignup().catch(console.error);