const { chromium } = require('playwright');

async function testNavAuth() {
  console.log('Testing navigation authentication state...\n');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Monitor console
  page.on('console', msg => {
    if (msg.text().includes('auth') || msg.text().includes('user')) {
      console.log('Console:', msg.text());
    }
  });
  
  // First check without login
  console.log('1. Checking navigation without login...');
  await page.goto('https://sunbeam.capital', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  let signInVisible = await page.locator('text="Sign In"').isVisible();
  console.log('  Sign In link visible:', signInVisible);
  
  // Now login
  console.log('\n2. Logging in...');
  await page.goto('https://sunbeam.capital/login');
  await page.fill('input[type="email"]', 'marc@minutevideos.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
  await page.waitForTimeout(3000);
  
  console.log('\n3. Checking navigation after login...');
  signInVisible = await page.locator('text="Sign In"').isVisible();
  console.log('  Sign In link still visible:', signInVisible);
  
  // Check for user email or sign out
  const hasEmail = await page.locator('text="marc@minutevideos.com"').count() > 0;
  const hasSignOut = await page.locator('text="Sign out"').count() > 0;
  console.log('  User email shown:', hasEmail);
  console.log('  Sign out link shown:', hasSignOut);
  
  // Check portfolio data
  const hasPortfolio = await page.locator('text="Portfolio Positions"').count() > 0;
  console.log('  Portfolio data visible:', hasPortfolio);
  
  // Take screenshot
  await page.screenshot({ path: 'nav-auth-issue.png', fullPage: true });
  
  console.log('\n✅ Test complete! Screenshot saved as nav-auth-issue.png');
  await page.waitForTimeout(5000);
  
  await browser.close();
}

testNavAuth().catch(console.error);