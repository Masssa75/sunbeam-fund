const { chromium } = require('playwright');

async function testRecentDevelopments() {
  console.log('🔍 Testing Recent Developments with AI summaries...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for visual verification
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to login
    console.log('1. Navigating to login page...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    // Login
    console.log('2. Logging in as marc@minutevideos.com...');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    console.log('3. Waiting for dashboard to load...');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    
    // The new InvestorDashboardComplete is shown on the home page for investors
    console.log('4. Dashboard loaded, checking if investor view...');
    
    // Scroll to Recent Developments section
    console.log('5. Looking for Recent Developments section...');
    const recentDev = await page.locator('text=Recent Developments').first();
    
    if (await recentDev.isVisible()) {
      await recentDev.scrollIntoViewIfNeeded();
      console.log('✅ Found Recent Developments section');
      
      // Check for tweet content
      const tweetElements = await page.locator('.flex.gap-6.mb-8').all();
      console.log(`\n📊 Found ${tweetElements.length} recent developments\n`);
      
      // Examine each tweet
      for (let i = 0; i < Math.min(3, tweetElements.length); i++) {
        const tweet = tweetElements[i];
        
        // Get project name
        const projectName = await tweet.locator('.font-semibold.text-base').textContent();
        
        // Get the content (should be AI summary now)
        const content = await tweet.locator('.text-sm.text-gray-600').textContent();
        
        // Get the date
        const date = await tweet.locator('.text-sm.text-gray-400').textContent();
        
        console.log(`${i + 1}. ${projectName} (${date})`);
        console.log(`   Content: ${content}`);
        console.log(`   Length: ${content.length} chars`);
        console.log(`   Looks like summary: ${content.length < 220 && !content.includes('...')}`);
        console.log('');
      }
      
      // Take screenshot
      await page.screenshot({ 
        path: 'recent-developments-test.png', 
        fullPage: false,
        clip: await recentDev.boundingBox()
      });
      console.log('📸 Screenshot saved as recent-developments-test.png');
      
    } else {
      console.log('❌ Recent Developments section not found');
      
      // Check if using placeholder content
      const placeholderCheck = await page.locator('text=Major protocol upgrade announcement').count();
      if (placeholderCheck > 0) {
        console.log('⚠️  Showing placeholder content (no real tweets available)');
      }
    }
    
    // Also check console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    console.log('\n✅ Test completed!');
    console.log('Press any key to close browser...');
    
    // Keep browser open for manual inspection
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await browser.close();
  }
}

testRecentDevelopments().catch(console.error);