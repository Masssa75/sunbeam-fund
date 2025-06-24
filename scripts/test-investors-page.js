const { chromium } = require('playwright');

async function testInvestorsPage() {
  console.log('Testing Manage Investors page...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
    
    // Capture network requests
    page.on('response', response => {
      if (response.url().includes('/api/users') && response.status() !== 200) {
        console.log(`API Error: ${response.url()} - Status: ${response.status()}`);
      }
    });
    
    // First login
    console.log('1. Logging in...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
    console.log('✓ Login successful');
    
    // Navigate to investors page
    console.log('\n2. Navigating to Manage Investors page...');
    await page.goto('https://sunbeam.capital/admin/investors/');
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Check for error message
    const errorText = await page.locator('text=Failed to load users').count();
    if (errorText > 0) {
      console.log('✗ Error found: "Failed to load users"');
      
      // Try to capture network response details
      const response = await page.evaluate(async () => {
        try {
          // Try the simple endpoint first
          let res = await fetch('/api/users-simple/');
          const data = await res.text();
          return {
            simpleEndpoint: {
              status: res.status,
              statusText: res.statusText,
              data: data
            }
          };
        } catch (err) {
          return { error: err.toString() };
        }
      });
      
      console.log('\nAPI Response details:', JSON.stringify(response, null, 2));
    } else {
      console.log('✓ Page loaded successfully');
      
      // Check if we have any users displayed
      const hasTable = await page.locator('table').count();
      console.log(`Tables found: ${hasTable}`);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'investors-page-error.png', fullPage: true });
    console.log('\nScreenshot saved as investors-page-error.png');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testInvestorsPage().catch(console.error);