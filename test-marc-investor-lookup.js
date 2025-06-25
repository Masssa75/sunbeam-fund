const fetch = require('node-fetch');

async function testInvestorLookup() {
  const projectRef = 'gualxudgbmpuhjbumfeh';
  const apiKey = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add';
  
  // First, get Marc's user ID
  const userQuery = `
    SELECT id, email FROM auth.users 
    WHERE email = 'marc@cyrator.com';
  `;
  
  console.log('Checking marc@cyrator.com user...');
  const userResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: userQuery })
  });
  const userData = await userResponse.json();
  console.log('User data:', JSON.stringify(userData, null, 2));
  
  if (userData.length > 0) {
    const userId = userData[0].id;
    
    // Check if this user has an investor record
    const investorQuery = `
      SELECT * FROM investors 
      WHERE id = '${userId}';
    `;
    
    console.log(`\nChecking investor record for user ID ${userId}...`);
    const investorResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: investorQuery })
    });
    const investorData = await investorResponse.json();
    console.log('Investor data:', JSON.stringify(investorData, null, 2));
  }
}

testInvestorLookup().catch(console.error);
