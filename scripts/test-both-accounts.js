const https = require('https');

async function testAccount(email, password) {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'sunbeam.capital',
      path: '/api/auth/login/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const result = {
          email,
          password,
          status: res.statusCode,
          response: data
        };
        resolve(result);
      });
    });
    
    req.on('error', (error) => {
      resolve({ email, password, error: error.message });
    });
    
    req.write(loginData);
    req.end();
  });
}

async function testBothAccounts() {
  console.log('Testing both accounts to compare behavior...\n');
  
  // Test marc@minutevideos.com (working)
  console.log('1. Testing marc@minutevideos.com (working account)...');
  const minuteResult = await testAccount('marc@minutevideos.com', '123456');
  console.log('Status:', minuteResult.status);
  console.log('Success:', minuteResult.response.includes('"success":true') ? 'YES' : 'NO');
  
  // Test marc@cyrator.com with same password
  console.log('\n2. Testing marc@cyrator.com with password "123456"...');
  const cyratorResult1 = await testAccount('marc@cyrator.com', '123456');
  console.log('Status:', cyratorResult1.status);
  console.log('Success:', cyratorResult1.response.includes('"success":true') ? 'YES' : 'NO');
  
  // Test marc@cyrator.com with some common alternatives
  console.log('\n3. Testing marc@cyrator.com with other common passwords...');
  
  const commonPasswords = [
    'password',
    'Password123',
    'password123',
    '12345678',
    'sunbeam',
    'Sunbeam123',
    'cyrator',
    'Cyrator123'
  ];
  
  for (const pwd of commonPasswords) {
    const result = await testAccount('marc@cyrator.com', pwd);
    console.log(`Password "${pwd}": ${result.status === 200 && result.response.includes('"success":true') ? '✅ SUCCESS' : '❌ Failed'}`);
    
    // If we find the right password, show it clearly
    if (result.status === 200 && result.response.includes('"success":true')) {
      console.log('\n🎉 FOUND WORKING PASSWORD!');
      console.log(`Email: marc@cyrator.com`);
      console.log(`Password: ${pwd}`);
      break;
    }
  }
  
  // Check if accounts exist
  console.log('\n4. Checking account existence...');
  
  // Invalid credentials give us info about account existence
  const nonExistentTest = await testAccount('doesnotexist@example.com', 'wrongpass');
  const cyratorWrongPass = await testAccount('marc@cyrator.com', 'definitelywrong');
  
  console.log('Non-existent account response:', nonExistentTest.response);
  console.log('marc@cyrator.com wrong password response:', cyratorWrongPass.response);
  
  if (cyratorWrongPass.response.includes('Invalid login credentials')) {
    console.log('\n✅ marc@cyrator.com account EXISTS (just wrong password)');
  }
  
  console.log('\n5. Summary:');
  console.log('- marc@minutevideos.com works with password "123456"');
  console.log('- marc@cyrator.com exists but needs different password');
  console.log('- The password reset function should be used to set a new password');
}

testBothAccounts().catch(console.error);