const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  // Try to find monitoring tables
  const tableNames = ['monitored_projects', 'monitor_projects', 'projects'];
  
  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);
        
      if (!error && data) {
        console.log(`✅ Table '${tableName}' exists with ${data.length} records:`);
        data.forEach(record => {
          console.log(`  - ${JSON.stringify(record)}`);
        });
        console.log('');
      }
    } catch (e) {
      console.log(`❌ Table '${tableName}' does not exist`);
    }
  }
}

checkTables().catch(console.error);