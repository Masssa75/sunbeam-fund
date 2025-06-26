const https = require('https');

async function testTelegramBot() {
  console.log('Testing Telegram bot functionality...\n');

  // Test parameters
  const chatId = '5089502326'; // Marc's Telegram chat ID
  const message = `Test message from Sunbeam admin panel - ${new Date().toLocaleString()}`;

  // First, let's test the GET endpoint to check configuration
  console.log('1. Testing GET /api/telegram/test/ endpoint...');
  
  const getOptions = {
    hostname: 'sunbeam.capital',
    path: '/api/telegram/test/',
    method: 'GET',
    headers: {
      'Cookie': 'sb-gualxudgbmpuhjbumfeh-auth-token.0=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpoZFhSb1pXNTBhV05oZEdWa0lpd2laWGh3SWpveE56TTFOalV3TmpBMkxDSnBZWFFpT2pFM016VTJORFl3TURZc0ltbHpjeUk2SW1oMGRIQnpPaTh2WjNWaGJIaDFaR2RpYlhCMWFHcGlkVzFtWldndWMzVndZV0poYzJVdVkyOHZZWFYwYUM5Mk1TSXNJbk4xWWlJNklqYzBZekZqWVRjM0xUUmlPVFF0TkdFM05pMWhZalJrTFRabU56ZGlPVE5oWWpreU1DSXNJbVZ0WVdsc0lqb2liV0Z5WTBCdGFXNTFkR1YyYVdSbGIzTXVZMjl0SWl3aWNHaHZibVVpT2lJaUxDSmhjSEJmYldWMFlXUmhkR0VpT25zaWNISnZkbWxrWlhJaU9pSmxiV0ZwYkNJc0luQnliM1pwWkdWeWN5STZXeUpsYldGcGJDSmRmU3dpZFhObGNsOXRaWFJoWkdGMFlTSTZleUpsYldGcGJDSTZJbTFoY21OQWJXbHVkWFJsZG1sa1pXOXpMbU52YlNJc0ltVnRZV2xzWDNabGNtbG1hV1ZrSWpwMGNuVmxMQ0p3YUc5dVpWOTJaWEpwWm1sbFpDSTZabUZzYzJVc0luTjFZaUk2SWpjMFl6RmpZVGMzTFRSaU9UUXROR0UzTmkxaFlqUmtMVFptTnpkaU9UTmhZamt5TUNKOUxDSnliMnhsSWpvaVlYVjBhR1Z1ZEdsallYUmxaQ0lzSW1GaGJDSTZJbUZoYkRFaUxDSmhiWElpT2xzaWNHRnpjM2R2Y21RaVhTd2ljMlZ6YzJsdmJsOXBaQ0k2SW1abU5ESmpOVGRoTFRGbU1XVXRORGhqTVMwNU5HVmhMVEF4TldVeE5qSXlZV0k1WlNJc0ltbHpYMkZ1YjI1NWJXOTFjeUk2Wm1Gc2MyVjkuQklQVEtmdU1MWW9ldHNIUTdON1paQ3N6SUxzaE0zRVk1aXBLN05IVy1LSSIsInJlZnJlc2hfdG9rZW4iOiJHTTlOdjk1d3o3ZE50YWJzRkdNN213IiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3MzU2NTA2MDYsInVzZXIiOnsiaWQiOiI3NGMxY2E3Ny00Yjk0LTRhNzYtYWI0ZC02Zjc3YjkzYWI5MjAiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJlbWFpbCI6Im1hcmNAbWludXRldmlkZW9zLmNvbSIsImVtYWlsX2NvbmZpcm1lZF9hdCI6IjIwMjUtMDYtMjRUMDI6Mzk6MTEuOTExNzA1WiIsInBob25lIjoiIiwiY29uZmlybWVkX2F0IjoiMjAyNS0wNi0yNFQwMjo'
    }
  };

  try {
    await new Promise((resolve, reject) => {
      const req = https.request(getOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log('Response:', data);
          console.log('Status:', res.statusCode);
          resolve();
        });
      });
      req.on('error', reject);
      req.end();
    });
  } catch (error) {
    console.error('GET request failed:', error.message);
  }

  console.log('\n2. Testing POST /api/telegram/test/ endpoint...');

  // Now test the POST endpoint to send a message
  const postData = JSON.stringify({
    chatId: chatId,
    message: message
  });

  const postOptions = {
    hostname: 'sunbeam.capital',
    path: '/api/telegram/test/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
      'Cookie': 'sb-gualxudgbmpuhjbumfeh-auth-token.0=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpoZFhSb1pXNTBhV05oZEdWa0lpd2laWGh3SWpveE56TTFOalV3TmpBMkxDSnBZWFFpT2pFM016VTJORFl3TURZc0ltbHpjeUk2SW1oMGRIQnpPaTh2WjNWaGJIaDFaR2RpYlhCMWFHcGlkVzFtWldndWMzVndZV0poYzJVdVkyOHZZWFYwYUM5Mk1TSXNJbk4xWWlJNklqYzBZekZqWVRjM0xUUmlPVFF0TkdFM05pMWhZalJrTFRabU56ZGlPVE5oWWpreU1DSXNJbVZ0WVdsc0lqb2liV0Z5WTBCdGFXNTFkR1YyYVdSbGIzTXVZMjl0SWl3aWNHaHZibVVpT2lJaUxDSmhjSEJmYldWMFlXUmhkR0VpT25zaWNISnZkbWxrWlhJaU9pSmxiV0ZwYkNJc0luQnliM1pwWkdWeWN5STZXeUpsYldGcGJDSmRmU3dpZFhObGNsOXRaWFJoWkdGMFlTSTZleUpsYldGcGJDSTZJbTFoY21OQWJXbHVkWFJsZG1sa1pXOXpMbU52YlNJc0ltVnRZV2xzWDNabGNtbG1hV1ZrSWpwMGNuVmxMQ0p3YUc5dVpWOTJaWEpwWm1sbFpDSTZabUZzYzJVc0luTjFZaUk2SWpjMFl6RmpZVGMzTFRSaU9UUXROR0UzTmkxaFlqUmtMVFptTnpkaU9UTmhZamt5TUNKOUxDSnliMnhsSWpvaVlYVjBhR1Z1ZEdsallYUmxaQ0lzSW1GaGJDSTZJbUZoYkRFaUxDSmhiWElpT2xzaWNHRnpjM2R2Y21RaVhTd2ljMlZ6YzJsdmJsOXBaQ0k2SW1abU5ESmpOVGRoTFRGbU1XVXRORGhqTVMwNU5HVmhMVEF4TldVeE5qSXlZV0k1WlNJc0ltbHpYMkZ1YjI1NWJXOTFjeUk2Wm1Gc2MyVjkuQklQVEtmdU1MWW9ldHNIUTdON1paQ3N6SUxzaE0zRVk1aXBLN05IVy1LSSIsInJlZnJlc2hfdG9rZW4iOiJHTTlOdjk1d3o3ZE50YWJzRkdNN213IiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3MzU2NTA2MDYsInVzZXIiOnsiaWQiOiI3NGMxY2E3Ny00Yjk0LTRhNzYtYWI0ZC02Zjc3YjkzYWI5MjAiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJlbWFpbCI6Im1hcmNAbWludXRldmlkZW9zLmNvbSIsImVtYWlsX2NvbmZpcm1lZF9hdCI6IjIwMjUtMDYtMjRUMDI6Mzk6MTEuOTExNzA1WiIsInBob25lIjoiIiwiY29uZmlybWVkX2F0IjoiMjAyNS0wNi0yNFQwMjo'
    }
  };

  try {
    await new Promise((resolve, reject) => {
      const req = https.request(postOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log('Response:', data);
          console.log('Status:', res.statusCode);
          
          if (res.statusCode === 200) {
            console.log('\n✅ Test message sent successfully!');
            console.log('Check your Telegram for the message.');
          } else {
            console.log('\n❌ Failed to send test message');
          }
          resolve();
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('POST request failed:', error.message);
  }

  console.log('\n3. Testing direct Edge Function call...');
  // Let's also test calling the Edge Function directly
  const edgeFunctionUrl = 'https://gualxudgbmpuhjbumfeh.supabase.co/functions/v1/send-telegram-notification';
  const edgeFunctionData = JSON.stringify({
    chatId: chatId,
    message: message + ' (direct Edge Function call)',
    format: 'HTML'
  });

  const url = new URL(edgeFunctionUrl);
  const edgeOptions = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': edgeFunctionData.length,
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTA0MDQ0NSwiZXhwIjoyMDM0NjE2NDQ1fQ.5NPxNelvwW0kXAd3tRNOOPOhQRU6MkPm0FVMmONgyH4'
    }
  };

  try {
    await new Promise((resolve, reject) => {
      const req = https.request(edgeOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log('Edge Function Response:', data);
          console.log('Status:', res.statusCode);
          resolve();
        });
      });
      
      req.on('error', reject);
      req.write(edgeFunctionData);
      req.end();
    });
  } catch (error) {
    console.error('Edge Function call failed:', error.message);
  }
}

testTelegramBot().catch(console.error);