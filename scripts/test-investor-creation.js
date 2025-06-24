const { chromium } = require('playwright');

async function testInvestorCreation() {
  console.log('Testing investor creation...');
  
  const browser = await chromium.launch({ 
    headless: false,  // Set to true for headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login first
    console.log('Logging in...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    console.log('✅ Login successful');

    // Navigate to investors page
    console.log('Navigating to investors page...');
    await page.goto('https://sunbeam.capital/admin/investors');
    await page.waitForLoadState('networkidle');

    // Click "Make Investor" button for test@sunbeam.capital
    console.log('Looking for test@sunbeam.capital user...');
    
    // Find the row with test@sunbeam.capital and click Make Investor
    const testUserRow = await page.locator('text=test@sunbeam.capital').locator('..').locator('..');
    if (await testUserRow.count() > 0) {
      console.log('Found test@sunbeam.capital user');
      const makeInvestorButton = testUserRow.locator('button:has-text("Make Investor")');
      if (await makeInvestorButton.count() > 0) {
        await makeInvestorButton.click();
        console.log('Clicked Make Investor button');

        // Fill in the form
        console.log('Filling investor form...');
        await page.fill('input[name="name"]', 'Test Investor');
        await page.fill('input[name="account_number"]', '999');
        await page.fill('input[name="share_percentage"]', '15.5');
        await page.fill('input[name="initial_investment"]', '25000');
        await page.fill('textarea[name="notes"]', 'Test investor created via browser automation');

        // Submit the form
        console.log('Submitting form...');
        await page.click('button:has-text("Create Investor")');

        // Wait for response
        await page.waitForTimeout(3000);

        // Check for success or error messages
        const errorAlert = await page.locator('text=Failed to create investor').count();
        const successMessage = await page.locator('text=successfully').count();

        if (errorAlert > 0) {
          console.log('❌ Error: Failed to create investor');
          
          // Check if there are any console errors
          page.on('console', msg => {
            if (msg.type() === 'error') {
              console.log('Browser console error:', msg.text());
            }
          });
          
        } else if (successMessage > 0) {
          console.log('✅ Investor created successfully!');
        } else {
          console.log('⚠️  Unknown result - taking screenshot');
          await page.screenshot({ path: 'investor-creation-result.png', fullPage: true });
        }

      } else {
        console.log('❌ Make Investor button not found');
      }
    } else {
      console.log('❌ test@sunbeam.capital user not found');
      await page.screenshot({ path: 'investors-page.png', fullPage: true });
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testInvestorCreation().catch(console.error);