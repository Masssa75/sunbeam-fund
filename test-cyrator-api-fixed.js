const fetch = require('node-fetch');

async function testAPIs() {
  console.log('Testing API endpoints for marc@cyrator.com...\n');
  
  // First, get auth cookie by logging in
  console.log('1. Logging in...');
  const loginResponse = await fetch('https://sunbeam.capital/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'marc@cyrator.com',
      password: '123456'
    })
  });
  
  const cookies = loginResponse.headers.get('set-cookie');
  console.log('   Login response:', loginResponse.status);
  console.log('   Cookies received:', cookies ? 'Yes' : 'No');
  
  if (\!cookies) {
    console.log('Failed to get auth cookie');
    return;
  }
  
  const authCookie = cookies.split(';')[0];
  
  console.log('\n2. Testing /api/notifications/connection-status...');
  const connectionResponse = await fetch('https://sunbeam.capital/api/notifications/connection-status', {
    headers: { 'Cookie': authCookie }
  });
  console.log('   Status:', connectionResponse.status);
  const connectionData = await connectionResponse.json();
  console.log('   Response:', JSON.stringify(connectionData, null, 2));
  
  console.log('\n3. Testing /api/telegram/generate-token...');
  const tokenResponse = await fetch('https://sunbeam.capital/api/telegram/generate-token', {
    method: 'POST',
    headers: { 
      'Cookie': authCookie,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  console.log('   Status:', tokenResponse.status);
  const tokenData = await tokenResponse.json();
  console.log('   Response:', JSON.stringify(tokenData, null, 2));
}

testAPIs().catch(console.error);
