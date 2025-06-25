const { chromium } = require('playwright');

async function testInvestorViewEnhanced() {
  console.log('\n🧪 Testing Enhanced Investor View...\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login first
    console.log('1. Logging in as admin...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    console.log('✅ Logged in successfully');

    // Navigate to investor view
    console.log('\n2. Navigating to investor view...');
    await page.goto('https://sunbeam.capital/investor');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'investor-view-enhanced.png', 
      fullPage: true 
    });

    // Check for enhanced elements
    console.log('\n3. Checking for enhanced components...');
    
    // Check for portfolio composition section
    const hasPortfolioComposition = await page.locator('h2:has-text("Portfolio Composition")').count() > 0;
    console.log(`   ✅ Portfolio Composition section: ${hasPortfolioComposition ? 'FOUND' : 'NOT FOUND'}`);

    // Check for chart canvas (donut chart)
    const hasChart = await page.locator('canvas').count() > 0;
    console.log(`   ✅ Portfolio chart: ${hasChart ? 'FOUND' : 'NOT FOUND'}`);

    // Check for investment thesis
    const hasThesis = await page.locator('text=/revolutionary technology/i').count() > 0;
    console.log(`   ✅ Investment thesis: ${hasThesis ? 'FOUND' : 'NOT FOUND'}`);

    // Check for placeholder tweets
    const hasPlaceholderTweets = await page.locator('text=/\\[PLACEHOLDER\\]/').count() > 0;
    console.log(`   ✅ Placeholder tweets: ${hasPlaceholderTweets ? 'FOUND' : 'NOT FOUND'}`);

    // Check for fund overview stats
    const hasFundStats = await page.locator('text="Total Fund Value"').count() > 0;
    console.log(`   ✅ Fund overview stats: ${hasFundStats ? 'FOUND' : 'NOT FOUND'}`);

    // Check for investment philosophy
    const hasPhilosophy = await page.locator('text=/Investment Philosophy/').count() > 0;
    console.log(`   ✅ Investment philosophy: ${hasPhilosophy ? 'FOUND' : 'NOT FOUND'}`);

    // Check layout structure
    const hasThreeColumnLayout = await page.locator('.lg\\:col-span-2').count() > 0;
    console.log(`   ✅ Three-column layout: ${hasThreeColumnLayout ? 'FOUND' : 'NOT FOUND'}`);

    // Check for reports sidebar
    const hasReportsSidebar = await page.locator('.sticky.top-8').count() > 0;
    console.log(`   ✅ Sticky reports sidebar: ${hasReportsSidebar ? 'FOUND' : 'NOT FOUND'}`);

    // Get some content
    console.log('\n4. Sample content found:');
    
    const standings = await page.locator('.text-3xl.font-semibold').first().textContent();
    console.log(`   Current Value: ${standings}`);

    const projectCount = await page.locator('text=/Kaspa \\(KAS\\)/').count();
    console.log(`   Portfolio holdings visible: ${projectCount > 0 ? 'YES' : 'NO'}`);

    // Overall success check
    const allChecks = hasPortfolioComposition && hasChart && hasThesis && 
                     hasPlaceholderTweets && hasFundStats && hasPhilosophy;
    
    console.log(`\n${allChecks ? '✅' : '❌'} Enhanced Investor View Test: ${allChecks ? 'PASSED' : 'FAILED'}`);
    console.log('\n📸 Screenshot saved as: investor-view-enhanced.png');

    return allChecks;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take error screenshot
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://sunbeam.capital/investor');
    await page.screenshot({ path: 'investor-view-error.png', fullPage: true });
    
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testInvestorViewEnhanced()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });