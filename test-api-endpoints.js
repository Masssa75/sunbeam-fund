const fetch = require('node-fetch');

async function testAPIs() {
  console.log('Testing API endpoints...\n');
  
  // First, get auth cookie by logging in
  console.log('1. Logging in to get auth cookie...');
  const loginResponse = await fetch('https://sunbeam.capital/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'marc@minutevideos.com',
      password: '123456'
    })
  });
  
  const cookies = loginResponse.headers.get('set-cookie');
  console.log('   Login response:', loginResponse.status);
  console.log('   Cookies received:', cookies ? 'Yes' : 'No');
  
  if (!cookies) {
    console.log('❌ Failed to get auth cookie');
    return;
  }
  
  // Extract the auth cookie
  const authCookie = cookies.split(';')[0];
  
  // Test the notification APIs
  console.log('\n2. Testing /api/notifications/recent-alerts...');
  const alertsResponse = await fetch('https://sunbeam.capital/api/notifications/recent-alerts', {
    headers: { 'Cookie': authCookie }
  });
  console.log('   Status:', alertsResponse.status);
  if (alertsResponse.ok) {
    const data = await alertsResponse.json();
    console.log('   Response:', JSON.stringify(data, null, 2));
  } else {
    console.log('   Error:', await alertsResponse.text());
  }
  
  console.log('\n3. Testing /api/notifications/connection-status...');
  const connectionResponse = await fetch('https://sunbeam.capital/api/notifications/connection-status', {
    headers: { 'Cookie': authCookie }
  });
  console.log('   Status:', connectionResponse.status);
  if (connectionResponse.ok) {
    const data = await connectionResponse.json();
    console.log('   Response:', JSON.stringify(data, null, 2));
  } else {
    console.log('   Error:', await connectionResponse.text());
  }
  
  console.log('\n4. Testing /api/telegram/generate-token...');
  const tokenResponse = await fetch('https://sunbeam.capital/api/telegram/generate-token', {
    method: 'POST',
    headers: { 
      'Cookie': authCookie,
      'Content-Type': 'application/json'
    }
  });
  console.log('   Status:', tokenResponse.status);
  if (tokenResponse.ok) {
    const data = await tokenResponse.json();
    console.log('   Response:', JSON.stringify(data, null, 2));
  } else {
    console.log('   Error:', await tokenResponse.text());
  }
}

testAPIs().catch(console.error);