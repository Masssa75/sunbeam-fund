#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Header Authentication Display on sunbeam.capital\n');

async function testHeaderAuth() {
  let browser;
  try {
    // Launch browser
    console.log('1. Launching browser...');
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    // Enable console logging
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    // Test 1: Check header on homepage before login
    console.log('\n2. Testing header on homepage (not logged in)...');
    await page.goto('https://sunbeam.capital', { waitUntil: 'networkidle' });
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'header-test-1-homepage-not-logged-in.png'),
      fullPage: true 
    });
    
    // Check header content
    const headerText = await page.locator('.bg-white.shadow-sm').textContent();
    console.log('   Header content:', headerText.replace(/\s+/g, ' ').trim());
    
    // Check for "Loading..." state
    const loadingElement = await page.locator('text="Loading..."').count();
    if (loadingElement > 0) {
      console.log('   ⚠️  Header shows "Loading..." state');
    }

    // Test 2: Navigate to login and sign in
    console.log('\n3. Navigating to login page...');
    await page.goto('https://sunbeam.capital/login', { waitUntil: 'networkidle' });
    
    // Fill login form
    console.log('4. Filling login form...');
    await page.fill('input[type="email"]', 'marc@minutevideos.com');
    await page.fill('input[type="password"]', '123456');
    
    // Click sign in
    console.log('5. Clicking sign in...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation or error
    console.log('6. Waiting for login result...');
    try {
      await page.waitForURL('https://sunbeam.capital/', { timeout: 15000 });
      console.log('   ✅ Successfully redirected to homepage');
    } catch (e) {
      console.log('   ⚠️  Did not redirect to homepage');
      const currentUrl = page.url();
      console.log('   Current URL:', currentUrl);
    }

    // Wait a bit for header to update
    await page.waitForTimeout(3000);

    // Test 3: Check header after login
    console.log('\n7. Checking header after login...');
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'header-test-2-after-login.png'),
      fullPage: true 
    });
    
    // Check header content again
    const headerTextAfterLogin = await page.locator('.bg-white.shadow-sm').textContent();
    console.log('   Header content:', headerTextAfterLogin.replace(/\s+/g, ' ').trim());
    
    // Check if signed in text appears
    const signedInText = await page.locator('text="Signed in as:"').count();
    if (signedInText > 0) {
      // Be more specific - look for the email within the header
      const userEmail = await page.locator('.bg-white.shadow-sm .font-medium').first().textContent();
      console.log('   ✅ Header shows signed in as:', userEmail);
    } else {
      console.log('   ❌ Header does not show "Signed in as:" text');
    }
    
    // Check for "Loading..." state again
    const loadingAfterLogin = await page.locator('text="Loading..."').count();
    if (loadingAfterLogin > 0) {
      console.log('   ⚠️  Header still shows "Loading..." state after login');
    }

    // Test 4: Check authentication via browser console
    console.log('\n8. Checking authentication state via console...');
    const authState = await page.evaluate(async () => {
      try {
        // Check if supabase is available
        if (typeof window.supabase === 'undefined') {
          return { error: 'Supabase client not found in window' };
        }
        
        // Get session
        const { data: { session }, error } = await window.supabase.auth.getSession();
        if (error) {
          return { error: error.message };
        }
        
        return {
          hasSession: !!session,
          user: session?.user?.email || null,
          sessionExpiry: session?.expires_at || null
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('   Auth state from browser:', JSON.stringify(authState, null, 2));

    // Test 5: Check cookies
    console.log('\n9. Checking authentication cookies...');
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c => 
      c.name.includes('auth-token') || 
      c.name.includes('sb-') ||
      c.name.includes('supabase')
    );
    
    console.log('   Found', authCookies.length, 'auth-related cookies:');
    authCookies.forEach(cookie => {
      console.log(`   - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
    });

    // Test 6: Refresh page and check if auth persists
    console.log('\n10. Refreshing page to test auth persistence...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take screenshot after refresh
    await page.screenshot({ 
      path: path.join(__dirname, 'header-test-3-after-refresh.png'),
      fullPage: true 
    });
    
    // Check header one more time
    const headerTextAfterRefresh = await page.locator('.bg-white.shadow-sm').textContent();
    console.log('   Header content after refresh:', headerTextAfterRefresh.replace(/\s+/g, ' ').trim());

    // Final summary
    console.log('\n📊 Test Summary:');
    console.log('   - Screenshots saved to scripts/ directory');
    console.log('   - Check header-test-*.png files for visual verification');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testHeaderAuth();