const { chromium } = require('playwright');

async function testInvestorAPIAuth() {
  console.log('🧪 Testing investor API authentication...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login first
    console.log('📋 Step 1: Logging in...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    console.log('✅ Login successful');
    
    // Check cookies
    console.log('📋 Step 2: Checking cookies...');
    const cookies = await context.cookies();
    console.log('Found cookies:');
    cookies.forEach(cookie => {
      if (cookie.name.includes('sb-') || cookie.name.includes('auth')) {
        console.log(`  ${cookie.name}: ${cookie.value.substring(0, 50)}...`);
      }
    });
    
    // Test session API endpoint first
    console.log('📋 Step 3: Testing session API endpoint...');
    const sessionResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/session/');
        const data = await response.json();
        return { status: response.status, data };
      } catch (error) {
        return { error: error.message };
      }
    });
    console.log('Session API response:', sessionResponse);
    
    // Test investors API endpoint directly
    console.log('📋 Step 4: Testing investors API endpoint...');
    const investorsResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/investors/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 'test-id',
            email: 'test@example.com',
            name: 'Test User',
            account_number: 'ACC-TEST',
            share_percentage: 10,
            initial_investment: 50000,
            notes: 'Test'
          })
        });
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
        return { status: response.status, data, headers: Object.fromEntries(response.headers) };
      } catch (error) {
        return { error: error.message };
      }
    });
    console.log('Investors API response:', investorsResponse);
    
    // Test a simple API endpoint that should work
    console.log('📋 Step 5: Testing simple API endpoint...');
    const simpleResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/positions/');
        return { status: response.status, ok: response.ok };
      } catch (error) {
        return { error: error.message };
      }
    });
    console.log('Positions API response:', simpleResponse);
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
  
  await browser.close();
  console.log('🏁 Test completed');
}

testInvestorAPIAuth().catch(console.error);