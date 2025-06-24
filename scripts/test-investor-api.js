const fetch = require('node-fetch');

async function testInvestorAPI() {
  try {
    // First login as admin
    console.log('1. Logging in as admin...');
    const loginRes = await fetch('https://sunbeam.capital/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'marc@minutevideos.com',
        password: '123456'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login response:', loginData.success ? 'Success' : 'Failed');
    
    const cookies = loginRes.headers.get('set-cookie');
    
    // Get a test investor ID
    console.log('\n2. Getting investor list...');
    const usersRes = await fetch('https://sunbeam.capital/api/users-with-roles/', {
      headers: { 'Cookie': cookies || '' }
    });
    
    const usersData = await usersRes.json();
    const investors = usersData.users?.filter(u => u.isInvestor || u.account_number) || [];
    console.log(`Found ${investors.length} investors`);
    
    if (investors.length > 0) {
      const testInvestor = investors[0];
      console.log(`Testing with investor: ${testInvestor.email} (ID: ${testInvestor.id})`);
      
      // Test the investor standing API
      console.log('\n3. Testing investor standing API...');
      const standingRes = await fetch(`https://sunbeam.capital/api/investor/standing?viewAs=${testInvestor.id}`, {
        headers: { 'Cookie': cookies || '' }
      });
      
      console.log(`Response status: ${standingRes.status}`);
      const standingData = await standingRes.json();
      
      if (standingRes.ok) {
        console.log('Standing data:', JSON.stringify(standingData, null, 2));
      } else {
        console.log('Error:', standingData);
      }
      
      // Test the reports API
      console.log('\n4. Testing investor reports API...');
      const reportsRes = await fetch(`https://sunbeam.capital/api/investor/reports?viewAs=${testInvestor.id}`, {
        headers: { 'Cookie': cookies || '' }
      });
      
      console.log(`Response status: ${reportsRes.status}`);
      const reportsData = await reportsRes.json();
      
      if (reportsRes.ok) {
        console.log(`Reports: ${reportsData.reports?.length || 0} reports found`);
      } else {
        console.log('Error:', reportsData);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testInvestorAPI();