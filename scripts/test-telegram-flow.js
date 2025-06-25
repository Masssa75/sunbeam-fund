const { chromium } = require('playwright');

async function testTelegramFlow() {
  console.log('Testing Telegram connection flow...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('1. Navigating to Sunbeam Capital...');
    await page.goto('https://sunbeam.capital');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'test-1-homepage.png' });
    
    // Set up network monitoring
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()
      });
    });
    
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`   API Error: ${response.status()} ${response.url()}`);
      }
    });
    
    console.log('2. Logging in...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('https://sunbeam.capital/', { timeout: 30000 });
    console.log('✓ Login successful');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('3. Looking for notification bell...');
    // Click the notification bell
    const bellButton = await page.locator('button').filter({ has: page.locator('svg path[d*="M15 17h5l-1.405"]') }).first();
    await bellButton.click();
    
    // Take screenshot of dropdown
    await page.screenshot({ path: 'test-2-dropdown.png' });
    console.log('✓ Notification dropdown opened');
    
    console.log('4. Looking for Enable Push Notifications button...');
    // Wait a bit for loading to complete
    await page.waitForTimeout(3000);
    
    // Check if the button exists and is clickable
    const enableButton = await page.locator('button:has-text("Enable Push Notifications")').first();
    const isVisible = await enableButton.isVisible();
    const isEnabled = await enableButton.isEnabled();
    
    console.log(`   Button visible: ${isVisible}`);
    console.log(`   Button enabled: ${isEnabled}`);
    
    // Check for loading state
    const loadingElements = await page.locator('text=Loading').count();
    console.log(`   Loading elements: ${loadingElements}`);
    
    if (isVisible && isEnabled) {
      // Intercept the window.open call
      await page.evaluate(() => {
        window.telegramLinkOpened = null;
        const originalOpen = window.open;
        window.open = function(url) {
          window.telegramLinkOpened = url;
          console.log('Window.open called with:', url);
          return null;
        };
      });
      
      console.log('5. Clicking Enable Push Notifications...');
      await enableButton.click();
      
      // Wait a bit for any async operations
      await page.waitForTimeout(2000);
      
      // Check if window.open was called
      const openedLink = await page.evaluate(() => window.telegramLinkOpened);
      
      if (openedLink) {
        console.log(`✓ Telegram link generated: ${openedLink}`);
        
        // Extract token from link
        const tokenMatch = openedLink.match(/start=([a-zA-Z0-9]+)/);
        if (tokenMatch) {
          console.log(`✓ Token extracted: ${tokenMatch[1]}`);
          console.log('\n✅ SUCCESS! The button works and generates a proper Telegram link.');
        } else {
          console.log('❌ ERROR: Link generated but no token found');
        }
      } else {
        console.log('❌ ERROR: Button clicked but no Telegram link was opened');
        
        // Check console for errors
        const consoleMessages = await page.evaluate(() => {
          return window.consoleMessages || [];
        });
        console.log('Console messages:', consoleMessages);
      }
    } else {
      console.log('❌ ERROR: Enable Push Notifications button not found or not clickable');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-3-final.png' });
    
  } catch (error) {
    console.error('Test failed:', error);
    
    // Try to take error screenshot
    try {
      const page = browser.contexts()[0]?.pages()[0];
      if (page) {
        await page.screenshot({ path: 'test-error.png' });
      }
    } catch (e) {
      // Ignore screenshot errors
    }
  } finally {
    await browser.close();
  }
}

// Capture console messages
async function setupConsoleCapture(page) {
  await page.evaluateOnNewDocument(() => {
    window.consoleMessages = [];
    const originalLog = console.log;
    const originalError = console.error;
    console.log = (...args) => {
      window.consoleMessages.push({ type: 'log', args });
      originalLog.apply(console, args);
    };
    console.error = (...args) => {
      window.consoleMessages.push({ type: 'error', args });
      originalError.apply(console, args);
    };
  });
}

testTelegramFlow().catch(console.error);