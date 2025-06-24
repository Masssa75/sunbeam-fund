const { chromium } = require('playwright');

async function quickCheck() {
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console
    const logs = [];
    page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
    
    // Test 1: Direct portfolio access
    console.log('Test 1: Direct access to portfolio');
    await page.goto('https://sunbeam.capital/');
    await page.waitForTimeout(3000);
    
    let content = await page.textContent('body');
    console.log('- Authenticated:', content.includes('Sign out') ? 'Yes' : 'No');
    console.log('- Shows portfolio:', content.includes('Total Value') ? 'Yes' : 'No');
    
    // Test 2: Login flow
    console.log('\nTest 2: Login flow');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for potential redirect
    await page.waitForTimeout(5000);
    
    console.log('- Current URL:', page.url());
    content = await page.textContent('body');
    console.log('- Authenticated:', content.includes('Sign out') ? 'Yes' : 'No');
    console.log('- Shows portfolio:', content.includes('Total Value') ? 'Yes' : 'No');
    console.log('- Shows $0.00:', content.includes('$0.00') ? 'Yes' : 'No');
    console.log('- Shows Loading:', content.includes('Loading') ? 'Yes' : 'No');
    
    // Test 3: Check console logs
    console.log('\nTest 3: Console logs');
    console.log('Total logs:', logs.length);
    logs.slice(-10).forEach(log => console.log(log));
    
    // Test 4: Check specific elements
    console.log('\nTest 4: Checking for portfolio table');
    const hasTable = await page.$('table') !== null;
    console.log('- Has table element:', hasTable ? 'Yes' : 'No');
    
    const hasPositions = await page.$$('tbody tr');
    console.log('- Number of position rows:', hasPositions.length);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

quickCheck();