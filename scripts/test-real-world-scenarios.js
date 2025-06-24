const { chromium } = require('playwright');

async function testRealWorldScenarios() {
  console.log('🌍 REAL-WORLD AUTHENTICATION SCENARIOS TEST\n');
  
  const scenarios = [
    {
      name: 'Morning Check - Quick Portfolio View',
      test: testMorningCheck
    },
    {
      name: 'Multi-Device Access - Phone then Desktop',
      test: testMultiDevice
    },
    {
      name: 'Long Work Session with Multiple Tabs',
      test: testLongSession
    },
    {
      name: 'Network Issues and Recovery',
      test: testNetworkRecovery
    },
    {
      name: 'Browser Refresh During Active Session',
      test: testBrowserRefresh
    },
    {
      name: 'Tab Switching and Background Tabs',
      test: testTabSwitching
    },
    {
      name: 'Login from Bookmark/Direct URL',
      test: testDirectAccess
    },
    {
      name: 'Session After Computer Sleep/Wake',
      test: testSleepWake
    }
  ];
  
  const results = { passed: 0, failed: 0, details: [] };
  
  for (const scenario of scenarios) {
    console.log(`\n📋 ${scenario.name}`);
    try {
      await scenario.test();
      console.log('✅ PASSED');
      results.passed++;
      results.details.push({ name: scenario.name, status: 'passed' });
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      results.failed++;
      results.details.push({ name: scenario.name, status: 'failed', error: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY\n');
  console.log(`Total: ${scenarios.length} scenarios`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / scenarios.length) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\nFailed Scenarios:');
    results.details
      .filter(d => d.status === 'failed')
      .forEach(d => console.log(`- ${d.name}: ${d.error}`));
  }
  
  return results;
}

// Scenario 1: Morning portfolio check
async function testMorningCheck() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // User opens browser and goes directly to site
    await page.goto('https://sunbeam.capital/');
    
    // Should redirect to login
    await page.waitForURL('**/login**', { timeout: 5000 });
    
    // Quick login
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Portfolio should load quickly
    await page.waitForSelector('text=Total Value', { timeout: 10000 });
    
    // User checks value and closes
    const hasValue = await page.locator('text=$').first().isVisible();
    if (!hasValue) throw new Error('No dollar values shown');
    
  } finally {
    await browser.close();
  }
}

// Scenario 2: Multi-device simulation
async function testMultiDevice() {
  // Phone browser
  const mobileBrowser = await chromium.launch({ headless: true });
  const mobileContext = await mobileBrowser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  try {
    // Login on phone
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('https://sunbeam.capital/login');
    await mobilePage.fill('input[name="email"]', 'marc@minutevideos.com');
    await mobilePage.fill('input[name="password"]', '123456');
    await mobilePage.click('button[type="submit"]');
    await mobilePage.waitForSelector('text=Total Value', { timeout: 10000 });
    
    // Desktop browser (same session cookies)
    const desktopPage = await mobileContext.newPage();
    await desktopPage.setViewportSize({ width: 1280, height: 720 });
    await desktopPage.goto('https://sunbeam.capital/');
    
    // Should already be logged in
    await desktopPage.waitForSelector('text=Total Value', { timeout: 10000 });
    
  } finally {
    await mobileBrowser.close();
  }
}

// Scenario 3: Long work session
async function testLongSession() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  try {
    // Initial login
    const tab1 = await context.newPage();
    await tab1.goto('https://sunbeam.capital/login');
    await tab1.fill('input[name="email"]', 'marc@minutevideos.com');
    await tab1.fill('input[name="password"]', '123456');
    await tab1.click('button[type="submit"]');
    await tab1.waitForSelector('text=Total Value', { timeout: 10000 });
    
    // Open multiple tabs over time
    for (let i = 0; i < 3; i++) {
      await tab1.waitForTimeout(2000); // Simulate time passing
      
      const newTab = await context.newPage();
      await newTab.goto('https://sunbeam.capital/');
      await newTab.waitForSelector('text=Total Value', { timeout: 10000 });
      
      // Close after checking
      await newTab.close();
    }
    
    // Original tab should still work
    await tab1.reload();
    await tab1.waitForSelector('text=Total Value', { timeout: 10000 });
    
  } finally {
    await browser.close();
  }
}

