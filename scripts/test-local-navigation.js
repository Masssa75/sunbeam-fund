const { chromium } = require('playwright');

async function testLocalNavigation() {
  console.log('🧪 Testing Local Navigation Component');
  console.log('====================================\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Collect console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    console.log('1. Testing local dev server on port 3001...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'local-navigation.png' });
    console.log('   ✓ Screenshot saved: local-navigation.png');
    
    // Check navigation
    const navExists = await page.locator('nav').count() > 0;
    console.log(`   Nav element exists: ${navExists}`);
    
    if (navExists) {
      const navHTML = await page.locator('nav').first().innerHTML();
      console.log(`   Nav HTML length: ${navHTML.length} characters`);
      
      // Check for specific elements
      const hasPortfolio = await page.locator('a:has-text("Portfolio")').count() > 0;
      const hasSignIn = await page.locator('a:has-text("Sign In")').count() > 0;
      const hasSunbeam = await page.locator('text=Sunbeam Fund').count() > 0;
      
      console.log(`   Has Portfolio link: ${hasPortfolio}`);
      console.log(`   Has Sign In link: ${hasSignIn}`);
      console.log(`   Has Sunbeam Fund text: ${hasSunbeam}`);
    }
    
    // Check JavaScript execution
    const jsResult = await page.evaluate(() => {
      return {
        reactMounted: typeof window !== 'undefined' && window.React !== undefined,
        nextjsPresent: typeof window !== 'undefined' && window.next !== undefined,
        documentReady: document.readyState
      };
    });
    console.log('\n2. JavaScript state:', jsResult);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLocalNavigation().catch(console.error);