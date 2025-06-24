const { chromium } = require('playwright');

async function testSecondLoginIssue() {
  console.log('Testing second login issue...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
    
    console.log('1. First login attempt...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    // First login
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to portfolio
    await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
    console.log('✓ First login successful - redirected to portfolio');
    
    // Check if portfolio loads
    await page.waitForTimeout(3000);
    const portfolioContent = await page.textContent('body');
    if (portfolioContent.includes('Loading Portfolio')) {
      console.log('⚠️  Portfolio showing "Loading Portfolio..." after first login');
    } else if (portfolioContent.includes('Total Value')) {
      console.log('✓ Portfolio loaded successfully after first login');
    }
    
    // Take screenshot of first login
    await page.screenshot({ path: 'test-first-login.png' });
    
    // Get cookies after first login
    const cookiesAfterFirstLogin = await context.cookies();
    console.log('\nCookies after first login:', cookiesAfterFirstLogin.map(c => c.name));
    
    // Logout
    console.log('\n2. Logging out...');
    const logoutButton = await page.$('button:has-text("Logout")');
    if (logoutButton) {
      await logoutButton.click();
      await page.waitForTimeout(2000);
      console.log('✓ Logged out successfully');
    }
    
    // Get cookies after logout
    const cookiesAfterLogout = await context.cookies();
    console.log('\nCookies after logout:', cookiesAfterLogout.map(c => c.name));
    
    // Second login attempt
    console.log('\n3. Second login attempt (this is where the issue occurs)...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Check what happens
    try {
      await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
      console.log('✓ Second login successful - redirected to portfolio');
      
      // Check if portfolio loads
      await page.waitForTimeout(3000);
      const secondPortfolioContent = await page.textContent('body');
      if (secondPortfolioContent.includes('Loading Portfolio')) {
        console.log('❌ Portfolio stuck on "Loading Portfolio..." after second login');
        await page.screenshot({ path: 'test-second-login-stuck.png' });
      } else if (secondPortfolioContent.includes('Total Value')) {
        console.log('✓ Portfolio loaded successfully after second login');
        await page.screenshot({ path: 'test-second-login-success.png' });
      }
    } catch (error) {
      console.log('❌ Second login failed:', error.message);
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);
      
      // Check if stuck on login page
      const loginContent = await page.textContent('body');
      if (loginContent.includes('Processing')) {
        console.log('❌ Stuck on "Processing..." state');
      }
      await page.screenshot({ path: 'test-second-login-error.png' });
    }
    
    // Get cookies after second login attempt
    const cookiesAfterSecondLogin = await context.cookies();
    console.log('\nCookies after second login:', cookiesAfterSecondLogin.map(c => c.name));
    
    // Check localStorage
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    console.log('\nLocalStorage data:', Object.keys(localStorageData));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testSecondLoginIssue();