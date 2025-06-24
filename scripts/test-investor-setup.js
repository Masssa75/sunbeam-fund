const fetch = require('node-fetch');

async function testInvestorSetup() {
  console.log('🧪 Testing Investor Setup...\n');

  // Test 1: Login as admin
  console.log('1️⃣ Testing admin login...');
  const loginResponse = await fetch('http://localhost:3001/api/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'marc@minutevideos.com',
      password: '123456'
    })
  });

  if (!loginResponse.ok) {
    console.error('❌ Admin login failed');
    return;
  }

  const cookies = loginResponse.headers.get('set-cookie');
  console.log('✅ Admin logged in successfully\n');

  // Test 2: Get all users
  console.log('2️⃣ Fetching all users...');
  const usersResponse = await fetch('http://localhost:3001/api/users/', {
    headers: { 'Cookie': cookies }
  });

  if (!usersResponse.ok) {
    console.error('❌ Failed to fetch users:', await usersResponse.text());
    return;
  }

  const { users } = await usersResponse.json();
  console.log(`✅ Found ${users.length} users`);
  
  const investors = users.filter(u => u.account_number);
  const nonInvestors = users.filter(u => !u.account_number);
  
  console.log(`   - ${investors.length} investors`);
  console.log(`   - ${nonInvestors.length} non-investors\n`);

  // Test 3: Get investors
  console.log('3️⃣ Fetching investors...');
  const investorsResponse = await fetch('http://localhost:3001/api/investors/', {
    headers: { 'Cookie': cookies }
  });

  if (!investorsResponse.ok) {
    console.error('❌ Failed to fetch investors:', await investorsResponse.text());
    return;
  }

  const { investors: investorList } = await investorsResponse.json();
  console.log(`✅ Found ${investorList.length} investors:`);
  
  investorList.forEach(inv => {
    console.log(`   - ${inv.name} (${inv.email}) - ${inv.share_percentage}% - Account: ${inv.account_number}`);
  });

  // Test 4: Login as test investor
  console.log('\n4️⃣ Testing investor login...');
  const investorLoginResponse = await fetch('http://localhost:3001/api/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test.investor@sunbeam.capital',
      password: 'investor123456'
    })
  });

  if (!investorLoginResponse.ok) {
    console.error('❌ Investor login failed');
    return;
  }

  console.log('✅ Test investor logged in successfully');
  
  console.log('\n✨ Investor setup is working correctly!');
  console.log('\n📝 Next steps:');
  console.log('   1. Visit http://localhost:3001/admin/investors as admin');
  console.log('   2. Convert existing users to investors');
  console.log('   3. Test investor-specific views');
}

testInvestorSetup().catch(console.error);