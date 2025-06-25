const fetch = require('node-fetch');

async function verifyToken() {
  const projectRef = 'gualxudgbmpuhjbumfeh';
  const apiKey = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add';
  
  const query = `
    SELECT * FROM investor_telegram 
    WHERE investor_id = 'a78cd233-9372-43af-9304-ee4a3e2c0547'
    ORDER BY created_at DESC
    LIMIT 2;
  `;
  
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  console.log('Latest tokens:', JSON.stringify(data, null, 2));
}

verifyToken().catch(console.error);
