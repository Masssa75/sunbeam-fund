async function testLoginAPI() {
  console.log('Testing login API endpoint...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'marc@cyrator.com',
        password: '123456'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ Login API working correctly!');
    } else {
      console.log('\n❌ Login API failed:', data.error);
    }
  } catch (error) {
    console.error('Error calling login API:', error.message);
    console.log('\nMake sure the development server is running on port 3000');
  }
}

testLoginAPI();