const { chromium } = require('playwright');

async function testTableContent() {
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    console.log('Checking table content...\n');
    
    // Get all table cells with dollar values
    const dollarCells = await page.$$eval('td', cells => 
      cells
        .map(cell => cell.textContent || '')
        .filter(text => text.includes('$'))
    );
    
    console.log('Dollar values found in table:');
    dollarCells.forEach(value => console.log(`  ${value}`));
    
    // Check specific elements
    const totalValue = await page.$eval('text=Total', el => {
      const row = el.closest('tr');
      return row ? row.textContent : 'Not found';
    }).catch(() => 'Total row not found');
    
    console.log('\nTotal row content:', totalValue);
    
    // Check if there's a loading overlay
    const loadingElements = await page.$$('[class*="Loading"], [class*="loading"]');
    console.log('\nLoading elements found:', loadingElements.length);
    
    // Get the full page HTML to see structure
    const bodyHtml = await page.$eval('body', el => el.innerHTML);
    
    // Check if loading div is covering the table
    if (bodyHtml.includes('Loading Portfolio') && bodyHtml.includes('<table')) {
      console.log('\n⚠️  Both loading message and table are rendered!');
      console.log('This suggests a rendering issue where both states show.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testTableContent();