const fetch = require('node-fetch')

async function addAdminUser() {
  const projectRef = 'gualxudgbmpuhjbumfeh'
  const apiKey = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add'
  
  const sql = `
    -- Add marc@minutevideos.com as admin
    INSERT INTO admin_users (user_email, created_at)
    VALUES ('marc@minutevideos.com', NOW())
    ON CONFLICT (user_email) DO NOTHING;
    
    -- Return all admin users
    SELECT * FROM admin_users ORDER BY created_at DESC;
  `
  
  console.log('Adding marc@minutevideos.com as admin user...\n')
  
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      console.error('API Error:', result)
      return
    }
    
    console.log('✅ Admin user added successfully!')
    console.log('\nCurrent admin users:')
    result.forEach(user => {
      console.log(`- ${user.user_email} (added ${new Date(user.created_at).toLocaleDateString()})`)
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

addAdminUser()