const { chromium } = require('playwright');

async function captureFormData() {
  console.log('🧪 Capturing form data...');
  
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
    
    // Navigate to manage investors
    await page.goto('https://sunbeam.capital/admin/investors');
    await page.waitForLoadState('networkidle');
    
    // Find a user to convert
    const makeInvestorButton = page.locator('button:has-text("Make Investor")').first();
    await makeInvestorButton.click();
    await page.waitForSelector('form', { timeout: 5000 });
    
    // Fill the form
    await page.fill('input[type="text"]:near(label:has-text("Name"))', 'Test Capture User');
    await page.fill('input[placeholder="e.g., INV001"]', 'CAPTURE-001');
    await page.fill('input[placeholder="e.g., 10.5"]', '8.5');
    await page.fill('input[placeholder="e.g., 50000"]', '45000');
    await page.fill('textarea', 'Captured form data test');
    
    // Intercept the API request to capture the data
    let capturedData = null;
    
    await page.route('**/api/investors/', async (route, request) => {
      if (request.method() === 'POST') {
        capturedData = {
          method: request.method(),
          url: request.url(),
          headers: Object.fromEntries(Object.entries(request.headers())),
          body: request.postData()
        };
        console.log('📊 Captured request data:');
        console.log('Method:', capturedData.method);
        console.log('URL:', capturedData.url);
        console.log('Headers:', capturedData.headers);
        console.log('Body:', capturedData.body);
        
        // Parse the body
        try {
          const bodyData = JSON.parse(capturedData.body);
          console.log('📝 Parsed body data:', JSON.stringify(bodyData, null, 2));
        } catch (error) {
          console.log('❌ Could not parse body as JSON');
        }
      }
      
      // Continue with the request
      await route.continue();
    });
    
    // Submit the form
    console.log('📋 Step 2: Submitting form to capture data...');
    await page.click('button:has-text("Create Investor")');
    
    // Wait for the request to be captured
    await page.waitForTimeout(3000);
    
    if (capturedData) {
      console.log('✅ Successfully captured form data');
    } else {
      console.log('❌ Failed to capture form data');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
  
  await browser.close();
  console.log('🏁 Test completed');
}

captureFormData().catch(console.error);