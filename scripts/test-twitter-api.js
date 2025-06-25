const fetch = require('node-fetch');

async function testTwitterAPI() {
  console.log('🔍 Testing Twitter API endpoints...\n');
  
  try {
    // Test without authentication first
    console.log('1. Testing /api/twitter/tweets without auth...');
    const noAuthResponse = await fetch('https://sunbeam.capital/api/twitter/tweets');
    console.log('Status:', noAuthResponse.status);
    console.log('Response:', await noAuthResponse.text());
    console.log('');
    
    // Test with login
    console.log('2. Logging in...');
    const loginResponse = await fetch('https://sunbeam.capital/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'marc@minutevideos.com', password: '123456' })
    });
    
    const loginCookies = loginResponse.headers.get('set-cookie');
    console.log('Login status:', loginResponse.status);
    console.log('Has cookies:', !!loginCookies);
    console.log('');
    
    // Test session endpoint
    console.log('3. Testing session endpoint...');
    const sessionResponse = await fetch('https://sunbeam.capital/api/auth/session', {
      headers: { 'Cookie': loginCookies || '' }
    });
    
    const sessionData = await sessionResponse.json();
    console.log('Session data:', sessionData);
    console.log('');
    
    // Test tweets with auth
    console.log('4. Testing tweets endpoint with auth...');
    const tweetsResponse = await fetch('https://sunbeam.capital/api/twitter/tweets', {
      headers: { 'Cookie': loginCookies || '' }
    });
    
    console.log('Tweets status:', tweetsResponse.status);
    const tweetsData = await tweetsResponse.text();
    console.log('Tweets response:', tweetsData);
    
    if (tweetsResponse.ok) {
      try {
        const parsed = JSON.parse(tweetsData);
        console.log('Number of tweets:', parsed.tweets?.length || 0);
        if (parsed.tweets?.length > 0) {
          console.log('Sample tweet:', {
            id: parsed.tweets[0].id,
            text: parsed.tweets[0].tweet_text?.substring(0, 50) + '...',
            score: parsed.tweets[0].importance_score,
            project: parsed.tweets[0].project_id
          });
        }
      } catch (e) {
        console.log('Could not parse JSON response');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testTwitterAPI();