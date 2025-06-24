const { chromium } = require('playwright');

async function testInvestorCreation() {
  console.log('🧪 Testing investor creation form...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Monitor console messages
  page.on('console', msg => {
    console.log('Console:', msg.type(), msg.text());
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
    
    // Take screenshot
    await page.screenshot({ path: 'manage-investors-page.png', fullPage: true });
    console.log('📸 Screenshot saved: manage-investors-page.png');
    
    // Look for the form and try to create an investor
    console.log('📋 Step 3: Looking for investor creation form...');
    
    // Check if there's a user to convert
    const userRows = await page.locator('table tbody tr').count();
    console.log('👥 Found', userRows, 'users in the table');
    
    if (userRows > 0) {
      // Try to click the first "Make Investor" button
      const makeInvestorButton = page.locator('button:has-text("Make Investor")').first();
      if (await makeInvestorButton.count() > 0) {
        console.log('📋 Step 4: Clicking Make Investor button...');
        await makeInvestorButton.click();
        
        // Wait for modal to appear
        await page.waitForSelector('[role="dialog"], .modal, .fixed', { timeout: 5000 });
        console.log('✅ Modal appeared');
        
        // Take screenshot of modal
        await page.screenshot({ path: 'investor-modal.png', fullPage: true });
        console.log('📸 Modal screenshot saved: investor-modal.png');
        
        // Try to fill the form
        console.log('📋 Step 5: Filling form fields...');
        
        // Check what fields exist
        const inputs = await page.locator('input, select, textarea').all();
        console.log('Found', inputs.length, 'form fields');
        
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          const type = await input.getAttribute('type');
          const name = await input.getAttribute('name');
          const placeholder = await input.getAttribute('placeholder');
          const required = await input.getAttribute('required');
          console.log('Field', i, '- Type:', type, 'Name:', name, 'Placeholder:', placeholder, 'Required:', required !== null);
        }
        
        // Try to fill the form step by step
        await page.fill('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]', 'Test Investor');
        await page.fill('input[name="account_number"], input[placeholder*="account"], input[placeholder*="Account"]', 'ACC-001');
        await page.fill('input[name="share_percentage"], input[placeholder*="percentage"], input[placeholder*="Percentage"]', '10');
        await page.fill('input[name="initial_investment"], input[placeholder*="investment"], input[placeholder*="Investment"]', '50000');
        await page.fill('textarea[name="notes"], textarea[placeholder*="notes"], textarea[placeholder*="Notes"]', 'Test investor creation');
        
        // Take screenshot after filling
        await page.screenshot({ path: 'investor-modal-filled.png', fullPage: true });
        console.log('📸 Filled form screenshot saved: investor-modal-filled.png');
        
        // Try to submit
        console.log('📋 Step 6: Attempting to submit...');
        const submitButton = page.locator('button:has-text("Create"), button:has-text("Save"), button[type="submit"]').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          console.log('✅ Submit button clicked');
          
          // Wait a bit and take final screenshot
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'investor-creation-result.png', fullPage: true });
          console.log('📸 Result screenshot saved: investor-creation-result.png');
        } else {
          console.log('❌ No submit button found');
        }
      } else {
        console.log('❌ No Make Investor button found');
      }
    } else {
      console.log('❌ No users found to convert');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  }
  
  await browser.close();
  console.log('🏁 Test completed');
}

testInvestorCreation().catch(console.error);