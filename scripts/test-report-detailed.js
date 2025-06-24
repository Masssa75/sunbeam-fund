const { chromium } = require('playwright');

async function testReportDetailed() {
  console.log('🧪 Testing Monthly Report Page (Detailed)...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', err => console.log('Browser error:', err));
    
    // Test 1: Navigate to report page
    console.log('📄 Test 1: Navigating to report page...');
    const response = await page.goto('https://sunbeam.capital/report?month=2024-11&name=Ralph%20Sigg&account=003&share=38.9', {
      waitUntil: 'networkidle'
    });
    console.log(`Page loaded with status: ${response.status()}`);
    
    // Wait a bit for React to render
    await page.waitForTimeout(3000);
    
    // Take screenshot of current state
    await page.screenshot({ path: 'test-report-loading.png', fullPage: true });
    console.log('📸 Loading state screenshot saved');
    
    // Check what's on the page
    const pageText = await page.textContent('body');
    console.log('\nPage content preview:', pageText.substring(0, 200) + '...');
    
    // Check for specific elements
    const hasTitle = await page.locator('h1').count();
    const hasLoading = await page.locator('text=Loading').count();
    const hasError = await page.locator('text=error').count();
    
    console.log(`\nElement check:
    - H1 elements: ${hasTitle}
    - Loading text: ${hasLoading}
    - Error text: ${hasError}`);
    
    // Test API endpoint directly
    console.log('\n📊 Test 2: Testing report-data API endpoint...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/report-data');
        const data = await res.json();
        return { status: res.status, dataLength: data.length };
      } catch (err) {
        return { error: err.message };
      }
    });
    console.log('API Response:', apiResponse);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testReportDetailed().catch(console.error);