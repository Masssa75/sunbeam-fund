const { chromium } = require('playwright');

async function testInvestorDashboardLoggedIn() {
  console.log('🧪 Testing investor dashboard with admin login...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
    }
  });
  
  try {
    console.log('🔐 Logging in as admin...');
    await page.goto('https://sunbeam.capital/login', { waitUntil: 'networkidle' });
    
    // Fill login form
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
    console.log('✅ Login successful');
    
    console.log('📱 Navigating to investor page...');
    await page.goto('https://sunbeam.capital/investor', { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });
    
    // Wait a bit for data to load
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'investor-dashboard-logged-in.png', fullPage: true });
    console.log('📸 Screenshot saved as investor-dashboard-logged-in.png');
    
    // Check for main elements
    console.log('🔍 Checking dashboard elements...');
    
    // Check main title
    const hasMainTitle = await page.locator('text=You own the future of blockchain').count() > 0;
    console.log(`${hasMainTitle ? '✅' : '❌'} Main title:`, hasMainTitle);
    
    // Check performance metrics
    const hasCurrentValue = await page.locator('text=Current Value').count() > 0;
    console.log(`${hasCurrentValue ? '✅' : '❌'} Current Value metric:`, hasCurrentValue);
    
    // Check for real data (should show actual portfolio value)
    const portfolioValue = await page.locator('[class*="text-2xl font-medium"]:has-text("$")').first().textContent();
    console.log('💰 Portfolio value displayed:', portfolioValue);
    
    // Check for project holdings
    const projectsVisible = ['Kaspa', 'Bittensor', 'Sui'];
    for (const project of projectsVisible) {
      const hasProject = await page.locator(`text=${project}`).count() > 0;
      console.log(`${hasProject ? '✅' : '❌'} ${project} holding:`, hasProject);
    }
    
    // Test expandable content
    console.log('🔍 Testing expandable content...');
    try {
      await page.click('text=Kaspa');
      await page.waitForTimeout(1000);
      const hasKaspaDetails = await page.locator('text=The Next Bitcoin').count() > 0;
      console.log(`${hasKaspaDetails ? '✅' : '❌'} Kaspa expandable content:`, hasKaspaDetails);
    } catch (err) {
      console.log('❌ Could not test Kaspa expandable content');
    }
    
    // Test market commentary
    console.log('🔍 Testing market commentary...');
    try {
      await page.click('text=Market Context');
      await page.waitForTimeout(1000);
      const hasCommentary = await page.locator('text=Current Market Perspective').count() > 0;
      console.log(`${hasCommentary ? '✅' : '❌'} Market commentary:`, hasCommentary);
    } catch (err) {
      console.log('❌ Could not test market commentary');
    }
    
    // Check Recent Developments section
    const hasRecentDev = await page.locator('text=Recent Developments').count() > 0;
    console.log(`${hasRecentDev ? '✅' : '❌'} Recent Developments section:`, hasRecentDev);
    
    // Check Monthly Reports section
    const hasMonthlyReports = await page.locator('text=Monthly Reports').count() > 0;
    console.log(`${hasMonthlyReports ? '✅' : '❌'} Monthly Reports section:`, hasMonthlyReports);
    
    console.log('\n🎉 Dashboard test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'investor-dashboard-error-logged-in.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testInvestorDashboardLoggedIn().catch(console.error);