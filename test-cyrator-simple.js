const fetch = require('node-fetch');

async function test() {
  // Login as marc@cyrator.com
  const loginRes = await fetch('https://sunbeam.capital/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'marc@cyrator.com',
      password: '123456'
    })
  });
  
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Login status:', loginRes.status);
  
  if (cookies) {
    const cookie = cookies.split(';')[0];
    
    // Test generate token
    const tokenRes = await fetch('https://sunbeam.capital/api/telegram/generate-token', {
      method: 'POST',
      headers: { 
        'Cookie': cookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    console.log('Token API status:', tokenRes.status);
    const data = await tokenRes.json();
    console.log('Token response:', data);
  }
}

test().catch(console.error);