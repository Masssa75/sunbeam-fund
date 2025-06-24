const { chromium } = require('playwright');

async function testNavigation() {
  console.log('Starting navigation test with HEADED browser (you will see the browser window)...\n');
  
  const browser = await chromium.launch({
    headless: false,  // Show the browser window so you can see what's happening
    slowMo: 1000,     // Slow down actions so they're visible
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Monitor console for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
    }
  });
  
  // Monitor failed requests
  page.on('requestfailed', request => {
    console.log('❌ Failed request:', request.url());
  });
  
  try {
    console.log('1. Navigating to homepage...');
    await page.goto('https://sunbeam.capital', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait a bit to let everything load
    await page.waitForTimeout(3000);
    
    console.log('2. Taking screenshot of current state...');
    await page.screenshot({ path: 'navigation-current-state.png', fullPage: true });
    
    console.log('3. Checking what navigation elements are visible...');
    
    // Check for various navigation selectors
    const navSelectors = [
      'nav',
      'header',
      '[role="navigation"]',
      '.navigation',
      '#navigation',
      'div[class*="nav"]',
      'div[class*="Nav"]',
      'a[href="/"]',
      'text=Sunbeam Fund',
      'text=Portfolio',
      'text=Reports',
      'text=Admin'
    ];
    
    for (const selector of navSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ Found "${selector}": ${count} element(s)`);
        // Get the text content if possible
        try {
          const firstElement = page.locator(selector).first();
          const text = await firstElement.textContent({ timeout: 1000 });
          if (text && text.trim()) {
            console.log(`  Content: "${text.trim().substring(0, 100)}..."`);
          }
        } catch (e) {
          // Ignore timeout errors for text content
        }
      }
    }
    
    console.log('\n4. Checking page HTML structure...');
    // Get the nav/header HTML
    const navHTML = await page.evaluate(() => {
      const nav = document.querySelector('nav') || document.querySelector('header') || document.querySelector('[role="navigation"]');
      return nav ? nav.outerHTML.substring(0, 500) : 'No nav element found';
    });
    console.log('Navigation HTML:', navHTML);
    
    console.log('\n5. Checking for hydration issues...');
    // Check if React/Next.js has hydrated
    const isHydrated = await page.evaluate(() => {
      return window.__NEXT_DATA__ !== undefined;
    });
    console.log('Next.js detected:', isHydrated);
    
    console.log('\n6. Waiting to see if navigation changes after full hydration...');
    await page.waitForTimeout(5000);
    
    console.log('7. Taking final screenshot...');
    await page.screenshot({ path: 'navigation-after-wait.png', fullPage: true });
    
    // Check navigation visibility again
    console.log('\n8. Final navigation check:');
    const finalNavText = await page.evaluate(() => {
      const nav = document.querySelector('nav') || document.querySelector('header');
      return nav ? nav.innerText : 'No navigation found';
    });
    console.log('Navigation text:', finalNavText);
    
    console.log('\n9. Checking for authentication state...');
    // Try to click on admin/investor links if they exist
    const hasAdminLink = await page.locator('text=Admin').count() > 0;
    const hasInvestorLink = await page.locator('text=Investor').count() > 0;
    console.log('Has Admin link:', hasAdminLink);
    console.log('Has Investor link:', hasInvestorLink);
    
    console.log('\n✅ Test complete! Check the screenshots and browser window.');
    console.log('The browser will stay open for 10 seconds so you can inspect...');
    
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testNavigation().catch(console.error);