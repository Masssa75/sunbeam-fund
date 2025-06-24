const https = require('https');

async function testAddPosition() {
  console.log('Testing add position functionality...\n');

  // Test position data
  const positionData = {
    project_id: 'virtuals-protocol',
    project_name: 'Virtuals Protocol',
    symbol: 'VIRTUAL',
    amount: 123.73,
    cost_basis: 100,  // Total cost in USD
    entry_date: '2025-06-24',
    notes: 'Test position'
  };

  console.log('Position data to add:', JSON.stringify(positionData, null, 2));

  // First, we need to get the auth cookies from a logged-in session
  // For testing, we'll use the session endpoint to verify auth
  const sessionOptions = {
    hostname: 'sunbeam.capital',
    path: '/api/auth/session/',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      // You'll need to add your auth cookies here from the browser
      'Cookie': 'sb-gualxudgbmpuhjbumfeh-auth-token.0=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpoZFhSb1pXNTBhV05oZEdWa0lpd2laWGh3SWpveE56VXdOams1TmpBeExDSnBZWFFpT2pFM05UQTJPVFk; sb-gualxudgbmpuhjbumfeh-auth-token.1=wTURFc0ltbHpjeUk2SW1oMGRIQnpPaTh2WjNWaGJIaDFaR2RpYlhCMWFHcGlkVzFtWldndWMzVndZV0poYzJVdVkyOHZZWFYwYUM5Mk1TSXNJbk4xWWlJNklqZGtOV0V5Tm1aaUxXRmhZVEV0TkdJNU9DMWhOV0UwTFdVeE5UWXpaR0U0TWpReFpDSXNJbVZ0WVdsc0lqb2liV0Z5WTBCdGFXNTFkR1YyYVdSbGIzTXVZMjl0SWl3aWNHaHZibVVpT2lJaUxDSmhjSEJmYldWMFlXUmhkR0VpT25zaWNISnZkbWxrWlhJaU9pSmxiV0ZwYkNJc0luQnliM1pwWkdWeWN5STZXeUpsYldGcGJDSmRmU3dpZFhObGNsOXRaWFJoWkdGMFlTSTZlMzBzSW5KdmJHVWlPaUpoZFhSb1pXNTBhV05oZEdWa0lpd2lZV0ZzSWpvaVlXRnNNU0lzSW1GdGNpSTZXM3NpYldWMGFHOWtJam9pY0dGemMzZHZjbVFpTENKMGFXMWxjM1JoYlhBaU9qRTNOVEEyT1RZd01ERmRMQ0p6WlhOemFXOXVYMmxrSWpvaU1XWmlPRFJsWlRBdE5UWTBPQzAwTURrM0xXRXpNekl0T0RjeU1XUm1ZV1ZrTldObEluMC5FT2lzX2VxVGxBOEdBbUdQRE1PVkJxNmFodFdMcGU5X1BHT25Nd0VlRlBJIiwicmVmcmVzaF90b2tlbiI6InJYOGJQWll6QWdQeTVjeEs4cWhoM3ciLCJ0b2tlbl90eXBlIjoiYmVhcmVyIiwidXNlciI6eyJpZCI6IjdkNWEyNmZiLWFhYTE; sb-gualxudgbmpuhjbumfeh-auth-token.2=tNGI5OC1hNWE0LWUxNTYzZGE4MjQxZCIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoibWFyY0BtaW51dGV2aWRlb3MuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6e30sInN1YiI6IjdkNWEyNmZiLWFhYTE0Yjk4LWE1YTQtZTE1NjNkYTgyNDFkIiwiY3JlYXRlZF9hdCI6IjIwMjUtMDEtMjNUMjI6MjA6MjUuMDA1Mjc2WiIsInVwZGF0ZWRfYXQiOiIyMDI1LTAxLTI0VDAzOjAwOjAxLjQ3MTQxMloiLCJpc19hbm9ueW1vdXMiOmZhbHNlfX0'
    }
  };

  // Test session first
  console.log('\nTesting authentication...');
  const sessionData = await makeRequest(sessionOptions);
  console.log('Session response:', sessionData);

  if (!sessionData.authenticated) {
    console.error('❌ Not authenticated. Please log in first.');
    return;
  }

  console.log('✅ Authenticated as:', sessionData.user?.email);

  // Now try to add the position
  const addOptions = {
    hostname: 'sunbeam.capital',
    path: '/api/positions/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': sessionOptions.headers.Cookie
    }
  };

  console.log('\nAdding position...');
  const result = await makeRequest(addOptions, positionData);
  console.log('Add position response:', result);
}

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          console.log('Raw response:', data);
          resolve(data);
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

// Run the test
testAddPosition().catch(console.error);