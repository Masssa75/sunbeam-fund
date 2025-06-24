const { chromium } = require('playwright');

async function testNavigationIssue() {
  console.log('🧪 Testing Navigation Display Issue');
  console.log('====================================\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 1. Go to production site
    console.log('1. Navigating to production site...');
    await page.goto('https://sunbeam.capital', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take screenshot of current state
    await page.screenshot({ path: 'navigation-issue-homepage.png', fullPage: true });
    console.log('   ✓ Screenshot saved: navigation-issue-homepage.png');
    
    // 2. Check what navigation elements exist
    console.log('\n2. Checking navigation elements...');
    
    // Check for Navigation component elements
    const navElement = await page.locator('nav').first();
    const navExists = await navElement.count() > 0;
    console.log(`   - Nav element exists: ${navExists}`);
    
    if (navExists) {
      const navHTML = await navElement.innerHTML();
      console.log(`   - Nav HTML length: ${navHTML.length} characters`);
      
      // Check for specific Navigation component features
      const hasPortfolioLink = await page.locator('a:has-text("Portfolio")').count() > 0;
      const hasInvestorsLink = await page.locator('a:has-text("Manage Investors")').count() > 0;
      const hasReportsLink = await page.locator('a:has-text("Reports")').count() > 0;
      const hasUserBadge = await page.locator('span:has-text("Admin"), span:has-text("Investor")').count() > 0;
      const hasMobileMenu = await page.locator('button[aria-label="Open menu"]').count() > 0;
      
      console.log(`   - Has Portfolio link: ${hasPortfolioLink}`);
      console.log(`   - Has Manage Investors link: ${hasInvestorsLink}`);
      console.log(`   - Has Reports link: ${hasReportsLink}`);
      console.log(`   - Has user badge: ${hasUserBadge}`);
      console.log(`   - Has mobile menu button: ${hasMobileMenu}`);
    }
    
    // 3. Login to see authenticated navigation
    console.log('\n3. Logging in as admin user...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // 4. Check navigation after login
    console.log('\n4. Checking navigation after login...');
    await page.screenshot({ path: 'navigation-issue-authenticated.png', fullPage: true });
    console.log('   ✓ Screenshot saved: navigation-issue-authenticated.png');
    
    // Re-check navigation elements
    const authNavHTML = await page.locator('nav').first().innerHTML();
    console.log(`   - Authenticated nav HTML length: ${authNavHTML.length} characters`);
    
    // Check for authenticated features
    const hasEmail = await page.locator('text=marc@minutevideos.com').count() > 0;
    const hasLogout = await page.locator('button:has-text("Logout"), a:has-text("Logout")').count() > 0;
    
    console.log(`   - Shows user email: ${hasEmail}`);
    console.log(`   - Has logout option: ${hasLogout}`);
    
    // 5. Check page source for component references
    console.log('\n5. Checking page source...');
    const pageContent = await page.content();
    const hasNavigationComponent = pageContent.includes('Navigation') || pageContent.includes('navigation');
    const hasHeaderSimplified = pageContent.includes('HeaderSimplified') || pageContent.includes('header-simplified');
    
    console.log(`   - References to Navigation: ${hasNavigationComponent}`);
    console.log(`   - References to HeaderSimplified: ${hasHeaderSimplified}`);
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testNavigationIssue().catch(console.error);