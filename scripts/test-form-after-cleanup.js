const { chromium } = require('playwright');

async function testFormAfterCleanup() {
  console.log('🧪 Testing form after cleaning up existing investors...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login first
    console.log('📋 Step 1: Logging in...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    console.log('✅ Login successful');
    
    // Clean up existing investors first
    console.log('📋 Step 2: Cleaning up existing investors...');
    const cleanupResponse = await page.evaluate(async () => {
      try {
        // Delete marc@cyrator.com investor
        const deleteResponse = await fetch('/api/investors/74c1ca77-4b94-4a76-ab4d-6f77b93ab920', {
          method: 'DELETE'
        });
        return { 
          deleteStatus: deleteResponse.status,
          deleteOk: deleteResponse.ok 
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    console.log('Cleanup response:', cleanupResponse);
    
    // Navigate to manage investors
    console.log('📋 Step 3: Going to Manage Investors...');
    await page.goto('https://sunbeam.capital/admin/investors');
    await page.waitForLoadState('networkidle');
    
    // Find a user to convert
    console.log('📋 Step 4: Finding user to convert...');
    const makeInvestorButton = page.locator('button:has-text("Make Investor")').first();
    await makeInvestorButton.click();
    
    // Wait for modal to appear
    await page.waitForSelector('form', { timeout: 5000 });
    console.log('✅ Modal appeared');
    
    // Get the user being converted
    const convertingText = await page.locator('text=/Converting:.*/')?.textContent();
    console.log('Converting user:', convertingText);
    
    // Fill the form
    console.log('📋 Step 5: Filling form fields...');
    await page.fill('input[type="text"]:near(label:has-text("Name"))', 'Test Form User');
    await page.fill('input[placeholder="e.g., INV001"]', 'FORM-TEST-001');
    await page.fill('input[placeholder="e.g., 10.5"]', '12.5');
    await page.fill('input[placeholder="e.g., 50000"]', '60000');
    await page.fill('textarea', 'Created via form test');
    
    // Take screenshot before submission
    await page.screenshot({ path: 'form-test-before-submit.png', fullPage: true });
    
    // Submit the form
    console.log('📋 Step 6: Submitting form...');
    
    // Monitor the API call
    let apiResponse = null;
    page.on('response', response => {
      if (response.url().includes('/api/investors/') && response.request().method() === 'POST') {
        apiResponse = {
          status: response.status(),
          ok: response.ok(),
          url: response.url()
        };
      }
    });
    
    await page.click('button:has-text("Create Investor")');
    
    // Wait for the API call to complete
    await page.waitForTimeout(3000);
    
    if (apiResponse) {
      console.log('📊 API Response:', apiResponse);
      
      if (apiResponse.ok) {
        console.log('✅ SUCCESS! Form submitted successfully');
        
        // Check if modal disappeared
        const modalGone = await page.locator('form').count() === 0;
        console.log('Modal disappeared:', modalGone);
        
        // Take success screenshot
        await page.screenshot({ path: 'form-test-success.png', fullPage: true });
      } else {
        console.log('❌ Form submission failed');
        await page.screenshot({ path: 'form-test-failed.png', fullPage: true });
      }
    } else {
      console.log('❌ No API response detected');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({ path: 'form-test-error.png', fullPage: true });
  }
  
  await browser.close();
  console.log('🏁 Test completed');
}

testFormAfterCleanup().catch(console.error);