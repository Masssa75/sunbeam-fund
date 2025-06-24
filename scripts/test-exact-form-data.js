const { chromium } = require('playwright');

async function testExactFormData() {
  console.log('🧪 Testing API with exact form data...');
  
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
    
    // Test the API with the exact data captured from the form
    console.log('📋 Step 2: Testing API with exact form data...');
    
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/investors/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "id": "4a0d5701-5639-4d90-9adf-7582290d9d11",
            "email": "marc@cyrator.com",
            "name": "Test Exact Form Data",
            "account_number": "EXACT-001",
            "share_percentage": 8.5,
            "initial_investment": 45000,
            "notes": "Testing exact form data"
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
          ok: response.ok
        };
      } catch (error) {
        return { error: error.message, stack: error.stack };
      }
    });
    
    console.log('📊 API Response:', JSON.stringify(apiResponse, null, 2));
    
    if (apiResponse.ok) {
      console.log('✅ SUCCESS! API call with exact form data worked');
    } else {
      console.log('❌ API call failed');
      
      // If it failed, let's check if that user ID exists
      console.log('📋 Step 3: Checking if user ID exists...');
      const userCheckResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/auth/session/');
          const sessionData = await response.json();
          return { sessionData };
        } catch (error) {
          return { error: error.message };
        }
      });
      console.log('User check response:', userCheckResponse);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
  
  await browser.close();
  console.log('🏁 Test completed');
}

testExactFormData().catch(console.error);