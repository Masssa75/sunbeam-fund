const { chromium } = require('playwright');

async function testAPIEndpointDirectly() {
  console.log('🧪 Testing API endpoint directly...');
  
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
    
    // Test the API endpoint with the exact data from our manual test
    console.log('📋 Step 2: Testing API endpoint...');
    
    const apiResponse = await page.evaluate(async () => {
      try {
        // First, let's delete any existing investor to avoid conflicts
        console.log('Deleting existing investor...');
        const deleteResponse = await fetch('/api/investors/74c1ca77-4b94-4a76-ab4d-6f77b93ab920', {
          method: 'DELETE'
        });
        console.log('Delete response:', deleteResponse.status);
        
        // Now create the investor
        console.log('Creating investor...');
        const response = await fetch('/api/investors/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: '74c1ca77-4b94-4a76-ab4d-6f77b93ab920',
            email: 'marc@cyrator.com',
            name: 'marc@cyrator.com',
            account_number: 'ACC-MARC-002',
            share_percentage: 15.5,
            initial_investment: 75000,
            notes: 'Test investor created via API'
          })
        });
        
        const text = await response.text();
        console.log('Raw response text:', text);
        
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
        
        return { 
          status: response.status, 
          data,
          headers: Object.fromEntries(response.headers),
          ok: response.ok
        };
      } catch (error) {
        return { error: error.message, stack: error.stack };
      }
    });
    
    console.log('📊 API Response:', JSON.stringify(apiResponse, null, 2));
    
    if (apiResponse.status === 200) {
      console.log('✅ SUCCESS! Investor creation worked via API');
    } else {
      console.log('❌ API call failed');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
  
  await browser.close();
  console.log('🏁 Test completed');
}

testAPIEndpointDirectly().catch(console.error);