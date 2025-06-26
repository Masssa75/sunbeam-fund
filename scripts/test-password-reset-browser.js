import { chromium } from 'playwright';

async function testPasswordResetBrowser() {
  console.log('Testing password reset through browser...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to login page
    console.log('1. Going to login page...');
    await page.goto('https://sunbeam.capital/login');
    await page.waitForLoadState('networkidle');
    
    // Click "Forgot your password?"
    console.log('2. Clicking "Forgot your password?" link...');
    await page.click('text=Forgot your password?');
    
    // Wait for form to change
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({ path: 'password-reset-form.png', fullPage: true });
    console.log('📸 Screenshot saved: password-reset-form.png');
    
    // Fill in email
    console.log('3. Entering email address...');
    await page.fill('input[type="email"]', 'marc@cyrator.com');
    
    // Submit form
    console.log('4. Submitting password reset request...');
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Take final screenshot
    await page.screenshot({ path: 'password-reset-result.png', fullPage: true });
    console.log('📸 Screenshot saved: password-reset-result.png');
    
    // Check for success or error message
    const greenMessage = await page.locator('.bg-green-50').count();
    const redMessage = await page.locator('.bg-red-50').count();
    
    if (greenMessage > 0) {
      const message = await page.locator('.bg-green-50').textContent();
      console.log('\n✅ Success:', message);
    } else if (redMessage > 0) {
      const message = await page.locator('.bg-red-50').textContent();
      console.log('\n❌ Error:', message);
    } else {
      console.log('\n⚠️  No clear success or error message');
    }
    
    // Also check console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
  } catch (error) {
    console.error('Test error:', error.message);
    await page.screenshot({ path: 'password-reset-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
  
  console.log('\n5. Email delivery notes for paid tier:');
  console.log('- No rate limits on paid tier');
  console.log('- Check spam/junk folder');
  console.log('- Email from: noreply@mail.app.supabase.io');
  console.log('- Subject: "Reset Your Password"');
  console.log('\nIf still not receiving emails, configure custom SMTP in Supabase dashboard.');
}

testPasswordResetBrowser().catch(console.error);