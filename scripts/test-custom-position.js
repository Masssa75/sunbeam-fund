const { chromium } = require('playwright');

async function testCustomPosition() {
  const browser = await chromium.launch({ 
    headless: false, // Set to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('1. Navigating to login page...');
  await page.goto('https://sunbeam.capital/login');
  await page.screenshot({ path: 'custom-position-1-login.png', fullPage: true });
  
  console.log('2. Logging in...');
  await page.fill('input[type="email"]', 'marc@minutevideos.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  
  // Wait for redirect to portfolio
  await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
  await page.waitForTimeout(2000); // Let portfolio load
  
  await page.screenshot({ path: 'custom-position-2-portfolio.png', fullPage: true });
  
  console.log('3. Clicking Add Position button...');
  await page.click('button:has-text("Add Position")');
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'custom-position-3-modal-open.png', fullPage: true });
  
  console.log('4. Clicking Custom Entry button...');
  await page.click('button:has-text("Custom Entry (Presale/Other)")');
  await page.waitForTimeout(500);
  
  await page.screenshot({ path: 'custom-position-4-custom-mode.png', fullPage: true });
  
  console.log('5. Filling custom position details...');
  // Check if the form fields are visible
  const projectNameVisible = await page.locator('input[placeholder*="Project X Presale"]').isVisible();
  console.log('Project name field visible:', projectNameVisible);
  
  if (projectNameVisible) {
    await page.fill('input[placeholder*="Project X Presale"]', 'CURE Protocol');
    await page.fill('input[placeholder*="PROJX"]', 'CURE');
  } else {
    console.log('Project name field not visible! Checking page state...');
  }
  
  // Fill amount and cost basis
  const amountInput = page.locator('label:has-text("Amount") + input');
  const costBasisInput = page.locator('label:has-text("Total Cost Basis") + input');
  
  await amountInput.fill('20000');
  await costBasisInput.fill('20000');
  
  // Fill entry date
  const dateInput = page.locator('input[type="date"]');
  await dateInput.fill('2025-01-25');
  
  // Add notes
  const notesTextarea = page.locator('textarea');
  await notesTextarea.fill('Presale Round 1, Vesting 12 months');
  
  await page.screenshot({ path: 'custom-position-5-filled-form.png', fullPage: true });
  
  console.log('6. Checking Add button state...');
  const addButton = page.locator('button:has-text("Add")').last();
  const isDisabled = await addButton.isDisabled();
  console.log('Add button disabled:', isDisabled);
  
  if (!isDisabled) {
    console.log('7. Clicking Add button...');
    await addButton.click();
    
    // Wait for modal to close
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'custom-position-6-after-add.png', fullPage: true });
    
    // Check if position was added
    const curePosition = await page.locator('text=CURE Protocol').count();
    console.log('CURE position found:', curePosition > 0);
  } else {
    console.log('Add button is disabled! Cannot submit form.');
    
    // Check console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
  }
  
  await page.screenshot({ path: 'custom-position-7-final-state.png', fullPage: true });
  
  await browser.close();
}

testCustomPosition().catch(console.error);