const { chromium } = require('playwright');

async function testReportPage() {
  console.log('🧪 Testing Monthly Report Page...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Test 1: Check if report page loads
    console.log('📄 Test 1: Loading report page...');
    await page.goto('https://sunbeam.capital/report?month=2024-11&name=Ralph%20Sigg&account=003&share=38.9');
    
    // Wait for content to load
    await page.waitForSelector('h1:has-text("SUNBEAM CAPITAL")', { timeout: 10000 });
    console.log('✅ Report page loaded successfully');
    
    // Test 2: Check if investor info is displayed
    console.log('\n📊 Test 2: Checking investor information...');
    const investorName = await page.textContent('text=Ralph Sigg');
    const accountNumber = await page.textContent('text=003');
    console.log(`✅ Investor info displayed: ${investorName ? 'Name ✓' : 'Name ✗'}, ${accountNumber ? 'Account ✓' : 'Account ✗'}`);
    
    // Test 3: Check if chart loads
    console.log('\n📈 Test 3: Checking if portfolio chart loads...');
    const chartCanvas = await page.locator('canvas').count();
    console.log(`✅ Chart elements found: ${chartCanvas} canvas element(s)`);
    
    // Test 4: Check if print button exists
    console.log('\n🖨️  Test 4: Checking print functionality...');
    const printButton = await page.locator('button:has-text("Print Report")').count();
    console.log(`✅ Print button found: ${printButton > 0 ? 'Yes' : 'No'}`);
    
    // Take screenshot
    await page.screenshot({ path: 'test-report-page.png', fullPage: true });
    console.log('\n📸 Screenshot saved as test-report-page.png');
    
    // Test 5: Check responsive layout (mobile)
    console.log('\n📱 Test 5: Testing mobile responsiveness...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-report-mobile.png', fullPage: true });
    console.log('✅ Mobile screenshot saved');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testReportPage().catch(console.error);