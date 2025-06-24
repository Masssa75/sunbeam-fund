const https = require('https');

async function testSessionAPI() {
  console.log('🧪 Testing /api/auth/session/ endpoint');
  console.log('=====================================\n');
  
  // Test production
  console.log('1. Testing production API:');
  
  const options = {
    hostname: 'sunbeam.capital',
    path: '/api/auth/session/',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0'
    }
  };
  
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Response: ${data}`);
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('   Error:', error.message);
      resolve();
    });
    
    req.end();
  });
}

testSessionAPI().catch(console.error);