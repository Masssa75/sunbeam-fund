const { chromium } = require('playwright');

async function testInvestorViewAsAdmin() {
  console.log('\n🧪 Testing Enhanced Investor View using View As functionality...\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login as admin
    console.log('1. Logging in as admin...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    console.log('✅ Logged in successfully');

    // Navigate to admin investors page
    console.log('\n2. Going to admin investors page...');
    await page.goto('https://sunbeam.capital/admin/investors');
    await page.waitForLoadState('networkidle');
    
    // Find first investor with View As button
    console.log('\n3. Finding an investor to view as...');
    const viewAsButton = page.locator('button:has-text("View as")').first();
    const hasViewAsButton = await viewAsButton.count() > 0;
    
    if (!hasViewAsButton) {
      console.log('❌ No investors found to view as');
      return false;
    }

    // Click View As button
    console.log('✅ Found investor, clicking View As...');
    await viewAsButton.click();
    
    // Wait for navigation to investor view
    await page.waitForURL(/.*\/investor\?viewAs=.*/);
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to investor view');
    
    // Wait a bit for components to load
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ 
      path: 'investor-view-enhanced-as-admin.png', 
      fullPage: true 
    });

    // Check for enhanced elements
    console.log('\n4. Checking for enhanced components...');
    
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

    // Check for yellow "Viewing as" indicator
    const hasViewingIndicator = await page.locator('text=/Viewing as/').count() > 0;
    console.log(`   ✅ Viewing as indicator: ${hasViewingIndicator ? 'FOUND' : 'NOT FOUND'}`);

    // Get some content
    console.log('\n5. Sample content found:');
    
    try {
      const currentValue = await page.locator('.text-3xl.font-semibold').first().textContent();
      console.log(`   Current Value: ${currentValue}`);
    } catch (e) {
      console.log('   Could not find current value');
    }

    try {
      const investorName = await page.locator('text=/Welcome back,/').textContent();
      console.log(`   ${investorName}`);
    } catch (e) {
      console.log('   Could not find investor name');
    }

    // Overall success check
    const allChecks = hasPortfolioComposition && hasChart && hasThesis && 
                     hasPlaceholderTweets && hasFundStats && hasPhilosophy;
    
    console.log(`\n${allChecks ? '✅' : '❌'} Enhanced Investor View Test: ${allChecks ? 'PASSED' : 'FAILED'}`);
    console.log('\n📸 Screenshot saved as: investor-view-enhanced-as-admin.png');

    return allChecks;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take error screenshot
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto('https://sunbeam.capital/admin/investors');
      await page.screenshot({ path: 'investor-admin-error.png', fullPage: true });
    } catch (e) {
      console.error('Could not take error screenshot');
    }
    
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testInvestorViewAsAdmin()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });