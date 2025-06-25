const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQL() {
  console.log('Creating user notifications table...\n');
  
  // Read SQL file
  const sql = fs.readFileSync('./create-user-notifications-table.sql', 'utf8');
  
  // Execute SQL
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    // Try direct execution as fallback
    console.log('RPC failed, trying direct execution...');
    
    // Split into individual statements
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      
      console.log('Executing:', statement.trim().substring(0, 50) + '...');
      
      // Execute via Supabase Management API
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_ID}/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: statement.trim() + ';' })
        }
      );
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Error:', error);
      } else {
        console.log('✅ Success');
      }
    }
  } else {
    console.log('✅ User notifications table created successfully!');
  }
  
  console.log('\nTable features:');
  console.log('- Tracks seen/dismissed state for each user + notification');
  console.log('- RLS policies ensure users can only see their own data');
  console.log('- Indexes for performance');
  console.log('- Helper view for unread counts');
}

executeSQL().catch(console.error);