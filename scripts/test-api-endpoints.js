const fetch = require('node-fetch');

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints\n');
  
  let cookies = '';
  
  // Test 1: Login as admin
  console.log('1️⃣ Login as Admin');
  console.log('------------------------');
  try {
    const loginResponse = await fetch('https://sunbeam.capital/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'claude.admin@sunbeam.capital',
        password: 'admin123456'
      })
    });
    
    console.log('   Status:', loginResponse.status);
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      cookies = setCookieHeader;
      console.log('✅ Got auth cookies');
    } else {
      console.log('❌ No cookies received');
    }
    
    const loginData = await loginResponse.json();
    console.log('   Response:', JSON.stringify(loginData, null, 2));
  } catch (error) {
    console.error('❌ Login failed:', error.message);
  }
  
  // Test 2: Check session
  console.log('\n2️⃣ Check Session');
  console.log('------------------------');
  try {
    const sessionResponse = await fetch('https://sunbeam.capital/api/auth/session/', {
      headers: { 'Cookie': cookies }
    });
    
    console.log('   Status:', sessionResponse.status);
    const sessionData = await sessionResponse.json();
    console.log('   Response:', JSON.stringify(sessionData, null, 2));
    
    if (sessionData.isAdmin) {
      console.log('✅ User recognized as admin');
    } else {
      console.log('❌ User NOT recognized as admin');
    }
  } catch (error) {
    console.error('❌ Session check failed:', error.message);
  }
  
  // Test 3: Access users endpoint
  console.log('\n3️⃣ Access /api/users/');
  console.log('------------------------');
  try {
    const usersResponse = await fetch('https://sunbeam.capital/api/users/', {
      headers: { 'Cookie': cookies }
    });
    
    console.log('   Status:', usersResponse.status);
    
    if (usersResponse.status === 200) {
      const usersData = await usersResponse.json();
      console.log('✅ Users endpoint accessible');
      console.log('   Found', usersData.users?.length || 0, 'users');
    } else {
      const errorData = await usersResponse.text();
      console.log('❌ Access denied');
      console.log('   Response:', errorData);
    }
  } catch (error) {
    console.error('❌ Users endpoint failed:', error.message);
  }
  
  // Test 4: Access investors endpoint
  console.log('\n4️⃣ Access /api/investors/');
  console.log('------------------------');
  try {
    const investorsResponse = await fetch('https://sunbeam.capital/api/investors/', {
      headers: { 'Cookie': cookies }
    });
    
    console.log('   Status:', investorsResponse.status);
    
    if (investorsResponse.status === 200) {
      const investorsData = await investorsResponse.json();
      console.log('✅ Investors endpoint accessible');
      console.log('   Found', investorsData.investors?.length || 0, 'investors');
    } else {
      const errorData = await investorsResponse.text();
      console.log('❌ Access denied');
      console.log('   Response:', errorData);
    }
  } catch (error) {
    console.error('❌ Investors endpoint failed:', error.message);
  }
  
  // Test 5: Test as non-admin (investor)
  console.log('\n5️⃣ Test as Investor (Non-Admin)');
  console.log('------------------------');
  try {
    const investorLoginResponse = await fetch('https://sunbeam.capital/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test.investor@sunbeam.capital',
        password: 'investor123456'
      })
    });
    
    const investorCookies = investorLoginResponse.headers.get('set-cookie') || '';
    
    // Try to access admin endpoints
    const investorUsersResponse = await fetch('https://sunbeam.capital/api/users/', {
      headers: { 'Cookie': investorCookies }
    });
    
    console.log('   Status for /api/users/:', investorUsersResponse.status);
    if (investorUsersResponse.status === 403 || investorUsersResponse.status === 401) {
      console.log('✅ Admin endpoints properly protected');
    } else {
      console.log('❌ Security issue: Investor can access admin endpoints');
    }
  } catch (error) {
    console.error('❌ Investor test failed:', error.message);
  }
}

testAPIEndpoints().catch(console.error);