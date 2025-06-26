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
    
    // Take a screenshot to see current state
    await page.screenshot({ path: 'telegram-admin-before.png', fullPage: true });
    console.log('📸 Screenshot saved: telegram-admin-before.png');
    
    // 3. Fill in test message form
    console.log('\n3. Filling test message form...');
    const chatId = '5089502326'; // Marc's Telegram chat ID
    const testMessage = `Test from Sunbeam admin - ${new Date().toLocaleString()}`;
    
    // Fill the form
    await page.fill('input[placeholder*="Chat ID"]', chatId);
    await page.fill('textarea', testMessage);
    
    // Take screenshot before sending
    await page.screenshot({ path: 'telegram-admin-filled.png', fullPage: true });
    console.log('📸 Screenshot saved: telegram-admin-filled.png');
    
    // 4. Send the test message
    console.log('\n4. Sending test message...');
    await page.click('button:has-text("Send Test Message")');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Check for success or error message
    const pageContent = await page.content();
    
    // Take final screenshot
    await page.screenshot({ path: 'telegram-admin-after.png', fullPage: true });
    console.log('📸 Screenshot saved: telegram-admin-after.png');
    
    // Check if we see any error messages
    if (pageContent.includes('Successfully sent')) {
      console.log('\n✅ Message sent successfully!');
    } else if (pageContent.includes('Telegram bot not configured')) {
      console.log('\n❌ Error: Telegram bot not configured');
    } else if (pageContent.includes('Failed to send')) {
      console.log('\n❌ Error: Failed to send message');
    } else {
      console.log('\n⚠️  Unknown response - check screenshots');
    }
    
    // 5. Check the connections list
    console.log('\n5. Checking Telegram connections...');
    const connections = await page.$$eval('table tbody tr', rows => 
      rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
          email: cells[0]?.textContent?.trim() || '',
          chatId: cells[1]?.textContent?.trim() || '',
          username: cells[2]?.textContent?.trim() || '',
          status: cells[3]?.textContent?.trim() || ''
        };
      })
    );
    
    console.log('\nTelegram Connections:');
    connections.forEach(conn => {
      console.log(`- ${conn.email}: ${conn.chatId} (@${conn.username}) - ${conn.status}`);
    });
    
  } catch (error) {
    console.error('Error during test:', error.message);
    await page.screenshot({ path: 'telegram-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: telegram-error.png');
  } finally {
    await browser.close();
  }
  
  console.log('\n✅ Test completed. Check your Telegram for the test message.');
  console.log('Also check the screenshot files for visual confirmation.');
}

testTelegramViaAdmin().catch(console.error);