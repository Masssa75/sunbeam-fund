const puppeteer = require('puppeteer');

async function testLiveSite() {
  console.log('Testing live site authentication and API...\n');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    
    // Go to test-auth page
    console.log('1. Navigating to test-auth page...');
    await page.goto('https://sunbeam.capital/test-auth', { waitUntil: 'networkidle2' });
    
    // Check page content
    const title = await page.$eval('h1', el => el.textContent);
    console.log('   Page title:', title);
    
    // Check session status
    const sessionText = await page.$eval('p', el => el.textContent);
    console.log('   Session status:', sessionText);
    
    // Sign in
    console.log('\n2. Clicking sign in button...');
    await page.click('button.bg-blue-500');
    await page.waitForTimeout(3000); // Wait for auth
    
    // Check session again
    const sessionText2 = await page.$eval('p', el => el.textContent);
    console.log('   Session status after sign in:', sessionText2);
    
    // Click Test API
    console.log('\n3. Clicking Test API button...');
    await page.click('button.bg-green-500');
    await page.waitForTimeout(2000); // Wait for API call
    
    // Get API response
    const apiResponse = await page.evaluate(() => {
      const responseDiv = document.querySelector('.bg-gray-100');
      return responseDiv ? responseDiv.textContent : 'No response div found';
    });
    console.log('   API Response:', apiResponse);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  testLiveSite();
} catch (e) {
  console.log('Puppeteer not installed. Installing...');
  const { execSync } = require('child_process');
  execSync('npm install puppeteer', { stdio: 'inherit' });
  console.log('Please run the script again.');
}