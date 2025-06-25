const { chromium } = require('playwright');

async function testInvestorViewWithCorrectId() {
  console.log('\n🧪 Testing Enhanced Investor View with correct investor ID...\n');
  
  const browser = await chromium.launch({
    headless: true,
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

    // Navigate to investor view with Tom's investor record ID
    console.log('\n2. Navigating to investor view with Tom\'s ID...');
    await page.goto('https://sunbeam.capital/investor?viewAs=8df521c0-38dc-46b6-9ac4-a100e210d15f');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Give it time to load

    // Take screenshot
    await page.screenshot({ 
      path: 'investor-view-correct-id.png', 
      fullPage: true 
    });

    // Check for enhanced elements
    console.log('\n3. Checking for enhanced components...');
    
    // Check for loading or error state first
    const hasError = await page.locator('text=/Failed to load investor data/').count() > 0;
    const isLoading = await page.locator('.animate-pulse').count() > 0;
    
    if (hasError) {
      console.log('❌ ERROR: Failed to load investor data');
      return false;
    }
    if (isLoading) {
      console.log('⏳ Still loading...');
      return false;
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

    // Check for viewing as indicator
    const hasViewingIndicator = await page.locator('text=/Viewing as/').count() > 0;
    console.log(`   ✅ Viewing as indicator: ${hasViewingIndicator ? 'FOUND' : 'NOT FOUND'}`);

    // Get content details
    console.log('\n4. Content details:');
    
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

    // Overall success check
    const allChecks = hasPortfolioComposition && hasChart && hasThesis && 
                     hasPlaceholderTweets && hasFundStats && hasPhilosophy;
    
    console.log(`\n${allChecks ? '✅' : '❌'} Enhanced Investor View Test: ${allChecks ? 'PASSED' : 'FAILED'}`);
    console.log('\n📸 Screenshot saved as: investor-view-correct-id.png');

    return allChecks;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testInvestorViewWithCorrectId()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });