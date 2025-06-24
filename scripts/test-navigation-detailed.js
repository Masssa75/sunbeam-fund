const { chromium } = require('playwright');

async function testNavigationDetailed() {
  console.log('🧪 Detailed Navigation Component Testing');
  console.log('========================================\n');
  
  // You can change this to false to WATCH the browser in action!
  const headless = true;
  
  const browser = await chromium.launch({ 
    headless: headless,
    slowMo: headless ? 0 : 300,  // Slow down actions when visible
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      // Set viewport size
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('   ⚠️  Browser console error:', msg.text());
      }
    });
    
    // 1. Test production build
    console.log('1. Checking production site navigation...');
    await page.goto('https://sunbeam.capital', { waitUntil: 'networkidle' });
    
    // Get the actual HTML of the nav element
    const navHTML = await page.locator('nav').first().innerHTML();
    console.log('   Navigation HTML:', navHTML.substring(0, 200) + '...');
    
    // Check page source for component references
    const pageSource = await page.content();
    console.log('   Page size:', pageSource.length, 'bytes');
    
    // 2. Check local development if running
    console.log('\n2. Checking if local dev server is running...');
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 5000 });
      console.log('   ✓ Local dev server is running!');
      
      const localNavHTML = await page.locator('nav').first().innerHTML();
      console.log('   Local nav HTML:', localNavHTML.substring(0, 200) + '...');
      
      // Take screenshot of local version
      await page.screenshot({ path: 'navigation-local.png', fullPage: true });
      console.log('   ✓ Local screenshot saved: navigation-local.png');
      
    } catch (e) {
      console.log('   ℹ️  Local dev server not running (this is fine)');
    }
    
    // 3. Test different viewport sizes
    console.log('\n3. Testing responsive navigation...');
    
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('https://sunbeam.capital');
    const desktopMenuVisible = await page.locator('button[aria-label="Open menu"]').isVisible();
    console.log('   Desktop - Mobile menu button visible:', desktopMenuVisible);
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    const mobileMenuVisible = await page.locator('button[aria-label="Open menu"]').isVisible();
    console.log('   Mobile - Mobile menu button visible:', mobileMenuVisible);
    
    // 4. Check network requests
    console.log('\n4. Monitoring network requests...');
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('sunbeam.capital') && response.url().endsWith('.js')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length'] || 'unknown'
        });
      }
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    console.log('   JavaScript files loaded:');
    responses.forEach(r => {
      console.log(`   - ${r.url.split('/').pop()}: ${r.status} (${r.size} bytes)`);
    });
    
    // 5. Try to interact with navigation
    console.log('\n5. Testing navigation interactions...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    
    // Take pre-login screenshot
    await page.screenshot({ path: 'navigation-pre-login.png' });
    
    await page.click('button[type="submit"]');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Check authenticated navigation
    const authNavHTML = await page.locator('nav').first().innerHTML();
    console.log('   Authenticated nav HTML:', authNavHTML.substring(0, 200) + '...');
    
    // Take post-login screenshot
    await page.screenshot({ path: 'navigation-post-login.png' });
    console.log('   ✓ Screenshots saved for comparison');
    
    // 6. Debug information
    console.log('\n6. Debug information:');
    const navClasses = await page.locator('nav').first().getAttribute('class');
    console.log('   Nav classes:', navClasses || 'none');
    
    const childCount = await page.locator('nav > *').count();
    console.log('   Direct children in nav:', childCount);
    
    console.log('\n✅ Detailed test completed!');
    console.log('\n💡 To watch the test in action, change headless to false in the script!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'navigation-error.png' });
    console.log('   Error screenshot saved: navigation-error.png');
  } finally {
    await browser.close();
  }
}

testNavigationDetailed().catch(console.error);