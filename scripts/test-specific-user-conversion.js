const { chromium } = require('playwright');

async function testSpecificUserConversion() {
  console.log('🧪 Testing specific user conversion...');
  
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
    
    // Navigate to manage investors
    console.log('📋 Step 2: Going to Manage Investors...');
    await page.goto('https://sunbeam.capital/admin/investors');
    await page.waitForLoadState('networkidle');
    
    // Get information about the users in the table
    console.log('📋 Step 3: Checking users in table...');
    
    const userRows = await page.locator('table tbody tr').all();
    console.log('Found', userRows.length, 'user rows');
    
    for (let i = 0; i < userRows.length; i++) {
      const row = userRows[i];
      const cells = await row.locator('td').allTextContents();
      console.log(`User ${i}:`, cells);
    }
    
    // Check which user the form will try to convert
    const makeInvestorButtons = await page.locator('button:has-text("Make Investor")').all();
    console.log('Found', makeInvestorButtons.length, 'Make Investor buttons');
    
    if (makeInvestorButtons.length > 0) {
      // Click the first one
      await makeInvestorButtons[0].click();
      
      // Wait for modal
      await page.waitForSelector('form', { timeout: 5000 });
      
      // Get the user being converted
      const convertingText = await page.locator('text=/Converting:.*/')?.textContent();
      console.log('Converting user:', convertingText);
      
      // Get pre-filled name
      const nameField = page.locator('input[type="text"]').first();
      const nameValue = await nameField.inputValue();
      console.log('Pre-filled name:', nameValue);
      
      // Test the API call manually with specific data
      console.log('📋 Step 4: Testing API call directly...');
      
      const apiResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/investors/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: 'test-id-12345',  // Use a fake ID to see what happens
              email: 'test@example.com',
              name: 'Test User API',
              account_number: 'API-TEST-001',
              share_percentage: 5.0,
              initial_investment: 25000,
              notes: 'API test'
            })
          });
          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
          return { status: response.status, data };
        } catch (error) {
          return { error: error.message };
        }
      });
      
      console.log('Direct API response:', apiResponse);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
  
  await browser.close();
  console.log('🏁 Test completed');
}

testSpecificUserConversion().catch(console.error);