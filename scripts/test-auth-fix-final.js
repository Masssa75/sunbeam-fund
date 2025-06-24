const { chromium } = require('playwright');

async function testAuthFix() {
  console.log('Testing navigation authentication fix...\n');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Test 1: Check navigation before login
  console.log('1. Testing navigation before login...');
  await page.goto('https://sunbeam.capital', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const signInBefore = await page.locator('text="Sign In"').isVisible();
  console.log('  Sign In link visible:', signInBefore ? '✓' : '✗');
  
  // Test 2: Login
  console.log('\n2. Logging in...');
  await page.goto('https://sunbeam.capital/login');
  await page.fill('input[type="email"]', 'marc@minutevideos.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Test 3: Check navigation after login
  console.log('\n3. Testing navigation after login...');
  
  const signInAfter = await page.locator('text="Sign In"').isVisible().catch(() => false);
  const userEmail = await page.locator('text="marc@minutevideos.com"').isVisible();
  const signOut = await page.locator('text="Sign out"').isVisible();
  const adminBadge = await page.locator('text="Admin"').isVisible();
  
  console.log('  Sign In link visible:', signInAfter ? '✗ (Should be hidden)' : '✓ Hidden');
  console.log('  User email visible:', userEmail ? '✓' : '✗');
  console.log('  Sign out link visible:', signOut ? '✓' : '✗');
  console.log('  Admin badge visible:', adminBadge ? '✓' : '✗');
  
  // Test 4: Check hamburger menu
  console.log('\n4. Testing hamburger menu for authenticated user...');
  await page.locator('button svg').click();
  await page.waitForTimeout(500);
  
  const portfolioLink = await page.locator('a:has-text("Portfolio")').isVisible();
  const investorsLink = await page.locator('a:has-text("Manage Investors")').isVisible();
  
  console.log('  Portfolio link in menu:', portfolioLink ? '✓' : '✗');
  console.log('  Manage Investors link:', investorsLink ? '✓' : '✗');
  
  // Test 5: Sign out
  console.log('\n5. Testing sign out...');
  await page.locator('text="Sign out"').click();
  await page.waitForURL('**/login', { timeout: 10000 });
  
  const onLoginPage = page.url().includes('/login');
  console.log('  Redirected to login page:', onLoginPage ? '✓' : '✗');
  
  await page.screenshot({ path: 'nav-auth-fixed.png', fullPage: true });
  
  console.log('\n✅ All tests complete!');
  await page.waitForTimeout(3000);
  
  await browser.close();
}

testAuthFix().catch(console.error);