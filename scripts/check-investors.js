const fetch = require('node-fetch');

async function checkInvestors() {
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
    console.log('Login response:', loginData);

    // Extract session from cookies
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Get users with roles
    const usersResponse = await fetch('https://sunbeam.capital/api/users-with-roles/', {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (!usersResponse.ok) {
      throw new Error(`Failed to fetch users: ${usersResponse.status} ${usersResponse.statusText}`);
    }

    const data = await usersResponse.json();
    console.log('\n📋 All Users:');
    console.log('Total users:', data.users?.length || 0);
    
    if (data.users) {
      const investors = data.users.filter(u => u.isInvestor || u.account_number);
      console.log('\n💰 Investors:', investors.length);
      investors.forEach(inv => {
        console.log(`  - ${inv.email} (${inv.name || 'No name'}) - Account: ${inv.account_number || 'N/A'}`);
      });
      
      const admins = data.users.filter(u => u.isAdmin);
      console.log('\n👑 Admins:', admins.length);
      admins.forEach(admin => {
        console.log(`  - ${admin.email}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkInvestors();