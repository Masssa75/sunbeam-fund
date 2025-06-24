const { chromium } = require('playwright');

async function testInvestorFormPrecise() {
  console.log('🧪 Testing investor creation form with precise selectors...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Monitor console messages and network requests
  page.on('console', msg => {
    console.log('Console:', msg.type(), msg.text());
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/investors')) {
      console.log('API Response:', response.status(), response.url());
    }
  });
  
  try {
    // Login first
    console.log('📋 Step 1: Logging in...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    console.log('✅ Login successful');
    
    // Navigate to manage investors
    console.log('📋 Step 2: Going to Manage Investors...');
    await page.goto('https://sunbeam.capital/admin/investors');
    await page.waitForLoadState('networkidle');
    
    // Find a user to convert
    console.log('📋 Step 3: Finding user to convert...');
    const makeInvestorButton = page.locator('button:has-text("Make Investor")').first();
    await makeInvestorButton.click();
    
    // Wait for modal to appear
    await page.waitForSelector('form', { timeout: 5000 });
    console.log('✅ Modal appeared');
    
    // Fill the form using more precise selectors based on the component structure
    console.log('📋 Step 4: Filling form fields...');
    
    // Name field (should be pre-filled, but let's clear and fill it)
    await page.fill('input[type="text"]:near(label:has-text("Name"))', 'Test Investor Name');
    
    // Account Number field
    await page.fill('input[placeholder="e.g., INV001"]', 'ACC-001');
    
    // Share Percentage field
    await page.fill('input[placeholder="e.g., 10.5"]', '15.5');
    
    // Initial Investment field (optional)
    await page.fill('input[placeholder="e.g., 50000"]', '75000');
    
    // Notes field (optional)
    await page.fill('textarea', 'Test investor created via automation');
    
    // Take screenshot of filled form
    await page.screenshot({ path: 'investor-form-filled-precise.png', fullPage: true });
    console.log('📸 Filled form screenshot saved');
    
    // Submit the form
    console.log('📋 Step 5: Submitting form...');
    await page.click('button:has-text("Create Investor")');
    
    // Wait for either success or error
    await page.waitForTimeout(3000);
    
    // Check if modal is still there (which would indicate an error)
    const modalStillPresent = await page.locator('form').count() > 0;
    if (modalStillPresent) {
      console.log('❌ Modal still present - likely validation error');
      
      // Check for any validation messages
      const validationMessages = await page.locator('[role="alert"], .error, .text-red-500').allTextContents();
      if (validationMessages.length > 0) {
        console.log('Validation errors:', validationMessages);
      }
      
      // Check browser's built-in validation
      const invalidFields = await page.locator('input:invalid, textarea:invalid').count();
      console.log('Invalid fields count:', invalidFields);
      
      if (invalidFields > 0) {
        console.log('Checking which fields are invalid...');
        const inputs = await page.locator('input, textarea').all();
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          const isValid = await input.evaluate(el => el.checkValidity());
          const validationMessage = await input.evaluate(el => el.validationMessage);
          const value = await input.inputValue();
          const placeholder = await input.getAttribute('placeholder');
          const required = await input.getAttribute('required');
          
          console.log(`Field ${i}: valid=${isValid}, value="${value}", placeholder="${placeholder}", required=${required !== null}, validationMessage="${validationMessage}"`);
        }
      }
    } else {
      console.log('✅ Modal disappeared - form submitted successfully');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'investor-creation-final.png', fullPage: true });
    console.log('📸 Final screenshot saved');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({ path: 'investor-test-error.png', fullPage: true });
  }
  
  await browser.close();
  console.log('🏁 Test completed');
}

testInvestorFormPrecise().catch(console.error);