const fetch = require('node-fetch');

async function createInvestor() {
  const projectRef = 'gualxudgbmpuhjbumfeh';
  const apiKey = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add';
  
  const query = `
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
      '74c1ca77-4b94-4a76-ab4d-6f77b93ab920',
      'marc@cyrator.com',
      'Marc Schwyn (Cyrator)',
      'INV-002',
      38.34,
      38340,
      '2023-12-01',
      'active'
    ) RETURNING *;
  `;
  
  console.log('Creating investor record for marc@cyrator.com...');
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

createInvestor().catch(console.error);
