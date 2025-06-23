const puppeteer = require('puppeteer')

async function testLiveLogin() {
  console.log('Testing live login on sunbeam.capital...\n')
  
  let browser
  try {
    // Launch browser
    console.log('1. Launching browser...')
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    })
    const page = await browser.newPage()
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log('   Browser console:', msg.text())
      }
    })
    
    // Go to login page
    console.log('\n2. Navigating to login page...')
    await page.goto('https://sunbeam.capital/login', { waitUntil: 'networkidle2' })
    
    // Fill login form
    console.log('\n3. Filling login form...')
    await page.type('input[type="email"]', 'marc@minutevideos.com')
    await page.type('input[type="password"]', '123456')
    
    // Click sign in
    console.log('\n4. Clicking sign in button...')
    await page.click('button[type="submit"]')
    
    // Wait for navigation or error
    console.log('\n5. Waiting for response...')
    try {
      await page.waitForNavigation({ timeout: 15000 })
      console.log('   ✅ Successfully redirected to:', page.url())
      
      // Check if we're on the home page
      if (page.url() === 'https://sunbeam.capital/') {
        console.log('\n6. Checking for portfolio content...')
        await page.waitForSelector('table', { timeout: 10000 })
        
        // Check if positions are visible
        const positions = await page.$$('tbody tr')
        console.log('   ✅ Found', positions.length, 'portfolio positions')
        
        // Get first position name
        if (positions.length > 0) {
          const firstPosition = await page.$eval('tbody tr:first-child td:first-child', el => el.textContent)
          console.log('   First position:', firstPosition)
        }
      }
    } catch (error) {
      // Check for error messages
      const errorText = await page.$eval('.bg-red-50', el => el.textContent).catch(() => null)
      if (errorText) {
        console.log('   ❌ Login error:', errorText)
      } else {
        console.log('   ❌ Login timeout or error:', error.message)
      }
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'login-error.png' })
      console.log('   Screenshot saved to login-error.png')
    }
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer')
  testLiveLogin()
} catch (e) {
  console.log('Puppeteer not installed. Testing with curl instead...\n')
  
  // Fallback to curl test
  const { exec } = require('child_process')
  exec('curl -s https://sunbeam.capital/ | grep -E "(Loading|Authentication|Portfolio)" | head -5', (error, stdout) => {
    console.log('Homepage content:')
    console.log(stdout || 'No matching content found')
  })
}