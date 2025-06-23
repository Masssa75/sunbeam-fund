const fetch = require('node-fetch')

async function createTestUser() {
  const projectRef = 'gualxudgbmpuhjbumfeh'
  const apiKey = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add'
  
  console.log('Creating test user via Management API...\n')
  
  try {
    // First, let's check if we can access user management
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to get auth config:', error)
      return
    }
    
    const authConfig = await response.json()
    console.log('Auth config retrieved successfully')
    console.log('Email enabled:', authConfig.email_auth_enabled)
    
    // Create a user via SQL (alternative approach)
    console.log('\nCreating user via SQL...')
    const sql = `
      -- Create a test admin user entry
      INSERT INTO admin_users (user_email, created_at)
      VALUES ('test@sunbeam.capital', NOW())
      ON CONFLICT (user_email) DO NOTHING;
      
      -- Return the result
      SELECT * FROM admin_users WHERE user_email = 'test@sunbeam.capital';
    `
    
    const sqlResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    })
    
    const sqlResult = await sqlResponse.json()
    console.log('SQL Result:', sqlResult)
    
    console.log('\n✅ Admin user entry created. You can now:')
    console.log('1. Go to Supabase Dashboard > Authentication > Users')
    console.log('2. Click "Invite User"')
    console.log('3. Enter email: test@sunbeam.capital')
    console.log('4. They will receive an invite to set their password')
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

createTestUser()