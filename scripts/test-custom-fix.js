const { chromium } = require('playwright');

async function testCustomPositionFix() {
  const browser = await chromium.launch({ 
    headless: true, // Run headless for speed
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('1. Logging in...');
  await page.goto('https://sunbeam.capital/login');
  await page.fill('input[type="email"]', 'marc@minutevideos.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
  await page.waitForTimeout(3000); // Let portfolio load
  
  console.log('2. Opening Add Position modal...');
  await page.click('button:has-text("Add Position")');
  await page.waitForTimeout(1000);
  
  console.log('3. Switching to Custom Entry mode...');
  await page.click('button:has-text("Custom Entry (Presale/Other)")');
  await page.waitForTimeout(500);
  
  // Take screenshot to verify form state
  await page.screenshot({ path: 'custom-fix-1-form-state.png', fullPage: true });
  
  // Check if form fields are visible
  const projectNameField = page.locator('input[placeholder*="Project X Presale"]');
  const symbolField = page.locator('input[placeholder*="PROJX"]');
  
  const projectNameVisible = await projectNameField.isVisible();
  const symbolVisible = await symbolField.isVisible();
  
  console.log('4. Form field visibility:');
  console.log('   - Project Name field visible:', projectNameVisible);
  console.log('   - Symbol field visible:', symbolVisible);
  
  if (!projectNameVisible || !symbolVisible) {
    console.log('ERROR: Custom entry form fields not visible!');
    await browser.close();
    return;
  }
  
  console.log('5. Filling custom position details...');
  await projectNameField.fill('Test Custom Token');
  await symbolField.fill('TCT');
  
  // Fill other fields using more specific selectors
  await page.fill('label:has-text("Amount") + input', '10000');
  await page.fill('label:has-text("Total Cost Basis") + input', '5000');
  await page.fill('input[type="date"]', '2025-06-20');
  await page.fill('textarea', 'Test custom position for debugging');
  
  // Take screenshot before clicking Add
  await page.screenshot({ path: 'custom-fix-2-filled-form.png', fullPage: true });
  
  // Check Add button state
  const addButton = page.locator('button:has-text("Add")').last();
  const isDisabled = await addButton.isDisabled();
  console.log('6. Add button disabled:', isDisabled);
  
  if (!isDisabled) {
    console.log('7. Clicking Add button...');
    await addButton.click();
    
    // Wait for modal to close and portfolio to refresh
    await page.waitForTimeout(3000);
    
    // Check if position was added
    const testPosition = await page.locator('text=Test Custom Token').count();
    console.log('8. Test Custom Token position found:', testPosition > 0);
    
    if (testPosition > 0) {
      console.log('✅ SUCCESS: Custom position added successfully!');
    } else {
      console.log('❌ ERROR: Custom position not found in portfolio');
    }
  } else {
    console.log('❌ ERROR: Add button is disabled!');
  }
  
  await page.screenshot({ path: 'custom-fix-3-final-portfolio.png', fullPage: true });
  
  await browser.close();
}

testCustomPositionFix().catch(console.error);