const { chromium } = require('playwright');

async function testFinalNav() {
  console.log('Testing final navigation authentication state...\n');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Login
  console.log('1. Logging in...');
  await page.goto('https://sunbeam.capital/login');
  await page.fill('input[type="email"]', 'marc@minutevideos.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
  
  // Wait for auth check
  console.log('2. Waiting for navigation to update...');
  await page.waitForTimeout(3000);
  
  // Check navigation
  console.log('\n3. Checking navigation elements:');
  
  const elements = {
    'Sign In link': await page.locator('text="Sign In"').isVisible().catch(() => false),
    'User email': await page.locator('text="marc@minutevideos.com"').isVisible(),
    'Sign out link': await page.locator('text="Sign out"').isVisible(),
    'Admin badge': await page.locator('text="Admin"').isVisible()
  };
  
  for (const [name, visible] of Object.entries(elements)) {
    console.log(`  ${name}: ${visible ? '✓ Visible' : '✗ Not visible'}`);
  }
  
  // Check hamburger menu
  console.log('\n4. Testing hamburger menu:');
  await page.locator('button svg').click();
  await page.waitForTimeout(500);
  
  const menuItems = {
    'Portfolio': await page.locator('a:has-text("Portfolio")').isVisible(),
    'Manage Investors': await page.locator('a:has-text("Manage Investors")').isVisible(),
    'Reports': await page.locator('a:has-text("Reports")').isVisible()
  };
  
  for (const [name, visible] of Object.entries(menuItems)) {
    console.log(`  ${name}: ${visible ? '✓ Visible' : '✗ Not visible'}`);
  }
  
  await page.screenshot({ path: 'final-nav-test.png', fullPage: true });
  
  console.log('\n✅ Test complete! Screenshot saved.');
  await page.waitForTimeout(5000);
  
  await browser.close();
}

testFinalNav().catch(console.error);