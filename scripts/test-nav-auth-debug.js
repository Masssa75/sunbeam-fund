const { chromium } = require('playwright');

async function testNavAuthDebug() {
  console.log('Debugging navigation authentication state...\n');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Monitor console and network
  page.on('console', msg => {
    if (msg.text().includes('auth') || msg.text().includes('user') || msg.text().includes('Error')) {
      console.log('Console:', msg.type(), '-', msg.text());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/auth/session')) {
      console.log('Auth session response:', response.status(), response.url());
    }
  });
  
  console.log('1. Logging in...');
  await page.goto('https://sunbeam.capital/login');
  await page.fill('input[type="email"]', 'marc@minutevideos.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
  console.log('2. Redirected to homepage');
  
  // Wait for auth check to complete
  console.log('3. Waiting for navigation to update...');
  await page.waitForTimeout(5000);
  
  // Get navigation HTML
  const navHTML = await page.locator('nav').innerHTML();
  console.log('\n4. Navigation HTML (first 500 chars):');
  console.log(navHTML.substring(0, 500));
  
  // Check what's visible
  console.log('\n5. Checking visible elements:');
  const elements = [
    'Sign In',
    'marc@minutevideos.com',
    'Sign out',
    'Admin',
    'Portfolio Positions'
  ];
  
  for (const text of elements) {
    const count = await page.locator(`text="${text}"`).count();
    console.log(`  "${text}": ${count} occurrences`);
  }
  
  // Try to manually trigger auth check
  console.log('\n6. Checking /api/auth/session response...');
  const sessionResponse = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/auth/session/');
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  });
  console.log('Session response:', JSON.stringify(sessionResponse, null, 2));
  
  console.log('\n✅ Debug complete! Browser will stay open...');
  await page.waitForTimeout(10000);
  
  await browser.close();
}

testNavAuthDebug().catch(console.error);