import fetch from 'node-fetch';

async function testRalphPortfolioAPI() {
  try {
    // First login as admin
    console.log('1. Logging in as admin...');
    const loginRes = await fetch('https://sunbeam.capital/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'marc@cyrator.com',
        password: 'sunbeam2025'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login response:', loginData.success ? 'Success' : 'Failed');
    
    const cookies = loginRes.headers.get('set-cookie');
    
    // Get Ralph's investor ID
    console.log('\n2. Getting investor list to find Ralph...');
    const usersRes = await fetch('https://sunbeam.capital/api/users-with-roles/', {
      headers: { 'Cookie': cookies || '' }
    });
    
    const usersData = await usersRes.json();
    const ralph = usersData.users?.find(u => u.email === 'ralphpetersigg@gmail.com');
    
    if (!ralph) {
      console.log('Could not find Ralph in investors list');
      return;
    }
    
    console.log(`Found Ralph: ${ralph.name} (${ralph.share_percentage}% share)`);
    
    // Test the investor standing API for Ralph
    console.log('\n3. Testing investor standing API for Ralph...');
    const standingRes = await fetch(`https://sunbeam.capital/api/investor/standing?viewAs=${ralph.id}`, {
      headers: { 'Cookie': cookies || '' }
    });
    
    console.log(`Response status: ${standingRes.status}`);
    const standingData = await standingRes.json();
    
    if (standingRes.ok && standingData.data) {
      const data = standingData.data;
      console.log('\n--- RALPH\'S PORTFOLIO ---');
      console.log(`Total Fund Value: $${data.fundTotalCurrentValue?.toLocaleString() || 'N/A'}`);
      console.log(`Ralph's Share (${data.sharePercentage}%): $${data.currentValue?.toLocaleString() || 'N/A'}`);
      console.log(`Ralph's Initial Investment: $${data.initialInvestment?.toLocaleString() || 'N/A'}`);
      console.log(`Ralph's P&L: $${data.profitLoss?.toLocaleString() || 'N/A'} (${data.profitLossPercentage}%)`);
      
      // Check if using fallback
      if (data.fundTotalCurrentValue === 100000) {
        console.log('\n⚠️  WARNING: Using $100K fallback value!');
        console.log('This explains why Ralph shows $38,340 instead of expected value');
        
        // Calculate what it should be with $114K
        const correctValue = 114000 * (data.sharePercentage / 100);
        console.log(`\nWith actual $114K portfolio, Ralph should have: $${correctValue.toLocaleString()}`);
        console.log(`Difference: $${(correctValue - data.currentValue).toLocaleString()}`);
      }
      
      // Show position details if available
      if (data.positions) {
        console.log(`\nPositions with prices: ${data.positionsWithPrices}/${data.nonCustomPositions}`);
        console.log(`Success rate: ${((data.positionsWithPrices / data.nonCustomPositions) * 100).toFixed(1)}%`);
      }
    } else {
      console.log('Error:', standingData);
    }
    
    // Also check raw positions to understand pricing
    console.log('\n4. Checking raw positions data...');
    const positionsRes = await fetch(`https://sunbeam.capital/api/positions?viewAs=${ralph.id}`, {
      headers: { 'Cookie': cookies || '' }
    });
    
    const positions = await positionsRes.json();
    
    let totalWithPrices = 0;
    let totalCustom = 0;
    let missingPrices = [];
    
    positions.forEach(pos => {
      if (pos.project_id.startsWith('custom-')) {
        totalCustom += pos.cost_basis;
      } else if (pos.current_price) {
        totalWithPrices += pos.current_price * pos.amount;
      } else {
        missingPrices.push(pos.project_name);
      }
    });
    
    console.log(`\nTotal value (positions with prices): $${totalWithPrices.toLocaleString()}`);
    console.log(`Total value (custom positions): $${totalCustom.toLocaleString()}`);
    console.log(`Grand total: $${(totalWithPrices + totalCustom).toLocaleString()}`);
    
    if (missingPrices.length > 0) {
      console.log(`\nPositions missing prices: ${missingPrices.join(', ')}`);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRalphPortfolioAPI();