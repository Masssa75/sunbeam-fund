const { chromium } = require('playwright');

async function checkInvestorDashboard() {
  console.log('🔍 Checking investor dashboard on live site...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      }
    });
    
    // Navigate to login
    console.log('1. Navigating to login page...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    // Login
    console.log('2. Logging in as marc@minutevideos.com...');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    console.log('3. Waiting for navigation...');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`4. Current URL: ${currentUrl}`);
    
    // Take screenshot
    await page.screenshot({ path: 'dashboard-check.png', fullPage: true });
    console.log('📸 Screenshot saved as dashboard-check.png');
    
    // Check what dashboard is shown
    const hasPortfolioTable = await page.locator('text=Portfolio Positions').count() > 0;
    const hasInvestorDashboard = await page.locator('text=Current Standing').count() > 0;
    const hasRecentDevelopments = await page.locator('text=Recent Developments').count() > 0;
    const hasMarketContext = await page.locator('text=Market Context').count() > 0;
    
    console.log('\n📊 Dashboard Analysis:');
    console.log(`- Has Portfolio Table (admin view): ${hasPortfolioTable}`);
    console.log(`- Has Current Standing (investor view): ${hasInvestorDashboard}`);
    console.log(`- Has Recent Developments: ${hasRecentDevelopments}`);
    console.log(`- Has Market Context: ${hasMarketContext}`);
    
    // Check API calls
    console.log('\n🔍 Checking API responses...');
    
    // Try investor API
    const investorRes = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/investor/recent-developments');
        return { status: res.status, ok: res.ok, data: await res.json() };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('Recent Developments API:', investorRes);
    
    // Check user status
    const sessionRes = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/auth/session');
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('\n👤 User Session:', sessionRes);
    
  } catch (error) {
    console.error('❌ Error during check:', error);
  } finally {
    await browser.close();
  }
}

checkInvestorDashboard().catch(console.error);