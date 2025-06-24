const { chromium } = require('playwright');

async function testPortfolioSorting() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔍 Testing Portfolio Sorting...\n');
    
    // Login as admin
    console.log('1. Logging in as admin...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    console.log('✅ Successfully logged in');
    
    // Wait for portfolio table to load
    console.log('\n2. Waiting for portfolio table...');
    await page.waitForSelector('text=Portfolio Positions', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for prices to load
    
    // Get all position values
    console.log('\n3. Checking position order...');
    const positions = await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody tr');
      return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        return {
          name: cells[0]?.textContent || '',
          value: cells[5]?.textContent || ''
        };
      });
    });
    
    console.log('\nPortfolio positions (in order):');
    positions.forEach((pos, index) => {
      console.log(`${index + 1}. ${pos.name}: ${pos.value}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'portfolio-sorted.png', fullPage: true });
    console.log('\n✅ Screenshot saved as portfolio-sorted.png');
    
    // Verify sorting
    const values = positions.map(p => {
      const value = p.value.replace('$', '').replace(',', '');
      return parseFloat(value) || 0;
    });
    
    const isSorted = values.every((val, i) => {
      if (i === 0) return true;
      return val <= values[i - 1];
    });
    
    console.log(`\n✅ Portfolio is ${isSorted ? 'correctly' : 'NOT'} sorted by value (highest first)`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'portfolio-sorting-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testPortfolioSorting().catch(console.error);