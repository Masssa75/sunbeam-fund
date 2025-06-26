const https = require('https');

async function debugLogin() {
  console.log('Debugging login issue for marc@cyrator.com...\n');

  // First, let's check if the deployment has the latest code
  console.log('1. Checking deployment status...');
  
  const deployOptions = {
    hostname: 'sunbeam.capital',
    path: '/api/auth/login/',
    method: 'GET',
    headers: {}
  };

  await new Promise((resolve) => {
    const req = https.request(deployOptions, (res) => {
      console.log('GET /api/auth/login/ status:', res.statusCode);
      console.log('Should return 405 (Method Not Allowed) for GET requests\n');
      resolve();
    });
    req.on('error', (e) => console.error('Error:', e));
    req.end();
  });

  // Now test the actual login
  console.log('2. Testing login with correct credentials...');
  
  const loginData = JSON.stringify({
    email: 'marc@cyrator.com',
    password: '123456'
  });

  const loginOptions = {
    hostname: 'sunbeam.capital',
    path: '/api/auth/login/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  };

  const loginResult = await new Promise((resolve) => {
    const req = https.request(loginOptions, (res) => {
      let data = '';
      
      console.log('Status Code:', res.statusCode);
      console.log('Headers:', JSON.stringify(res.headers, null, 2));
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\nResponse Body:', data);
        
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          console.log('Failed to parse response');
          resolve(null);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      resolve(null);
    });
    
    req.write(loginData);
    req.end();
  });

  // Test with wrong password to see the error
  console.log('\n3. Testing with wrong password to compare error messages...');
  
  const wrongLoginData = JSON.stringify({
    email: 'marc@cyrator.com',
    password: 'wrongpassword'
  });

  const wrongLoginOptions = {
    hostname: 'sunbeam.capital',
    path: '/api/auth/login/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': wrongLoginData.length
    }
  };

  await new Promise((resolve) => {
    const req = https.request(wrongLoginOptions, (res) => {
      let data = '';
      
      console.log('Status Code:', res.statusCode);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response:', data);
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      resolve();
    });
    
    req.write(wrongLoginData);
    req.end();
  });

  // Check if it's a UI issue
  console.log('\n4. Common issues to check:');
  console.log('- Clear browser cache and cookies');
  console.log('- Try incognito/private browsing mode');
  console.log('- Check if password manager is auto-filling wrong password');
  console.log('- Ensure no extra spaces in email or password fields');
  
  if (loginResult && loginResult.success) {
    console.log('\n✅ API is working correctly! The issue might be browser-specific.');
    console.log('\nTry this test URL to verify your password:');
    console.log('https://sunbeam.capital/api/auth/login/');
    console.log('POST with: {"email":"marc@cyrator.com","password":"123456"}');
  }
}

debugLogin().catch(console.error);