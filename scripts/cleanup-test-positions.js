const { chromium } = require('playwright');

async function cleanupTestPositions() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('1. Logging in...');
  await page.goto('https://sunbeam.capital/login');
  await page.fill('input[type="email"]', 'marc@minutevideos.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
  await page.waitForTimeout(3000);
  
  console.log('2. Looking for test positions to delete...');
  
  // Delete Test Custom Token
  const testTokenRows = page.locator('tr:has-text("Test Custom Token")');
  const testTokenCount = await testTokenRows.count();
  
  if (testTokenCount > 0) {
    console.log('3. Found Test Custom Token, deleting...');
    const deleteButton = testTokenRows.locator('button:has-text("Delete")').first();
    await deleteButton.click();
    
    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());
    await page.waitForTimeout(2000);
    console.log('   ✅ Test Custom Token deleted');
  }
  
  // Delete duplicate CURE (the one without "Protocol" in the name)
  const cureRows = page.locator('tr').filter({ hasText: 'CURE' });
  const cureCount = await cureRows.count();
  
  console.log(`4. Found ${cureCount} CURE positions`);
  
  if (cureCount > 1) {
    // Find the CURE without "Protocol" in the name
    for (let i = 0; i < cureCount; i++) {
      const row = cureRows.nth(i);
      const projectText = await row.locator('td').first().textContent();
      
      if (projectText && !projectText.includes('Protocol')) {
        console.log('5. Deleting duplicate CURE position...');
        const deleteButton = row.locator('button:has-text("Delete")');
        await deleteButton.click();
        
        // Confirm deletion
        page.on('dialog', dialog => dialog.accept());
        await page.waitForTimeout(2000);
        console.log('   ✅ Duplicate CURE deleted');
        break;
      }
    }
  }
  
  console.log('6. Taking final screenshot...');
  await page.screenshot({ path: 'cleanup-final-portfolio.png', fullPage: true });
  
  console.log('✅ Cleanup complete!');
  
  await browser.close();
}

cleanupTestPositions().catch(console.error);