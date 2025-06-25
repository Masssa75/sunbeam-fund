const { chromium } = require('playwright');

async function testInvestorDashboard() {
  console.log('🧪 Testing new investor dashboard...');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Console error:', msg.text());
    }
  });
  
  try {
    console.log('📱 Navigating to investor page...');
    await page.goto('https://sunbeam.capital/investor', { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'investor-dashboard-test.png', fullPage: true });
    console.log('📸 Screenshot saved as investor-dashboard-test.png');
    
    // Check if the new dashboard elements are present
    console.log('🔍 Checking for dashboard elements...');
    
    // Wait for the main title
    try {
      await page.waitForText('You own the future of blockchain', { timeout: 10000 });
      console.log('✅ Found main title');
    } catch (err) {
      console.log('❌ Main title not found');
    }
    
    // Check for performance section
    const hasPerformanceSection = await page.locator('text=Current Value').count() > 0;
    console.log(`${hasPerformanceSection ? '✅' : '❌'} Performance section:`, hasPerformanceSection);
    
    // Check for navigation header
    const hasNavigation = await page.locator('text=Sunbeam Capital').count() > 0;
    console.log(`${hasNavigation ? '✅' : '❌'} Navigation header:`, hasNavigation);
    
    // Check for portfolio holdings
    const hasHoldings = await page.locator('text=Kaspa').count() > 0;
    console.log(`${hasHoldings ? '✅' : '❌'} Portfolio holdings:`, hasHoldings);
    
    // Look for any error messages
    const errorMessages = await page.locator('text=Error').count();
    console.log(`${errorMessages === 0 ? '✅' : '❌'} Error messages:`, errorMessages);
    
    // Check loading state
    const isLoading = await page.locator('text=Loading Portfolio').count() > 0;
    console.log(`${!isLoading ? '✅' : '❌'} Loading state:`, !isLoading);
    
    console.log('\n📊 Summary:');
    console.log(`Console errors: ${errors.length}`);
    console.log(`Page loaded successfully: ${hasNavigation && !isLoading}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Console Errors:');
      errors.forEach(error => console.log('  -', error));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'investor-dashboard-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as investor-dashboard-error.png');
  } finally {
    await browser.close();
  }
}

testInvestorDashboard().catch(console.error);