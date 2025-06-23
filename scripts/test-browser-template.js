/**
 * Browser Testing Template
 * 
 * This is a template for creating browser automation tests.
 * Copy this file and modify it for your specific test needs.
 */

const { chromium } = require('playwright');

// Configuration
const CONFIG = {
  baseUrl: 'https://sunbeam.capital',
  headless: true,        // Set to false to see the browser
  timeout: 30000,        // 30 seconds
  viewport: { width: 1280, height: 720 },
  screenshots: true,     // Take screenshots
  consoleLogs: true,     // Capture console logs
};

// Test data
const TEST_USER = {
  email: 'marc@minutevideos.com',
  password: '123456'
};

async function runTest() {
  console.log('🧪 Starting browser test...\n');
  console.log('Configuration:', CONFIG);
  console.log('=' .repeat(50) + '\n');
  
  let browser;
  let testPassed = true;
  
  try {
    // 1. SETUP - Launch browser
    console.log('📌 SETUP');
    console.log('  - Launching browser...');
    browser = await chromium.launch({ 
      headless: CONFIG.headless,
      timeout: CONFIG.timeout 
    });
    
    const context = await browser.newContext({
      viewport: CONFIG.viewport
    });
    const page = await context.newPage();
    
    // Setup console log capture
    if (CONFIG.consoleLogs) {
      page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'log') {
          console.log('  Browser LOG:', text);
        } else if (msg.type() === 'error') {
          console.log('  Browser ERROR:', text);
        }
      });
    }
    
    // Setup network monitoring
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`  ⚠️  Network error: ${response.url()} - ${response.status()}`);
      }
    });
    
    console.log('  ✅ Browser ready\n');
    
    // 2. TEST STEPS - Add your test logic here
    console.log('📌 TEST STEPS');
    
    // Example: Navigate to homepage
    console.log('  - Navigating to homepage...');
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
    
    if (CONFIG.screenshots) {
      await page.screenshot({ path: 'test-1-homepage.png' });
      console.log('    📸 Screenshot: test-1-homepage.png');
    }
    
    // Example: Check page content
    const pageTitle = await page.textContent('h1');
    console.log(`    Page title: "${pageTitle}"`);
    
    // Example: Check for specific element
    const hasLoginButton = await page.locator('a[href="/login"]').isVisible();
    if (hasLoginButton) {
      console.log('    ✅ Login button found');
    } else {
      console.log('    ❌ Login button NOT found');
      testPassed = false;
    }
    
    // Add more test steps here...
    // await page.click('...');
    // await page.fill('...', '...');
    // await page.waitForSelector('...');
    
    // 3. ASSERTIONS - Verify expected results
    console.log('\n📌 ASSERTIONS');
    
    // Example assertions
    const currentUrl = page.url();
    console.log(`  Current URL: ${currentUrl}`);
    
    const bodyText = await page.textContent('body');
    if (bodyText.includes('Expected Text')) {
      console.log('  ✅ Expected text found');
    } else {
      console.log('  ❌ Expected text NOT found');
      testPassed = false;
    }
    
    // Final screenshot
    if (CONFIG.screenshots) {
      await page.screenshot({ path: 'test-final.png' });
      console.log('  📸 Final screenshot: test-final.png');
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error(error);
    testPassed = false;
    
    // Try to take error screenshot
    if (browser) {
      try {
        const pages = context.pages();
        if (pages.length > 0) {
          await pages[0].screenshot({ path: 'test-error.png' });
          console.log('📸 Error screenshot: test-error.png');
        }
      } catch (screenshotError) {
        // Ignore screenshot errors
      }
    }
    
  } finally {
    // 4. CLEANUP
    console.log('\n📌 CLEANUP');
    if (browser) {
      await browser.close();
      console.log('  ✅ Browser closed');
    }
    
    // 5. SUMMARY
    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEST SUMMARY:');
    console.log(`  Result: ${testPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`  Duration: ${new Date().toLocaleTimeString()}`);
    console.log('=' .repeat(50));
    
    // Exit with appropriate code
    process.exit(testPassed ? 0 : 1);
  }
}

// Helper functions
async function waitForText(page, text, timeout = 5000) {
  try {
    await page.waitForFunction(
      text => document.body.innerText.includes(text),
      text,
      { timeout }
    );
    return true;
  } catch {
    return false;
  }
}

async function takeScreenshot(page, name) {
  if (CONFIG.screenshots) {
    await page.screenshot({ path: `${name}.png` });
    console.log(`    📸 Screenshot: ${name}.png`);
  }
}

// Run the test
runTest().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});