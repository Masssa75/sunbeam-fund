import { chromium } from 'playwright';

async function testRalphPortfolioValue() {
  console.log('Testing Ralph\'s portfolio value calculation...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    // Login as admin
    console.log('1. Logging in as admin...');
    await page.goto('https://sunbeam.capital/login');
    await page.fill('input[type="email"]', 'marc@cyrator.com');
    await page.fill('input[type="password"]', 'sunbeam2025');
    await page.click('button[type="submit"]');
    
    // Wait for navigation - just check for any navigation away from login
    await page.waitForTimeout(3000); // Give it time to redirect
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('Login failed - still on login page');
    }
    console.log(`✓ Logged in successfully - redirected to: ${currentUrl}\n`);
    
    // Go to investors page
    console.log('2. Navigating to investors page...');
    await page.goto('https://sunbeam.capital/admin/investors');
    await page.waitForSelector('text=Manage Users & Investors', { timeout: 10000 });
    
    // Debug: Take screenshot to see what's on the page
    await page.screenshot({ path: 'investors-page-debug.png', fullPage: true });
    
    // Wait for table to load and find Ralph's row
    console.log('3. Finding Ralph\'s investor details...');
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Try different ways to find Ralph
    const ralphCells = await page.locator('td:has-text("Ralph")').count();
    console.log(`Found ${ralphCells} cells with "Ralph"`);
    
    // Get all table rows for debugging
    const rows = await page.locator('tbody tr').count();
    console.log(`Total rows in table: ${rows}`);
    
    // Try to find Ralph's row - he might be listed differently
    let ralphRow = await page.locator('tr:has-text("Ralph")').first();
    if (await ralphRow.count() === 0) {
      // Try another approach
      ralphRow = await page.locator('tr').filter({ hasText: /ralph/i }).first();
    }
    
    if (await ralphRow.count() === 0) {
      console.log('Could not find Ralph\'s row. Checking all investor names...');
      const allNames = await page.locator('tbody tr td:nth-child(2)').allTextContents();
      console.log('All investor names:', allNames);
      throw new Error('Could not find Ralph in the investors table');
    }
    
    // Get the correct share percentage (might be in a different column)
    const cells = await ralphRow.locator('td').allTextContents();
    console.log('All cells in Ralph\'s row:', cells);
    
    // Find the share percentage (should contain %)
    const shareCell = cells.find(cell => cell.includes('%')) || cells[3];
    console.log(`Ralph's share: ${shareCell}\n`);
    
    // Click the three-dot menu first
    console.log('4. Opening actions menu for Ralph...');
    await ralphRow.locator('button[aria-label="Actions"]').click();
    await page.waitForTimeout(500); // Wait for menu to open
    
    // Then click View as investor
    console.log('5. Clicking "View as investor"...');
    await page.locator('button:has-text("View as investor")').click();
    
    // Wait for investor view to load
    await page.waitForURL('**/investor**', { timeout: 10000 });
    await page.waitForSelector('text=Current Standing', { timeout: 10000 });
    
    // Get the displayed portfolio value
    console.log('6. Getting displayed portfolio value...');
    
    // Check if there's a warning about price data
    const warningElement = await page.locator('text=Unable to fetch current market prices');
    if (await warningElement.count() > 0) {
      console.log('✅ Warning message is displayed about price data being unavailable');
    }
    
    // Look for the current value display
    const currentValueLabel = await page.locator('text=Current Value').first();
    const currentValueContainer = await currentValueLabel.locator('..'); // Get parent
    const displayedValue = await currentValueContainer.textContent();
    console.log(`Current value section shows: ${displayedValue}\n`);
    
    // Also check if there's a total fund value shown
    const totalFundElement = await page.locator('text=Total Fund Value');
    if (await totalFundElement.count() > 0) {
      const totalValue = await totalFundElement.locator('..').textContent();
      console.log(`Total fund value (if shown): ${totalValue}`);
    }
    
    // Try to extract the actual numbers
    const valueMatch = displayedValue.match(/\$?([\d,]+(?:\.\d{2})?)/);
    if (valueMatch) {
      const numericValue = parseFloat(valueMatch[1].replace(/,/g, ''));
      console.log(`\n--- CALCULATION CHECK ---`);
      console.log(`Ralph's displayed value: $${numericValue.toLocaleString()}`);
      console.log(`Ralph's share: ${shareText}`);
      
      // If we assume total fund is ~114K
      const expectedValue = 114000 * 0.38;
      console.log(`Expected value (38% of $114K): $${expectedValue.toLocaleString()}`);
      console.log(`Difference: $${(expectedValue - numericValue).toLocaleString()}`);
      
      // Calculate what total fund value this implies
      const impliedTotal = numericValue / 0.38;
      console.log(`\nImplied total fund value: $${impliedTotal.toLocaleString()}`);
    }
    
    // Take screenshot for evidence
    await page.screenshot({ path: 'ralph-portfolio-value.png', fullPage: true });
    console.log('\n✓ Screenshot saved as ralph-portfolio-value.png');
    
    // Check the API endpoint directly
    console.log('\n7. Checking API endpoint for investor standing...');
    
    // Get Ralph's user ID from the URL
    const url = page.url();
    const viewAsMatch = url.match(/viewAs=([^&]+)/);
    if (viewAsMatch) {
      const ralphUserId = viewAsMatch[1];
      console.log(`Ralph's user ID: ${ralphUserId}`);
      
      // Make API request
      const apiResponse = await page.evaluate(async (userId) => {
        const response = await fetch(`/api/investor/standing?viewAs=${userId}`, {
          credentials: 'include'
        });
        return await response.json();
      }, ralphUserId);
      
      console.log('\nAPI Response:', JSON.stringify(apiResponse, null, 2));
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testRalphPortfolioValue().catch(console.error);