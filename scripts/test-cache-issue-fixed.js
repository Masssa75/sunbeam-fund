const { chromium } = require('playwright');

async function testCacheIssueFix() {
  console.log('Testing if cache issue is fixed (no need to clear cache between logins)...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  try {
    // Create a fresh context (simulating a user with cleared cache)
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    console.log('=== First Login (Fresh Browser) ===');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
    console.log('✓ First login successful');
    
    await page.waitForTimeout(3000);
    const firstPortfolioContent = await page.textContent('body');
    if (firstPortfolioContent.includes('Total Value')) {
      console.log('✓ Portfolio loaded successfully');
    } else {
      console.log('❌ Portfolio did not load properly');
    }
    
    // Logout
    const logoutButton = await page.$('button:has-text("Sign out")');
    await logoutButton.click();
    console.log('✓ Logged out');
    await page.waitForTimeout(3000);
    
    console.log('\n=== Second Login (Same Browser, No Cache Clear) ===');
    console.log('This is where the issue used to occur...\n');
    
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
      console.log('✅ Second login successful - NO CACHE CLEAR NEEDED!');
      
      await page.waitForTimeout(3000);
      const secondPortfolioContent = await page.textContent('body');
      if (secondPortfolioContent.includes('Total Value')) {
        console.log('✅ Portfolio loaded successfully on second login');
        console.log('\n🎉 SUCCESS: The cache issue is FIXED! Users can now login multiple times without clearing cache.');
      } else if (secondPortfolioContent.includes('Loading Portfolio')) {
        console.log('❌ Portfolio stuck on "Loading Portfolio..." - issue not fully fixed');
      }
    } catch (error) {
      console.log('❌ Second login failed - still requires cache clear');
      const currentUrl = page.url();
      console.log('Stuck at URL:', currentUrl);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testCacheIssueFix();