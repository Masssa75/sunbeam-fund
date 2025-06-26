const https = require('https');

async function testLogin() {
  console.log('Testing login API for marc@cyrator.com...\n');

  const loginData = JSON.stringify({
    email: 'marc@cyrator.com',
    password: '123456'
  });

  const options = {
    hostname: 'sunbeam.capital',
    path: '/api/auth/login/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log('Status Code:', res.statusCode);
      console.log('Headers:', res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\nResponse Body:', data);
        
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('\n✅ Login API working correctly!');
            console.log('User:', parsed.user?.email);
          } else {
            console.log('\n❌ Login failed');
          }
        } catch (e) {
          console.log('\n❌ Failed to parse response');
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    req.write(loginData);
    req.end();
  });
}

// Also test with marc@minutevideos.com
async function testAlternativeLogin() {
  console.log('\n\nTesting with marc@minutevideos.com...\n');

  const loginData = JSON.stringify({
    email: 'marc@minutevideos.com',
    password: '123456'
  });

  const options = {
    hostname: 'sunbeam.capital',
    path: '/api/auth/login/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log('Status Code:', res.statusCode);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response:', data);
        
        if (res.statusCode === 200) {
          console.log('\n✅ marc@minutevideos.com login works!');
        } else {
          console.log('\n❌ marc@minutevideos.com login failed too');
        }
        
        resolve();
      });
    });
    
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
}

async function main() {
  await testLogin();
  await testAlternativeLogin();
}

main().catch(console.error);