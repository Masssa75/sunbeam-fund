const https = require('https');
const { parse } = require('url');

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

async function testProductionLogin() {
  console.log('Testing production login flow...\n');

  try {
    // 1. Get initial page to see if we're authenticated
    console.log('1. Checking initial auth state...');
    const homeResult = await makeRequest({
      hostname: 'sunbeam.capital',
      path: '/',
      method: 'GET'
    });

    console.log('   Status:', homeResult.statusCode);
    
    // Check if the page contains "Loading Portfolio..." or "Authentication Required"
    const pageContent = homeResult.data;
    if (pageContent.includes('Loading Portfolio')) {
      console.log('   Page shows: Loading Portfolio...');
    } else if (pageContent.includes('Authentication Required')) {
      console.log('   Page shows: Authentication Required');
    } else if (pageContent.includes('Portfolio Overview')) {
      console.log('   Page shows: Portfolio Overview (authenticated)');
    } else if (pageContent.includes('Sunbeam Fund Management')) {
      console.log('   Page shows: Sunbeam Fund Management (main title)');
      // Check for specific components
      if (pageContent.includes('PortfolioTableWithPrices')) {
        console.log('   Contains: PortfolioTableWithPrices component');
      }
      // Show a snippet of the body content
      const bodyStart = pageContent.indexOf('<body');
      const bodyEnd = pageContent.indexOf('</body>');
      if (bodyStart > -1 && bodyEnd > -1) {
        const bodyContent = pageContent.substring(bodyStart, Math.min(bodyStart + 500, bodyEnd));
        console.log('   Body snippet:', bodyContent.replace(/\s+/g, ' ').substring(0, 200) + '...');
      }
    }

    // 2. Test the session API directly
    console.log('\n2. Testing /api/auth/session/...');
    const sessionResult = await makeRequest({
      hostname: 'sunbeam.capital',
      path: '/api/auth/session/',
      method: 'GET'
    });

    console.log('   Status:', sessionResult.statusCode);
    const sessionData = JSON.parse(sessionResult.data);
    console.log('   Authenticated:', sessionData.authenticated);
    console.log('   User:', sessionData.user?.email || 'None');

    // 3. Test positions API
    console.log('\n3. Testing /api/positions/...');
    const positionsResult = await makeRequest({
      hostname: 'sunbeam.capital',
      path: '/api/positions/',
      method: 'GET'
    });

    console.log('   Status:', positionsResult.statusCode);
    try {
      const positions = JSON.parse(positionsResult.data);
      console.log('   Positions returned:', positions.length);
    } catch (e) {
      console.log('   Response:', positionsResult.data.substring(0, 100) + '...');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testProductionLogin();