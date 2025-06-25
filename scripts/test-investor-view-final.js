const { chromium } = require('playwright');

async function testInvestorViewFinal() {
  console.log('\n🧪 Testing Enhanced Investor View with direct navigation...\n');
  
  const browser = await chromium.launch({
    headless: false, // Show browser to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login as admin first
    console.log('1. Logging in as admin...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    console.log('✅ Logged in successfully');

    // Navigate directly to investor view with a specific investor ID
    console.log('\n2. Navigating to investor view with viewAs parameter...');
    // Using test.investor@sunbeam.capital's ID
    await page.goto('https://sunbeam.capital/investor?viewAs=830e5ae5-ecad-43ba-8173-af014e1dee30');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Give it time to load

    // Take screenshot
    await page.screenshot({ 
      path: 'investor-view-final.png', 
      fullPage: true 
    });

    // Check for enhanced elements
    console.log('\n3. Checking for enhanced components...');
    
    // Check for loading or error state first
    const hasError = await page.locator('text=/Failed to load investor data/').count() > 0;
    const isLoading = await page.locator('text=/Loading/').count() > 0;
    
    if (hasError) {
      console.log('❌ ERROR: Failed to load investor data');
    }
    if (isLoading) {
      console.log('⏳ Still loading...');
    }

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

    console.log('\n📸 Screenshot saved as: investor-view-final.png');
    console.log('\n⏸️  Browser will stay open for 10 seconds for inspection...');
    
    await page.waitForTimeout(10000);

    // Overall success check
    const allChecks = hasPortfolioComposition && hasChart && hasThesis && 
                     hasPlaceholderTweets && hasFundStats && hasPhilosophy;
    
    console.log(`\n${allChecks ? '✅' : '❌'} Enhanced Investor View Test: ${allChecks ? 'PASSED' : 'FAILED'}`);

    return allChecks;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testInvestorViewFinal()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });