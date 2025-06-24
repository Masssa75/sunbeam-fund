const { chromium } = require('playwright');

async function testNavigationHTML() {
  console.log('🧪 Checking Navigation HTML Structure');
  console.log('=====================================\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 1. Check production
    console.log('1. Production site HTML:');
    await page.goto('https://sunbeam.capital', { waitUntil: 'networkidle' });
    
    const prodNavHTML = await page.locator('nav').first().innerHTML();
    console.log('   Production nav HTML:');
    console.log('   ' + prodNavHTML.replace(/\n/g, '\n   '));
    
    // 2. Check local
    console.log('\n2. Local development site HTML:');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    const localNavHTML = await page.locator('nav').first().innerHTML();
    console.log('   Local nav HTML:');
    console.log('   ' + localNavHTML.replace(/\n/g, '\n   '));
    
    // 3. Compare structures
    console.log('\n3. Comparison:');
    console.log('   Production has "Loading..." or simple nav:', prodNavHTML.includes('Sunbeam Fund') && !prodNavHTML.includes('Portfolio'));
    console.log('   Local has "Loading..." or simple nav:', localNavHTML.includes('Sunbeam Fund') && !localNavHTML.includes('Portfolio'));
    
    // 4. Check JavaScript execution
    console.log('\n4. JavaScript Console Errors:');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('   Console error:', msg.text());
      }
    });
    
    await page.goto('https://sunbeam.capital', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Wait for any JS to run
    
    // 5. Check if the component updated after load
    const finalNavHTML = await page.locator('nav').first().innerHTML();
    console.log('\n5. Final nav HTML after 3 seconds:');
    console.log('   Still simple nav:', finalNavHTML.includes('Sunbeam Fund') && !finalNavHTML.includes('Portfolio'));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testNavigationHTML().catch(console.error);