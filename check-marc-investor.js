const fetch = require('node-fetch');

async function checkInvestor() {
  const projectRef = 'gualxudgbmpuhjbumfeh';
  const apiKey = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add';
  
  const query = `
    SELECT 
      u.id as user_id,
      u.email,
      i.id as investor_id,
      i.name as investor_name,
      i.share_percentage
    FROM auth.users u
    LEFT JOIN investors i ON i.user_id = u.id
    WHERE u.email = 'marc@minutevideos.com';
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
  console.log('Marc investor status:', JSON.stringify(data, null, 2));
}

checkInvestor().catch(console.error);
