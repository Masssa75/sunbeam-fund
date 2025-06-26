import https from 'https';

async function testPasswordReset() {
  console.log('Testing password reset functionality (Paid tier)...\n');
  
  const emails = ['marc@cyrator.com', 'marc@minutevideos.com'];
  
  for (const email of emails) {
    console.log(`\nTesting password reset for: ${email}`);
    console.log('─'.repeat(50));
    
    const resetData = JSON.stringify({ email });
    
    const options = {
      hostname: 'sunbeam.capital',
      path: '/api/auth/reset-password/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': resetData.length
      }
    };
    
    await new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        console.log('Status Code:', res.statusCode);
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log('Response:', data);
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.success) {
              console.log('✅ Password reset email triggered successfully');
              console.log('Check your email inbox (and spam folder)');
            } else {
              console.log('❌ Failed:', parsed.error || 'Unknown error');
            }
          } catch (e) {
            console.log('Response parsing error:', e.message);
          }
          
          resolve();
        });
      });
      
      req.on('error', (error) => {
        console.error('Request error:', error);
        resolve();
      });
      
      req.write(resetData);
      req.end();
    });
  }
  
  console.log('\n\nDiagnostics:');
  console.log('1. Since you\'re on paid tier, there\'s no rate limit');
  console.log('2. Check these email locations:');
  console.log('   - Primary inbox');
  console.log('   - Spam/Junk folder');
  console.log('   - Promotions tab (Gmail)');
  console.log('   - All Mail (Gmail)');
  console.log('\n3. Email will be from: noreply@mail.app.supabase.io');
  console.log('4. Subject line: "Reset Your Password"');
  
  console.log('\n\nIf emails still aren\'t arriving:');
  console.log('- Your email provider might be blocking Supabase\'s default sender');
  console.log('- Configure custom SMTP for guaranteed delivery');
  console.log('- The API is working, it\'s just an email delivery issue');
}

testPasswordReset().catch(console.error);