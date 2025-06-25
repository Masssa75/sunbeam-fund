const fetch = require('node-fetch');

async function checkMarc() {
  const projectRef = 'gualxudgbmpuhjbumfeh';
  const apiKey = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add';
  
  // Check Marc's user and investor records
  const query = `
    SELECT 
      'User Record' as type,
      u.id,
      u.email,
      u.created_at
    FROM auth.users u
    WHERE u.email = 'marc@minutevideos.com'
    
    UNION ALL
    
    SELECT 
      'Investor Record' as type,
      i.id,
      i.email,
      i.created_at::text
    FROM investors i
    WHERE i.email = 'marc@minutevideos.com'
    OR i.id = 'a78cd233-9372-43af-9304-ee4a3e2c0547';
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
  console.log('Marc\'s records:', JSON.stringify(data, null, 2));
  
  // Also check if there are any telegram connections
  const telegramQuery = `
    SELECT * FROM investor_telegram 
    WHERE investor_id = 'a78cd233-9372-43af-9304-ee4a3e2c0547'
    ORDER BY created_at DESC;
  `;
  
  const telegramResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: telegramQuery })
  });

  const telegramData = await telegramResponse.json();
  console.log('\nTelegram connections:', JSON.stringify(telegramData, null, 2));
}

checkMarc().catch(console.error);
