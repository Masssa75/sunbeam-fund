const { chromium } = require('playwright');

async function testInvestorFunctionality() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🧪 Testing Investor Functionality\n');
    
    // Step 1: Login as admin
    console.log('1️⃣ Login as Admin');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'claude.admin@sunbeam.capital');
    await page.fill('input[type="password"]', 'admin123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('https://sunbeam.capital/', { timeout: 10000 });
    console.log('✅ Logged in\n');
    
    // Step 2: Test API directly
    console.log('2️⃣ Test API Endpoints via Browser');
    
    // Test users endpoint
    const usersResponse = await page.evaluate(async () => {
      const response = await fetch('/api/users/');
      return {
        status: response.status,
        data: await response.json()
      };
    });
    
    console.log('   /api/users/ response:');
    console.log('   Status:', usersResponse.status);
    console.log('   Users count:', usersResponse.data.users?.length || 0);
    
    if (usersResponse.data.users && usersResponse.data.users.length > 0) {
      console.log('   First few users:');
      usersResponse.data.users.slice(0, 3).forEach(u => {
        console.log(`     - ${u.email} (${u.account_number ? 'Investor' : 'Not investor'})`);
      });
    }
    
    // Test investors endpoint
    const investorsResponse = await page.evaluate(async () => {
      const response = await fetch('/api/investors/');
      return {
        status: response.status,
        data: await response.json()
      };
    });
    
    console.log('\n   /api/investors/ response:');
    console.log('   Status:', investorsResponse.status);
    console.log('   Investors count:', investorsResponse.data.investors?.length || 0);
    
    if (investorsResponse.data.investors && investorsResponse.data.investors.length > 0) {
      console.log('   Investors:');
      investorsResponse.data.investors.forEach(inv => {
        console.log(`     - ${inv.name} (${inv.email}) - ${inv.share_percentage}%`);
      });
    }
    
    // Step 3: Navigate to investors page and check console errors
    console.log('\n3️⃣ Navigate to Investors Page');
    
    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('   ❌ Console error:', msg.text());
      }
    });
    
    await page.goto('https://sunbeam.capital/admin/investors');
    await page.waitForLoadState('networkidle');
    
    // Check page content
    const pageContent = await page.evaluate(() => {
      const investorRows = document.querySelectorAll('tbody tr');
      const hasNoInvestorsMessage = document.body.textContent.includes('No investors yet');
      const hasNoUsersMessage = document.body.textContent.includes('No non-investor users');
      
      return {
        investorRowCount: investorRows.length,
        hasNoInvestorsMessage,
        hasNoUsersMessage,
        pageUrl: window.location.href
      };
    });
    
    console.log('   Page analysis:');
    console.log('   - URL:', pageContent.pageUrl);
    console.log('   - Investor rows:', pageContent.investorRowCount);
    console.log('   - Shows "No investors yet":', pageContent.hasNoInvestorsMessage);
    console.log('   - Shows "No non-investor users":', pageContent.hasNoUsersMessage);
    
    // Step 4: Try creating a test user and converting to investor
    console.log('\n4️⃣ Test User Creation (if needed)');
    
    if (usersResponse.data.users && usersResponse.data.users.length > 0) {
      const nonInvestorUser = usersResponse.data.users.find(u => !u.account_number);
      
      if (nonInvestorUser) {
        console.log(`   Found non-investor user: ${nonInvestorUser.email}`);
        console.log('   Would click "Make Investor" button here');
      } else {
        console.log('   All users are already investors');
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-investor-functionality.png' });
    console.log('\n📸 Screenshot saved: test-investor-functionality.png');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-investor-error.png' });
  } finally {
    await browser.close();
  }
}

testInvestorFunctionality().catch(console.error);