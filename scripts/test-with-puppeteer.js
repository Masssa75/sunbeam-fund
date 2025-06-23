const puppeteer = require('puppeteer');

async function testActualWebsite() {
  console.log('Testing ACTUAL website with browser automation...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 1. Go to homepage
    console.log('1. Navigating to https://sunbeam.capital...');
    await page.goto('https://sunbeam.capital', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait a bit for React to render
    await page.waitForTimeout(3000);
    
    // Check what's displayed
    const pageContent = await page.content();
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    console.log('   Page loaded. Checking content...');
    
    if (bodyText.includes('Loading Portfolio...')) {
      console.log('   ❌ STILL SHOWING: Loading Portfolio...');
    } else if (bodyText.includes('Authentication Required')) {
      console.log('   ✅ Correctly showing: Authentication Required');
    } else {
      console.log('   Page shows:', bodyText.substring(0, 200) + '...');
    }
    
    // 2. Try to find login link/button
    console.log('\n2. Looking for login button...');
    const loginButton = await page.$('a[href="/login"]');
    if (loginButton) {
      console.log('   ✅ Found login link');
      
      // 3. Click login
      console.log('\n3. Clicking login link...');
      await loginButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // 4. Fill login form
      console.log('\n4. Filling login form...');
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      await page.type('input[type="email"]', 'marc@minutevideos.com');
      await page.type('input[type="password"]', '123456');
      
      // 5. Submit form
      console.log('\n5. Submitting login form...');
      await page.click('button[type="submit"]');
      
      // Wait for navigation or error
      await page.waitForTimeout(5000);
      
      // Check result
      const afterLoginText = await page.evaluate(() => document.body.innerText);
      
      if (afterLoginText.includes('Portfolio Overview')) {
        console.log('   ✅ SUCCESS! Portfolio is displayed');
      } else if (afterLoginText.includes('Loading Portfolio...')) {
        console.log('   ❌ FAIL: Still showing Loading Portfolio...');
      } else if (afterLoginText.includes('Processing...')) {
        console.log('   ⚠️  Login still processing...');
      } else {
        console.log('   Result:', afterLoginText.substring(0, 200) + '...');
      }
      
    } else {
      console.log('   ❌ No login button found');
    }
    
  } catch (error) {
    console.error('Error during test:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  testActualWebsite();
} catch(e) {
  console.log('Puppeteer not installed. Installing...');
  const { execSync } = require('child_process');
  execSync('npm install puppeteer', { stdio: 'inherit' });
  console.log('\nPuppeteer installed. Please run this script again.');
}