const { chromium } = require('playwright');

async function testWelcomePage() {
  console.log('Testing welcome page for non-authenticated users...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('1. Visiting homepage without authentication...');
    await page.goto('https://sunbeam.capital');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Check for welcome message
    const welcomeText = await page.locator('text=Welcome to Sunbeam Capital').count();
    if (welcomeText > 0) {
      console.log('✓ Welcome message is displayed');
    } else {
      console.log('✗ Welcome message not found');
    }
    
    // Check that report sections are NOT displayed
    const reportGenerator = await page.locator('text=Generate Monthly Report').count();
    const reportManagement = await page.locator('text=Report Management').count();
    
    if (reportGenerator === 0 && reportManagement === 0) {
      console.log('✓ Report sections are properly hidden');
    } else {
      console.log('✗ Report sections are still visible (should be hidden)');
      console.log(`  - Generate Monthly Report: ${reportGenerator > 0 ? 'visible' : 'hidden'}`);
      console.log(`  - Report Management: ${reportManagement > 0 ? 'visible' : 'hidden'}`);
    }
    
    // Check for login button
    const loginButton = await page.locator('text=Log In to Continue').count();
    if (loginButton > 0) {
      console.log('✓ Login button is displayed');
    } else {
      console.log('✗ Login button not found');
    }
    
    // Check for feature highlights
    const portfolioTracking = await page.locator('text=Portfolio Tracking').count();
    const monthlyReports = await page.locator('text=Monthly Reports').count();
    const professionalMgmt = await page.locator('text=Professional Management').count();
    
    if (portfolioTracking > 0 && monthlyReports > 0 && professionalMgmt > 0) {
      console.log('✓ Feature highlights are displayed');
    } else {
      console.log('✗ Some feature highlights are missing');
    }
    
    console.log('\n2. Testing login button functionality...');
    
    // Click login button
    await page.click('text=Log In to Continue');
    
    // Check if redirected to login page
    await page.waitForURL(/.*\/login.*/, { timeout: 10000 });
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('✓ Login button redirects to login page');
    } else {
      console.log('✗ Login button did not redirect properly');
      console.log(`  Current URL: ${currentUrl}`);
    }
    
    // Take screenshot for verification
    await page.screenshot({ path: 'welcome-page-test.png', fullPage: true });
    console.log('\nScreenshot saved as welcome-page-test.png');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testWelcomePage().catch(console.error);