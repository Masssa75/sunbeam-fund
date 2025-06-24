const { chromium } = require('playwright');

async function testInvestorViewDetailed() {
  console.log('🧪 Testing Investor View Detailed');
  console.log('=================================\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });
  
  try {
    // Test 1: Login
    console.log('1. Logging in...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    console.log('   ✅ Login successful');
    
    // Test 2: Navigate to investor view
    console.log('\n2. Navigating to Investor View...');
    await page.click('text=Investor View');
    await page.waitForURL('**/investor/**', { timeout: 5000 });
    await page.waitForTimeout(3000); // Give content time to load
    console.log('   ✅ Navigated to investor page');
    
    // Test 3: Analyze page structure
    console.log('\n3. Analyzing page content...');
    
    // Check for specific headings
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('   Headings found:');
    headings.forEach(h => console.log(`     - "${h}"`));
    
    // Check for loading states
    const loadingStates = await page.locator('text=/Loading|loading/').count();
    console.log(`\n   Loading indicators: ${loadingStates}`);
    
    // Check for specific investor view elements
    const elements = {
      'Portfolio Performance': await page.locator('text="Portfolio Performance"').count(),
      'Your Holdings': await page.locator('text="Your Holdings"').count(),
      'Monthly Performance': await page.locator('text="Monthly Performance"').count(),
      'Total Value': await page.locator('text=/Total Value/').count(),
      'Table with holdings': await page.locator('table').count(),
      'Chart/Graph': await page.locator('canvas, svg[role="img"]').count()
    };
    
    console.log('\n   Element check:');
    for (const [name, count] of Object.entries(elements)) {
      console.log(`     - ${name}: ${count > 0 ? '✅ Found' : '❌ Not found'} (${count})`);
    }
    
    // Check table content if exists
    if (elements['Table with holdings'] > 0) {
      const rows = await page.locator('tbody tr').count();
      console.log(`\n   Table rows: ${rows}`);
      
      if (rows > 0) {
        // Get first few rows content
        const firstRow = await page.locator('tbody tr').first().textContent();
        console.log(`   First row sample: "${firstRow.substring(0, 50)}..."`);
      }
    }
    
    // Test 4: Check for errors
    console.log('\n4. Checking for errors...');
    const errors = consoleLogs.filter(log => log.type === 'error');
    if (errors.length > 0) {
      console.log(`   ❌ Found ${errors.length} console errors:`);
      errors.forEach(err => console.log(`     - ${err.text}`));
    } else {
      console.log('   ✅ No console errors');
    }
    
    // Test 5: Take screenshots for visual inspection
    console.log('\n5. Taking screenshots...');
    await page.screenshot({ path: 'investor-view-detailed-full-page.png', fullPage: true });
    console.log('   ✅ Full page screenshot saved');
    
    // Test 6: Compare specific content between views
    console.log('\n6. Comparing Admin vs Investor view...');
    
    // Get investor view content summary
    const investorContent = {
      url: page.url(),
      headingCount: headings.length,
      hasTable: elements['Table with holdings'] > 0,
      hasChart: elements['Chart/Graph'] > 0
    };
    
    // Switch to admin view
    await page.click('text=Admin View');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 5000 });
    await page.waitForTimeout(2000);
    
    const adminHeadings = await page.locator('h1, h2, h3').allTextContents();
    const adminTable = await page.locator('table').count();
    
    console.log(`   Admin view: ${adminHeadings.length} headings, ${adminTable} tables`);
    console.log(`   Investor view: ${investorContent.headingCount} headings, ${investorContent.hasTable ? '1+' : '0'} tables`);
    
    // Summary
    console.log('\n📊 DETAILED ANALYSIS:');
    console.log('====================');
    console.log(`URL: ${investorContent.url}`);
    console.log(`Page loads: ${loadingStates === 0 ? '✅ Yes (no loading indicators)' : '⚠️  Has loading indicators'}`);
    console.log(`Has content: ${headings.length > 0 ? '✅ Yes' : '❌ No'}`);
    console.log(`Has portfolio data: ${investorContent.hasTable ? '✅ Yes' : '❌ No'}`);
    console.log(`Has visualizations: ${investorContent.hasChart ? '✅ Yes' : '❌ No'}`);
    
    // Determine issue
    if (loadingStates > 0) {
      console.log('\n❌ ISSUE: Page has loading indicators - might be stuck loading');
    } else if (!investorContent.hasTable && !investorContent.hasChart) {
      console.log('\n❌ ISSUE: No portfolio data visible (no table or charts)');
    } else if (headings.length === 0) {
      console.log('\n❌ ISSUE: No content headings found');
    } else {
      console.log('\n✅ Investor view appears to be working');
    }
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: 'investor-view-error-state.png' });
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testInvestorViewDetailed().then(() => {
  console.log('\nTest completed. Check screenshots for visual inspection.');
});