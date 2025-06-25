const fetch = require('node-fetch');

async function fixInvestor() {
  const projectRef = 'gualxudgbmpuhjbumfeh';
  const apiKey = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add';
  
  // First get Marc's user ID
  const userQuery = `
    SELECT id, email FROM auth.users 
    WHERE email = 'marc@minutevideos.com';
  `;
  
  console.log('Finding Marc user ID...');
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
    
    // Now create investor record with that ID
    const investorQuery = `
      INSERT INTO investors (
        id,
        email,
        name,
        account_number,
        share_percentage,
        initial_investment,
        join_date,
        status
      ) VALUES (
        '${userId}',
        'marc@minutevideos.com',
        'Marc Schwyn',
        'INV-001',
        38.34,
        38340,
        '2023-12-01',
        'active'
      ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        share_percentage = EXCLUDED.share_percentage
      RETURNING *;
    `;
    
    console.log('\nCreating investor record...');
    const investorResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: investorQuery })
    });
    const investorData = await investorResponse.json();
    console.log('Investor result:', JSON.stringify(investorData, null, 2));
  }
}

fixInvestor().catch(console.error);
