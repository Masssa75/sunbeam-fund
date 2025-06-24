const https = require('https');

async function checkProductionSession() {
  console.log('🔍 Checking production session API...\n');
  
  // First, get the session without auth
  console.log('1️⃣ Checking session without authentication:');
  
  const options1 = {
    hostname: 'sunbeam.capital',
    path: '/api/auth/session/',
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };
  
  await new Promise((resolve) => {
    https.get(options1, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('   Status:', res.statusCode);
        console.log('   Response:', data);
        resolve();
      });
    });
  });
  
  // Now, let's simulate a logged-in session
  console.log('\n2️⃣ Simulating logged-in session:');
  console.log('   First, logging in to get auth cookies...');
  
  const loginData = JSON.stringify({
    email: 'marc@minutevideos.com',
    password: '123456'
  });
  
  const loginOptions = {
    hostname: 'sunbeam.capital',
    path: '/api/auth/login/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };
  
  const cookies = await new Promise((resolve, reject) => {
    const req = https.request(loginOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('   Login status:', res.statusCode);
        if (res.statusCode === 200) {
          const setCookies = res.headers['set-cookie'];
          console.log('   Cookies received:', setCookies ? setCookies.length : 0);
          resolve(setCookies || []);
        } else {
          console.log('   Login failed:', data);
          resolve([]);
        }
      });
    });
    
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
  
  if (cookies.length > 0) {
    console.log('\n3️⃣ Checking session with authentication cookies:');
    
    const cookieString = cookies.map(c => c.split(';')[0]).join('; ');
    
    const options2 = {
      hostname: 'sunbeam.capital',
      path: '/api/auth/session/',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': cookieString
      }
    };
    
    await new Promise((resolve) => {
      https.get(options2, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('   Status:', res.statusCode);
          console.log('   Response:', data);
          
          try {
            const parsed = JSON.parse(data);
            console.log('\n📊 Session data analysis:');
            console.log('   - Authenticated:', parsed.authenticated);
            console.log('   - Has user:', !!parsed.user);
            console.log('   - Is admin:', parsed.isAdmin);
            console.log('   - User email:', parsed.user?.email);
          } catch (e) {
            console.log('   Failed to parse response');
          }
          
          resolve();
        });
      });
    });
  }
  
  console.log('\n✅ Check complete!');
}

checkProductionSession().catch(console.error);