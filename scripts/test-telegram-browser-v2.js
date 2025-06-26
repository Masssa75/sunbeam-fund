const { chromium } = require('playwright');

async function testTelegramViaAdmin() {
  console.log('Testing Telegram bot via admin interface...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Login as admin
    console.log('1. Logging in as admin...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    console.log('✅ Logged in successfully');
    
    // 2. Navigate to Telegram admin page
    console.log('\n2. Navigating to Telegram admin page...');
    await page.goto('https://sunbeam.capital/admin/telegram');
    await page.waitForLoadState('networkidle');
    
    // 3. Fill in test message form
    console.log('\n3. Filling test message form...');
    const chatId = '5089502326'; // Marc's Telegram chat ID
    const testMessage = `Automated test from Sunbeam admin - ${new Date().toLocaleString()}`;
    
    // Clear and fill the chat ID field
    const chatIdInput = page.locator('input[placeholder*="e.g., 123456789"]');
    await chatIdInput.clear();
    await chatIdInput.fill(chatId);
    
    // Clear and fill the message field
    const messageTextarea = page.locator('textarea');
    await messageTextarea.clear();
    await messageTextarea.fill(testMessage);
    
    // Take screenshot before sending
    await page.screenshot({ path: 'telegram-test-filled.png', fullPage: true });
    console.log('📸 Screenshot saved: telegram-test-filled.png');
    
    // 4. Send the test message
    console.log('\n4. Clicking Send Test Message button...');
    await page.click('button:has-text("Send Test Message")');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Take final screenshot
    await page.screenshot({ path: 'telegram-test-result.png', fullPage: true });
    console.log('📸 Screenshot saved: telegram-test-result.png');
    
    // Check for success or error message
    const successMessage = await page.locator('.bg-green-100').count();
    const errorMessage = await page.locator('.bg-red-100').count();
    
    if (successMessage > 0) {
      const successText = await page.locator('.bg-green-100').textContent();
      console.log('\n✅ Success:', successText.trim());
    } else if (errorMessage > 0) {
      const errorText = await page.locator('.bg-red-100').textContent();
      console.log('\n❌ Error:', errorText.trim());
    } else {
      console.log('\n⚠️  No clear success/error message found');
    }
    
    // 5. Also test the "Test Message" button in the connections table
    console.log('\n5. Testing the Test Message button for marc@cyrator.com...');
    const testButton = page.locator('button:has-text("Test Message")').first();
    await testButton.click();
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'telegram-test-button.png', fullPage: true });
    console.log('📸 Screenshot saved: telegram-test-button.png');
    
  } catch (error) {
    console.error('Error during test:', error.message);
    await page.screenshot({ path: 'telegram-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: telegram-error.png');
  } finally {
    await browser.close();
  }
  
  console.log('\n✅ Test completed. Check your Telegram for the test messages.');
  console.log('Review the screenshots to see the results.');
}

testTelegramViaAdmin().catch(console.error);