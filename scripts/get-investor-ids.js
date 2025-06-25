const fetch = require('node-fetch');

async function getInvestorIds() {
  try {
    // Login first
    const loginResponse = await fetch('https://sunbeam.capital/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'marc@minutevideos.com',
        password: '123456'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData.success);

    // Extract session from cookies
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Get investors
    const investorsResponse = await fetch('https://sunbeam.capital/api/investors/', {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (!investorsResponse.ok) {
      throw new Error(`Failed to fetch investors: ${investorsResponse.status} ${investorsResponse.statusText}`);
    }

    const data = await investorsResponse.json();
    console.log('\n📋 Investors with IDs:');
    console.log('Total investors:', data.investors?.length || 0);
    
    if (data.investors) {
      data.investors.forEach(inv => {
        console.log(`\n- Name: ${inv.name || inv.email}`);
        console.log(`  Email: ${inv.email}`);
        console.log(`  ID: ${inv.user_id}`);
        console.log(`  Account: ${inv.account_number}`);
        console.log(`  Share: ${inv.share_percentage}%`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getInvestorIds();