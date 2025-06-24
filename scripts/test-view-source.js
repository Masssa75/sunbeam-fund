const https = require('https');

async function testViewSource() {
  console.log('🧪 Checking Production Page Source');
  console.log('==================================\n');
  
  const options = {
    hostname: 'sunbeam.capital',
    path: '/',
    method: 'GET',
    headers: {
      'Accept': 'text/html,application/xhtml+xml',
      'User-Agent': 'Mozilla/5.0'
    }
  };
  
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Look for nav element
        const navMatch = data.match(/<nav[^>]*>(.*?)<\/nav>/s);
        if (navMatch) {
          console.log('\nNav element found:');
          console.log(navMatch[0].substring(0, 500));
        } else {
          console.log('\nNo nav element found in HTML');
        }
        
        // Look for Navigation or HeaderSimplified references
        const hasNavigation = data.includes('Navigation');
        const hasHeaderSimplified = data.includes('HeaderSimplified');
        
        console.log('\nComponent references:');
        console.log('- Contains "Navigation":', hasNavigation);
        console.log('- Contains "HeaderSimplified":', hasHeaderSimplified);
        
        // Check for specific text
        console.log('\nText checks:');
        console.log('- Contains "Sunbeam Fund":', data.includes('Sunbeam Fund'));
        console.log('- Contains "Portfolio":', data.includes('Portfolio'));
        console.log('- Contains "Manage Investors":', data.includes('Manage Investors'));
        
        // Save first 2000 chars to file for inspection
        const fs = require('fs');
        fs.writeFileSync('production-source.html', data.substring(0, 2000));
        console.log('\nFirst 2000 chars saved to production-source.html');
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('Error:', error.message);
      resolve();
    });
    
    req.end();
  });
}

testViewSource().catch(console.error);