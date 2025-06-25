const { chromium } = require('playwright');

async function testInvestorEnhancedDirect() {
  console.log('\n🧪 Testing Enhanced Investor View with test investor account...\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Use the test investor credentials
    console.log('1. Logging in as test investor...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'test@sunbeam.capital');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation - investor should go directly to investor view
    console.log('2. Waiting for redirect to investor view...');
    await page.waitForURL(/.*\/investor.*/, { timeout: 30000 });
    console.log('✅ Redirected to investor view');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ 
      path: 'investor-view-enhanced-direct.png', 
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

    // Get content details
    console.log('\n4. Investor details found:');
    
    try {
      const welcomeText = await page.locator('p:has-text("Welcome back")').textContent();
      console.log(`   ${welcomeText}`);
    } catch (e) {
      console.log('   Could not find welcome text');
    }

    try {
      const currentValue = await page.locator('.text-3xl.font-semibold').first().textContent();
      console.log(`   Current Value: ${currentValue}`);
    } catch (e) {
      console.log('   Could not find current value');
    }

    try {
      const accountNumber = await page.locator('text=/Account Number/').locator('..').locator('.text-lg').textContent();
      console.log(`   Account Number: ${accountNumber}`);
    } catch (e) {
      console.log('   Could not find account number');
    }

    // Check if error message present
    const hasError = await page.locator('text=/Failed to load investor data/').count() > 0;
    if (hasError) {
      console.log('\n❌ ERROR: Failed to load investor data');
      return false;
    }

    // Overall success check
    const allChecks = hasPortfolioComposition && hasChart && hasThesis && 
                     hasPlaceholderTweets && hasFundStats && hasPhilosophy;
    
    console.log(`\n${allChecks ? '✅' : '❌'} Enhanced Investor View Test: ${allChecks ? 'PASSED' : 'FAILED'}`);
    console.log('\n📸 Screenshot saved as: investor-view-enhanced-direct.png');

    return allChecks;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take error screenshot
    try {
      await page.screenshot({ path: 'investor-error-direct.png', fullPage: true });
    } catch (e) {
      console.error('Could not take error screenshot');
    }
    
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testInvestorEnhancedDirect()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });