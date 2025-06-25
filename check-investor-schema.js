const fetch = require('node-fetch');

async function checkSchema() {
  const projectRef = 'gualxudgbmpuhjbumfeh';
  const apiKey = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add';
  
  // First check the schema
  const schemaQuery = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'investors'
    ORDER BY ordinal_position;
  `;
  
  console.log('Investors table schema:');
  const schemaResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: schemaQuery })
  });
  const schemaData = await schemaResponse.json();
  console.log(JSON.stringify(schemaData, null, 2));
  
  // Then check Marc's investor record
  const investorQuery = `
    SELECT * FROM investors 
    WHERE email = 'marc@minutevideos.com' 
    OR name LIKE '%Marc%'
    OR name LIKE '%marc%';
  `;
  
  console.log('\nMarc investor records:');
  const investorResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: investorQuery })
  });
  const investorData = await investorResponse.json();
  console.log(JSON.stringify(investorData, null, 2));
}

checkSchema().catch(console.error);
