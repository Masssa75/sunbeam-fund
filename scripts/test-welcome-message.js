const { chromium } = require('playwright');

async function testWelcomeMessage() {
  console.log('🧪 Testing Welcome Message for Regular Users');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test session API endpoint directly first
    console.log('\n1. Testing Session API with existing test user...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'test@sunbeam.capital');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for login
    await page.waitForTimeout(5000);
    
    // Check if we see the welcome message
    const pageContent = await page.content();
    const hasWelcomeMessage = await page.locator('text=Welcome to Sunbeam Fund').count() > 0;
    const hasThankYouMessage = await page.locator('text=Thank you for signing up').count() > 0;
    const hasInvestorAccountMessage = await page.locator('text=enable your investor account').count() > 0;
    
    console.log('   🔍 Current page URL:', page.url());
    console.log('   ✅ Shows welcome message:', hasWelcomeMessage);
    console.log('   ✅ Shows thank you message:', hasThankYouMessage); 
    console.log('   ✅ Shows investor account message:', hasInvestorAccountMessage);
    
    // Also check what's actually on the page
    const mainContent = await page.locator('main').textContent().catch(() => 'No main element');
    const bodyContent = await page.locator('body').textContent().catch(() => 'No body content');
    
    console.log('   📄 Page main content preview:', mainContent.substring(0, 200) + '...');
    
    await page.screenshot({ path: 'test-user-welcome-page.png', fullPage: true });
    
    // Test session API response
    console.log('\n2. Checking Session API Response...');
    const sessionResponse = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/auth/session/');
        return await res.json();
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('   📊 Session API response:', JSON.stringify(sessionResponse, null, 2));
    
    // Test what happens when we navigate to home
    console.log('\n3. Testing navigation to home page...');
    await page.goto('https://sunbeam.capital/');
    await page.waitForTimeout(3000);
    
    const homeContent = await page.textContent('body').catch(() => 'No content');
    console.log('   🏠 Home page content preview:', homeContent.substring(0, 200) + '...');
    
    await page.screenshot({ path: 'test-user-home-page.png', fullPage: true });
    
    console.log('\n✅ Welcome message test completed!');
    console.log('📸 Screenshots: test-user-welcome-page.png, test-user-home-page.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-welcome-message.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testWelcomeMessage().catch(console.error);