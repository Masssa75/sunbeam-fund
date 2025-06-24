const { chromium } = require('playwright');

async function testNavigationConsole() {
  console.log('🧪 Testing Navigation Component Console');
  console.log('======================================\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Collect all console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });
    
    // Collect network errors
    const networkErrors = [];
    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        failure: request.failure()
      });
    });
    
    console.log('1. Loading production site...');
    await page.goto('https://sunbeam.capital', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Wait for any async operations
    
    console.log('\n2. Console Messages:');
    if (consoleMessages.length === 0) {
      console.log('   No console messages');
    } else {
      consoleMessages.forEach(msg => {
        console.log(`   [${msg.type}] ${msg.text}`);
        if (msg.location.url) {
          console.log(`      at ${msg.location.url}:${msg.location.lineNumber}`);
        }
      });
    }
    
    console.log('\n3. Network Errors:');
    if (networkErrors.length === 0) {
      console.log('   No network errors');
    } else {
      networkErrors.forEach(err => {
        console.log(`   Failed: ${err.url}`);
        console.log(`   Reason: ${err.failure.errorText}`);
      });
    }
    
    // Check if Navigation component exists in the DOM
    console.log('\n4. Navigation Component Check:');
    const hasNav = await page.locator('nav').count() > 0;
    console.log(`   Nav element exists: ${hasNav}`);
    
    // Check for React error boundary
    const hasErrorBoundary = await page.locator('text=Something went wrong').count() > 0;
    console.log(`   React error boundary triggered: ${hasErrorBoundary}`);
    
    // Try to evaluate JavaScript
    console.log('\n5. JavaScript Evaluation:');
    try {
      const jsResult = await page.evaluate(() => {
        return {
          reactMounted: typeof window !== 'undefined' && window.React !== undefined,
          nextjsPresent: typeof window !== 'undefined' && window.next !== undefined,
          documentReady: document.readyState
        };
      });
      console.log('   JS evaluation result:', jsResult);
    } catch (e) {
      console.log('   JS evaluation failed:', e.message);
    }
    
    // Get the actual HTML
    console.log('\n6. Page HTML (first 500 chars):');
    const html = await page.content();
    console.log('   ' + html.substring(0, 500).replace(/\n/g, '\n   '));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testNavigationConsole().catch(console.error);