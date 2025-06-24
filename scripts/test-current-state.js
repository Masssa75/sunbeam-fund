const { chromium } = require('playwright');

async function testCurrentState() {
  console.log('🔍 Testing Current State of Application\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser
    slowMo: 500 // Slow actions
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Log all console messages
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    console.log('1. Going to home page...');
    await page.goto('https://sunbeam.capital/');
    await page.waitForTimeout(3000);
    
    // Check what's on the page
    const bodyText = await page.textContent('body');
    console.log('\n2. Page content includes:');
    console.log('- "Sign out":', bodyText.includes('Sign out') ? 'YES' : 'NO');
    console.log('- "Sign in":', bodyText.includes('Sign in') ? 'YES' : 'NO'); 
    console.log('- "Loading":', bodyText.includes('Loading') ? 'YES' : 'NO');
    console.log('- "Total Value":', bodyText.includes('Total Value') ? 'YES' : 'NO');
    console.log('- "$0.00":', bodyText.includes('$0.00') ? 'YES' : 'NO');
    console.log('- "Authentication Required":', bodyText.includes('Authentication Required') ? 'YES' : 'NO');
    
    // If not logged in, try to login
    if (bodyText.includes('Sign in') || bodyText.includes('Authentication Required')) {
      console.log('\n3. Not logged in, clicking login...');
      
      // Try to find and click login button/link
      const loginLink = await page.$('a[href="/login"]');
      if (loginLink) {
        await loginLink.click();
        await page.waitForLoadState('networkidle');
      } else {
        await page.goto('https://sunbeam.capital/login');
      }
      
      console.log('4. Filling login form...');
      await page.fill('input[name="email"]', 'marc@minutevideos.com');
      await page.fill('input[name="password"]', '123456');
      
      console.log('5. Submitting...');
      await page.click('button[type="submit"]');
      
      console.log('6. Waiting for navigation...');
      await page.waitForTimeout(5000);
      
      // Check result
      const afterLoginText = await page.textContent('body');
      console.log('\n7. After login, page includes:');
      console.log('- "Sign out":', afterLoginText.includes('Sign out') ? 'YES' : 'NO');
      console.log('- "Total Value":', afterLoginText.includes('Total Value') ? 'YES' : 'NO');
      console.log('- "$0.00":', afterLoginText.includes('$0.00') ? 'YES' : 'NO');
      console.log('- "Loading":', afterLoginText.includes('Loading') ? 'YES' : 'NO');
      console.log('- Current URL:', page.url());
    }
    
    console.log('\nKeeping browser open for 30 seconds for manual inspection...');
    console.log('Press Ctrl+C to close.');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testCurrentState();