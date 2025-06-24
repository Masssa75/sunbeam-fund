const { chromium } = require('playwright');

async function testPortfolioLoading() {
  console.log('Testing portfolio loading after login...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`[Browser ${msg.type()}]:`, msg.text());
    });
    
    console.log('1. Logging in...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
    console.log('✓ Login successful - redirected to portfolio\n');
    
    console.log('2. Waiting for portfolio to load...');
    
    // Wait up to 10 seconds for portfolio to load
    let portfolioLoaded = false;
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);
      const content = await page.textContent('body');
      
      if (content.includes('Total Value')) {
        portfolioLoaded = true;
        console.log(`✓ Portfolio loaded after ${i + 1} seconds`);
        
        // Check for specific values
        if (content.includes('$')) {
          console.log('✓ Portfolio showing dollar values');
        }
        if (content.includes('positions')) {
          console.log('✓ Portfolio showing positions count');
        }
        
        break;
      } else if (content.includes('Loading Portfolio')) {
        console.log(`  Still loading after ${i + 1} seconds...`);
      }
    }
    
    if (!portfolioLoaded) {
      console.log('\n❌ Portfolio did not load within 10 seconds');
      const content = await page.textContent('body');
      console.log('\nPage content includes:');
      if (content.includes('Loading Portfolio')) console.log('- "Loading Portfolio..."');
      if (content.includes('Sign out')) console.log('- Sign out button (user is authenticated)');
      if (content.includes('Error')) console.log('- Error message');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'portfolio-loading-issue.png' });
      console.log('\nScreenshot saved as portfolio-loading-issue.png');
    }
    
    // Check network requests
    console.log('\n3. Checking API calls...');
    
    // Navigate away and back to trigger fresh API call
    await page.goto('https://sunbeam.capital/investor');
    await page.waitForTimeout(2000);
    await page.goto('https://sunbeam.capital/');
    await page.waitForTimeout(3000);
    
    const finalContent = await page.textContent('body');
    if (finalContent.includes('Total Value')) {
      console.log('✓ Portfolio loads correctly on navigation');
    } else {
      console.log('❌ Portfolio still not loading after navigation');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testPortfolioLoading();