// Scenario 4: Network recovery
async function testNetworkRecovery() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Total Value', { timeout: 10000 });
    
    // Simulate network interruption by going offline
    await context.setOffline(true);
    
    // Try to reload (should fail gracefully)
    try {
      await page.reload({ timeout: 5000 });
    } catch (e) {
      // Expected to fail
    }
    
    // Go back online
    await context.setOffline(false);
    
    // Reload should work now
    await page.reload();
    await page.waitForSelector('text=Total Value', { timeout: 10000 });
    
  } finally {
    await browser.close();
  }
}

// Scenario 5: Browser refresh
async function testBrowserRefresh() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login and load portfolio
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Total Value', { timeout: 10000 });
    
    // Multiple refreshes
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForSelector('text=Total Value', { timeout: 10000 });
    }
    
    // Hard refresh
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('text=Total Value', { timeout: 10000 });
    
  } finally {
    await browser.close();
  }
}

// Scenario 6: Tab switching
async function testTabSwitching() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  try {
    // Open 3 tabs
    const tabs = [];
    for (let i = 0; i < 3; i++) {
      tabs.push(await context.newPage());
    }
    
    // Login in first tab
    await tabs[0].goto('https://sunbeam.capital/login');
    await tabs[0].fill('input[name="email"]', 'marc@minutevideos.com');
    await tabs[0].fill('input[name="password"]', '123456');
    await tabs[0].click('button[type="submit"]');
    await tabs[0].waitForSelector('text=Total Value', { timeout: 10000 });
    
    // Switch between tabs
    for (let i = 0; i < 5; i++) {
      const tabIndex = i % 3;
      const tab = tabs[tabIndex];
      
      await tab.bringToFront();
      
      if (tabIndex !== 0) {
        // Navigate other tabs
        await tab.goto('https://sunbeam.capital/');
        await tab.waitForSelector('text=Total Value', { timeout: 10000 });
      }
      
      await tab.waitForTimeout(1000);
    }
    
  } finally {
    await browser.close();
  }
}

// Scenario 7: Direct access
async function testDirectAccess() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  try {
    // Login first
    const loginPage = await context.newPage();
    await loginPage.goto('https://sunbeam.capital/login');
    await loginPage.fill('input[name="email"]', 'marc@minutevideos.com');
    await loginPage.fill('input[name="password"]', '123456');
    await loginPage.click('button[type="submit"]');
    await loginPage.waitForSelector('text=Total Value', { timeout: 10000 });
    await loginPage.close();
    
    // Direct access to different pages
    const urls = [
      'https://sunbeam.capital/',
      'https://sunbeam.capital/investor',
      'https://sunbeam.capital/report'
    ];
    
    for (const url of urls) {
      const page = await context.newPage();
      await page.goto(url);
      
      // Should have access
      const hasAuth = await page.locator('text=Sign out').isVisible();
      if (!hasAuth) throw new Error(`Not authenticated at ${url}`);
      
      await page.close();
    }
    
  } finally {
    await browser.close();
  }
}

// Scenario 8: Sleep/wake simulation
async function testSleepWake() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[name="email"]', 'marc@minutevideos.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Total Value', { timeout: 10000 });
    
    // Simulate sleep (long pause)
    await page.waitForTimeout(5000);
    
    // Simulate wake (trigger visibility change)
    await page.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('focus'));
    });
    
    // Wait a bit for any refresh to happen
    await page.waitForTimeout(2000);
    
    // Should still show portfolio
    const hasPortfolio = await page.locator('text=Total Value').isVisible();
    if (!hasPortfolio) throw new Error('Portfolio not visible after wake');
    
  } finally {
    await browser.close();
  }
}

// Run all tests
testRealWorldScenarios().catch(console.error);