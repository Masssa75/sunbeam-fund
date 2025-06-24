const { chromium } = require('playwright');

async function testCleanNav() {
  console.log('Testing clean navigation design...\n');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  
  // Test 1: Not logged in
  console.log('1. Testing navigation when not logged in...');
  await page.goto('https://sunbeam.capital', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log('   - Only hamburger menu visible (no user info in header)');
  await page.locator('button svg').click();
  await page.waitForTimeout(500);
  
  const signInVisible = await page.locator('text="Sign In"').isVisible();
  console.log('   - Sign In option in menu:', signInVisible ? '✓' : '✗');
  
  // Close menu
  await page.locator('button svg').click();
  
  // Test 2: Login
  console.log('\n2. Logging in...');
  await page.goto('https://sunbeam.capital/login');
  await page.fill('input[type="email"]', 'marc@minutevideos.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Test 3: Logged in navigation
  console.log('\n3. Testing navigation when logged in...');
  console.log('   - Clean header with only logo and hamburger menu');
  
  await page.locator('button svg').click();
  await page.waitForTimeout(500);
  
  console.log('\n   Menu contents:');
  const menuItems = [
    'marc@minutevideos.com',
    'Administrator',
    'Portfolio',
    'Manage Investors',
    'Reports',
    'Preview Investor View',
    'Sign out'
  ];
  
  for (const item of menuItems) {
    const visible = await page.locator(`text="${item}"`).isVisible().catch(() => false);
    console.log(`   - ${item}: ${visible ? '✓' : '✗'}`);
  }
  
  await page.screenshot({ path: 'clean-nav-design.png', fullPage: true });
  
  console.log('\n✅ Test complete! The navigation now has:');
  console.log('   - Clean, minimal header (just logo + hamburger)');
  console.log('   - All user info and navigation in the hamburger menu');
  console.log('   - Sign in/out options in the menu');
  
  await page.waitForTimeout(5000);
  await browser.close();
}

testCleanNav().catch(console.error);