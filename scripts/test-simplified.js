const { chromium } = require('playwright');

async function testSimplified() {
  console.log('Testing simplified portfolio component...\n');
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext();
    
    // Test 1: First login
    console.log('TEST 1: First login');
    const page1 = await context.newPage();
    
    await page1.goto('https://sunbeam.capital/login');
    await page1.fill('input[name="email"]', 'marc@minutevideos.com');
    await page1.fill('input[name="password"]', '123456');
    await page1.click('button[type="submit"]');
    
    await page1.waitForTimeout(5000);
    let content = await page1.textContent('body');
    console.log('- Shows Total Value:', content.includes('Total Value') ? 'YES' : 'NO');
    console.log('- Shows Loading:', content.includes('Loading Portfolio') ? 'YES' : 'NO');
    
    await page1.close();
    
    // Test 2: Second page load (new tab)
    console.log('\nTEST 2: Second page load (new tab)');
    const page2 = await context.newPage();
    
    await page2.goto('https://sunbeam.capital/');
    await page2.waitForTimeout(5000);
    
    content = await page2.textContent('body');
    console.log('- Shows Total Value:', content.includes('Total Value') ? 'YES' : 'NO');
    console.log('- Shows Loading:', content.includes('Loading Portfolio') ? 'YES' : 'NO');
    console.log('- Shows positions:', content.includes('positions') ? 'YES' : 'NO');
    
    await page2.close();
    
    // Test 3: Third page load (after closing all tabs)
    console.log('\nTEST 3: Third page load (after closing all)');
    const page3 = await context.newPage();
    
    await page3.goto('https://sunbeam.capital/');
    await page3.waitForTimeout(5000);
    
    content = await page3.textContent('body');
    console.log('- Shows Total Value:', content.includes('Total Value') ? 'YES' : 'NO');
    console.log('- Shows Loading:', content.includes('Loading Portfolio') ? 'YES' : 'NO');
    
    // Logout
    console.log('\nTEST 4: Logout');
    const logoutBtn = await page3.$('button:has-text("Sign out")');
    if (logoutBtn) {
      await logoutBtn.click();
      await page3.waitForTimeout(2000);
      console.log('- Logged out successfully');
    }
    
    // Test 5: Login again
    console.log('\nTEST 5: Login again after logout');
    await page3.goto('https://sunbeam.capital/login');
    await page3.fill('input[name="email"]', 'marc@minutevideos.com');
    await page3.fill('input[name="password"]', '123456');
    await page3.click('button[type="submit"]');
    
    await page3.waitForTimeout(5000);
    content = await page3.textContent('body');
    console.log('- Shows Total Value:', content.includes('Total Value') ? 'YES' : 'NO');
    console.log('- Shows Loading:', content.includes('Loading Portfolio') ? 'YES' : 'NO');
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testSimplified();