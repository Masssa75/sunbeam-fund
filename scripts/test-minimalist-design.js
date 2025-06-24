const { chromium } = require('playwright');

async function testMinimalistDesign() {
  console.log('Testing ultra minimalist welcome page design...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('1. Testing non-authenticated homepage...');
    await page.goto('https://sunbeam.capital');
    await page.waitForTimeout(3000);
    
    // Check that main title/subtitle are NOT displayed
    const mainTitle = await page.locator('text=Sunbeam Fund Management').count();
    const subtitle = await page.locator('text=Crypto portfolio tracking and reporting system').count();
    
    if (mainTitle === 0 && subtitle === 0) {
      console.log('✓ Main title and subtitle are properly hidden');
    } else {
      console.log('✗ Main title/subtitle still visible (should be hidden)');
    }
    
    // Check for welcome message
    const welcomeText = await page.locator('text=Welcome to Sunbeam Capital').count();
    if (welcomeText > 0) {
      console.log('✓ Welcome message is displayed');
    } else {
      console.log('✗ Welcome message not found');
    }
    
    // Check for Login and Sign Up buttons
    const loginButton = await page.locator('text=Login').first();
    const signupButton = await page.locator('text=Sign Up').first();
    
    if (await loginButton.count() > 0) {
      console.log('✓ Login button is displayed');
    } else {
      console.log('✗ Login button not found');
    }
    
    if (await signupButton.count() > 0) {
      console.log('✓ Sign Up button is displayed');
    } else {
      console.log('✗ Sign Up button not found');
    }
    
    console.log('\n2. Testing signup button functionality...');
    
    // Click signup button
    await signupButton.click();
    
    // Wait for navigation to login page with signup mode
    await page.waitForURL(/.*\/login.*/, { timeout: 10000 });
    const currentUrl = page.url();
    
    if (currentUrl.includes('/login') && currentUrl.includes('mode=signup')) {
      console.log('✓ Sign Up button redirects to login page with signup mode');
    } else {
      console.log('✗ Sign Up button did not redirect properly');
      console.log(`  Current URL: ${currentUrl}`);
    }
    
    // Check if the login page shows signup mode
    await page.waitForTimeout(2000);
    const signUpMode = await page.locator('text=Sign Up').count();
    const createAccount = await page.locator('text=Create Account').count();
    
    if (signUpMode > 0 || createAccount > 0) {
      console.log('✓ Login page shows signup mode');
    } else {
      console.log('✗ Login page not in signup mode');
    }
    
    console.log('\n3. Testing login button functionality...');
    
    // Go back and test login button
    await page.goto('https://sunbeam.capital');
    await page.waitForTimeout(2000);
    
    const loginBtn = await page.locator('text=Login').first();
    await loginBtn.click();
    
    await page.waitForURL(/.*\/login.*/, { timeout: 10000 });
    const loginUrl = page.url();
    
    if (loginUrl.includes('/login') && !loginUrl.includes('mode=signup')) {
      console.log('✓ Login button redirects to login page in signin mode');
    } else {
      console.log('✗ Login button did not redirect properly');
      console.log(`  Current URL: ${loginUrl}`);
    }
    
    // Take screenshot
    await page.goto('https://sunbeam.capital');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'minimalist-design-test.png', fullPage: true });
    console.log('\nScreenshot saved as minimalist-design-test.png');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testMinimalistDesign().catch(console.error);