const https = require('https');
const { parse } = require('url');

// Test credentials
const email = 'marc@minutevideos.com';
const password = '123456';

// Function to make HTTPS request
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ 
        statusCode: res.statusCode, 
        headers: res.headers, 
        data,
        cookies: res.headers['set-cookie'] || []
      }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function testLoginFlow() {
  console.log('Testing login flow on production...\n');

  try {
    // Step 1: Login
    console.log('1. Attempting login...');
    const loginData = JSON.stringify({ email, password });
    const loginResult = await makeRequest({
      hostname: 'sunbeam.capital',
      path: '/api/auth/login/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    }, loginData);

    console.log('   Status:', loginResult.statusCode);
    console.log('   Response:', loginResult.data);
    console.log('   Cookies set:', loginResult.cookies.length);
    
    // Extract cookies
    const cookies = loginResult.cookies.map(c => c.split(';')[0]).join('; ');
    console.log('   Cookie string:', cookies.substring(0, 100) + '...\n');

    // Step 2: Test /api/positions/ with cookies
    console.log('2. Testing /api/positions/ with auth cookies...');
    const positionsResult = await makeRequest({
      hostname: 'sunbeam.capital',
      path: '/api/positions/',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    console.log('   Status:', positionsResult.statusCode);
    const positions = JSON.parse(positionsResult.data);
    console.log('   Positions returned:', positions.length);
    if (positions.length > 0) {
      console.log('   First position:', positions[0].project_name);
    }
    console.log('');

    // Step 3: Test /api/auth/session with cookies
    console.log('3. Testing /api/auth/session...');
    const sessionResult = await makeRequest({
      hostname: 'sunbeam.capital',
      path: '/api/auth/session/',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    console.log('   Status:', sessionResult.statusCode);
    console.log('   Session data:', sessionResult.data);

  } catch (error) {
    console.error('Error:', error);
  }
}

testLoginFlow();
