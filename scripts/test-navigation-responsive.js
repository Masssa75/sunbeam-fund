const { chromium } = require('playwright');

async function testNavigationResponsive() {
  console.log('Testing navigation at different screen sizes...\n');
  
  const browser = await chromium.launch({
    headless: false,  // Show browser window
    slowMo: 500,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 720 }
  ];
  
  for (const viewport of viewports) {
    console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);
    
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    
    await page.goto('https://sunbeam.capital', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check visible navigation items
    const navLinks = [
      'Portfolio',
      'Manage Investors', 
      'Reports',
      'Preview Investor View'
    ];
    
    console.log('Checking navigation links:');
    for (const linkText of navLinks) {
      const isVisible = await page.locator(`text="${linkText}"`).isVisible().catch(() => false);
      console.log(`  ${linkText}: ${isVisible ? '✓ Visible' : '✗ Hidden'}`);
    }
    
    // Check for hamburger menu
    const hasHamburger = await page.locator('button:has-text("menu")').count() > 0;
    console.log(`  Hamburger menu: ${hasHamburger ? '✓ Present' : '✗ Missing'}`);
    
    await page.screenshot({ path: `navigation-${viewport.name.toLowerCase()}.png` });
    
    await context.close();
  }
  
  console.log('\n✅ Responsive test complete!');
  await browser.close();
}

testNavigationResponsive().catch(console.error);