const { chromium } = require('playwright');

async function testPriceIssue() {
  console.log('🧪 Testing Portfolio Price Issue');
  console.log('================================\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: Login and navigate to portfolio
    console.log('1. Logging in and navigating to portfolio...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    await page.waitForTimeout(3000);
    console.log('   ✅ Logged in successfully');
    
    // Test 2: Check portfolio values
    console.log('\n2. Checking portfolio values...');
    
    // Look for specific problematic values
    const keetaValue = await page.locator('tr:has-text("Keeta") td:has-text("$")').nth(2).textContent();
    const coinwebValue = await page.locator('tr:has-text("Coinweb") td:has-text("$")').nth(2).textContent();
    const brickenValue = await page.locator('tr:has-text("Bricken") td:has-text("$")').nth(2).textContent();
    
    console.log(`   Keeta current value: ${keetaValue}`);
    console.log(`   Coinweb current value: ${coinwebValue}`);
    console.log(`   Bricken current value: ${brickenValue}`);
    
    // Check if values are unreasonably high
    const unreasonableValues = [];
    const values = [
      { name: 'Keeta', value: keetaValue },
      { name: 'Coinweb', value: coinwebValue },
      { name: 'Bricken', value: brickenValue }
    ];
    
    values.forEach(item => {
      const numValue = parseFloat(item.value.replace(/[$,]/g, ''));
      if (numValue > 1000000) { // More than $1M for a single position
        unreasonableValues.push(`${item.name}: ${item.value} (${(numValue / 1000000).toFixed(1)}M)`);
      }
    });
    
    if (unreasonableValues.length > 0) {
      console.log('\n   ❌ Found unreasonable values:');
      unreasonableValues.forEach(v => console.log(`      - ${v}`));
    }
    
    // Test 3: Check current prices
    console.log('\n3. Checking current prices...');
    
    const keetaPrice = await page.locator('tr:has-text("Keeta") td:has-text("$")').nth(1).textContent();
    const coinwebPrice = await page.locator('tr:has-text("Coinweb") td:has-text("$")').nth(1).textContent();
    const brickenPrice = await page.locator('tr:has-text("Bricken") td:has-text("$")').nth(1).textContent();
    
    console.log(`   Keeta price: ${keetaPrice}`);
    console.log(`   Coinweb price: ${coinwebPrice}`);
    console.log(`   Bricken price: ${brickenPrice}`);
    
    // Test 4: Check amounts to verify calculations
    console.log('\n4. Checking amounts and calculations...');
    
    const keetaAmount = await page.locator('tr:has-text("Keeta") td').nth(2).textContent();
    const coinwebAmount = await page.locator('tr:has-text("Coinweb") td').nth(2).textContent();
    
    console.log(`   Keeta amount: ${keetaAmount}`);
    console.log(`   Coinweb amount: ${coinwebAmount}`);
    
    // Calculate what the values should be
    const keetaPriceNum = parseFloat(keetaPrice.replace(/[$,]/g, ''));
    const keetaAmountNum = parseFloat(keetaAmount.replace(/,/g, ''));
    const expectedKeetaValue = keetaPriceNum * keetaAmountNum;
    
    console.log(`\n   Keeta calculation:`);
    console.log(`   Price: $${keetaPriceNum}`);
    console.log(`   Amount: ${keetaAmountNum}`);
    console.log(`   Expected value: $${expectedKeetaValue.toLocaleString()}`);
    console.log(`   Actual value shown: ${keetaValue}`);
    
    // Test 5: Direct API test
    console.log('\n5. Testing CoinGecko API directly...');
    
    // Make a direct API call to check prices
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/coingecko/price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coinIds: ['kylacoin', 'coinweb', 'bricken'] })
        });
        return await response.json();
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('   API Response:', JSON.stringify(apiResponse, null, 2));
    
    // Take screenshot
    await page.screenshot({ path: 'price-issue-test-portfolio.png', fullPage: true });
    
    // Summary
    console.log('\n📊 ISSUE SUMMARY:');
    console.log('=================');
    console.log('The prices appear to be off by a factor of 1000 or more.');
    console.log('This suggests either:');
    console.log('1. CoinGecko API is returning prices in a different unit (satoshis instead of dollars?)');
    console.log('2. There\'s a multiplication error in the price conversion');
    console.log('3. The API is returning market cap instead of price');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'price-issue-test-error.png' });
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testPriceIssue().then(() => {
  console.log('\nTest completed.');
});