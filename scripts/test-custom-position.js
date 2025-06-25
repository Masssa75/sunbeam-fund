const { chromium } = require('playwright');

async function testCustomPosition() {
  console.log('🧪 Testing Custom Position Adding Functionality...\n');
  
  let browser;
  try {
    // Launch browser with visible window for debugging
    browser = await chromium.launch({ 
      headless: false,  // Set to true for headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Monitor console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      }
    });
    
    // Monitor network failures
    page.on('requestfailed', request => {
      console.log('❌ Request failed:', request.url(), request.failure().errorText);
    });
    
    console.log('1️⃣ Navigating to login page...');
    await page.goto('https://sunbeam.capital/login');
    await page.screenshot({ path: 'test-custom-1-login.png', fullPage: true });
    
    console.log('2️⃣ Logging in as marc@minutevideos.com...');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    console.log('3️⃣ Waiting for portfolio page...');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for portfolio to load
    await page.screenshot({ path: 'test-custom-2-portfolio.png', fullPage: true });
    
    // Check if portfolio loaded
    const portfolioLoaded = await page.locator('text=Portfolio Holdings').count() > 0;
    console.log('   Portfolio loaded:', portfolioLoaded);
    
    console.log('4️⃣ Looking for Add Position button...');
    const addPositionButton = page.locator('button:has-text("Add Position")');
    const hasAddButton = await addPositionButton.count() > 0;
    console.log('   Add Position button found:', hasAddButton);
    
    if (!hasAddButton) {
      console.log('   ⚠️  Add Position button not found, checking for other selectors...');
      // Try alternative selectors
      const altButton = page.locator('button').filter({ hasText: /add.*position/i });
      const altCount = await altButton.count();
      console.log('   Alternative button count:', altCount);
      
      // List all buttons on page for debugging
      const allButtons = await page.locator('button').allTextContents();
      console.log('   All buttons on page:', allButtons);
    }
    
    console.log('5️⃣ Clicking Add Position button...');
    await addPositionButton.click();
    await page.waitForTimeout(1000); // Wait for modal to appear
    await page.screenshot({ path: 'test-custom-3-modal.png', fullPage: true });
    
    console.log('6️⃣ Looking for Custom Entry button...');
    const customEntryButton = page.locator('button:has-text("Custom Entry")');
    const hasCustomButton = await customEntryButton.count() > 0;
    console.log('   Custom Entry button found:', hasCustomButton);
    
    if (!hasCustomButton) {
      // Try alternative selectors
      const altCustom = page.locator('button').filter({ hasText: /custom/i });
      console.log('   Alternative custom button count:', await altCustom.count());
    }
    
    console.log('7️⃣ Clicking Custom Entry button...');
    await customEntryButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-custom-4-custom-form.png', fullPage: true });
    
    console.log('8️⃣ Filling in custom position details...');
    
    // Find form fields by their labels instead of placeholders
    const projectNameField = page.locator('input[type="text"]').nth(0); // First text input (Project Name)
    const symbolField = page.locator('input[type="text"]').nth(1); // Second text input (Symbol)
    const amountField = page.locator('input[type="number"]').nth(0); // First number input (Amount)
    const costBasisField = page.locator('input[type="number"]').nth(1); // Second number input (Cost Basis)
    const dateField = page.locator('input[type="date"]');
    const notesField = page.locator('textarea');
    
    // Fill in the fields
    await projectNameField.fill('CURE');
    await symbolField.fill('CURE');
    await amountField.fill('20000');
    await costBasisField.fill('20000');
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    await dateField.fill(today);
    
    // Fill in notes
    await notesField.fill('Presale investment - $20K allocation');
    
    await page.screenshot({ path: 'test-custom-5-filled-form.png', fullPage: true });
    
    console.log('9️⃣ Submitting the form...');
    // Look for the Add button at the bottom of the form
    const submitButton = page.locator('button[type="submit"]:has-text("Add")');
    const submitCount = await submitButton.count();
    console.log('   Submit button count:', submitCount);
    
    if (submitCount > 0) {
      await submitButton.click();
    } else {
      console.log('   ⚠️  No submit button found, checking all buttons...');
      const allButtons = await page.locator('button').allTextContents();
      console.log('   All buttons:', allButtons);
      
      // Try to find the Add button using a more generic selector
      const addButton = page.locator('button').filter({ hasText: 'Add' }).last();
      if (await addButton.count() > 0) {
        console.log('   Found Add button using generic selector');
        await addButton.click();
      }
    }
    
    console.log('🔟 Waiting for position to be added...');
    await page.waitForTimeout(3000); // Wait for API call and refresh
    await page.screenshot({ path: 'test-custom-6-after-submit.png', fullPage: true });
    
    // Check if CURE position was added
    console.log('1️⃣1️⃣ Checking if CURE position was added...');
    const curePosition = page.locator('text=CURE').first();
    const hasCurePosition = await curePosition.count() > 0;
    console.log('   CURE position found:', hasCurePosition);
    
    if (hasCurePosition) {
      console.log('   ✅ Custom position successfully added!');
      
      // Check for Custom badge
      const customBadge = page.locator('span:has-text("Custom")');
      const hasCustomBadge = await customBadge.count() > 0;
      console.log('   Custom badge found:', hasCustomBadge);
    } else {
      console.log('   ❌ CURE position not found in portfolio');
      
      // Check for error messages
      const errorMessage = page.locator('.text-red-500, .text-red-600, [role="alert"]');
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.textContent();
        console.log('   Error message:', errorText);
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-custom-7-final-state.png', fullPage: true });
    
    console.log('\n✅ Test completed! Check the screenshots for visual confirmation.');
    console.log('📸 Screenshots saved:');
    console.log('   - test-custom-1-login.png');
    console.log('   - test-custom-2-portfolio.png');
    console.log('   - test-custom-3-modal.png');
    console.log('   - test-custom-4-custom-form.png');
    console.log('   - test-custom-5-filled-form.png');
    console.log('   - test-custom-6-after-submit.png');
    console.log('   - test-custom-7-final-state.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot if page is available
    if (browser) {
      const pages = browser.contexts()[0]?.pages();
      if (pages && pages.length > 0) {
        await pages[0].screenshot({ path: 'test-custom-error.png', fullPage: true });
        console.log('📸 Error screenshot saved: test-custom-error.png');
      }
    }
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Keep browser open for observation
      await browser.close();
    }
  }
}

// Run the test
testCustomPosition().catch(console.error);