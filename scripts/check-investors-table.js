// Check if investors table exists in the database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkInvestorsTable() {
  console.log('🔍 Checking if investors table exists...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.8V_9hWPPzQqWfMgGqnCXlzZNbZcAdowOk9kHWPNJb0s'
  );

  try {
    // Try to select from investors table
    console.log('📋 Attempting to query investors table...');
    const { data, error } = await supabase
      .from('investors')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Investors table does not exist or is not accessible');
      console.log('Error:', error.message);
      console.log('Code:', error.code);
      
      if (error.code === '42P01') {
        console.log('🔧 Need to run migration to create investors table');
        return false;
      }
    } else {
      console.log('✅ Investors table exists and is accessible');
      console.log('Data:', data);
      return true;
    }
    
    // Try to check table structure
    console.log('📋 Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec', { 
        sql: `SELECT column_name, data_type, is_nullable 
              FROM information_schema.columns 
              WHERE table_name = 'investors' 
              ORDER BY ordinal_position` 
      });
    
    if (columnsError) {
      console.log('❌ Could not check table structure:', columnsError.message);
    } else {
      console.log('📊 Table structure:', columns);
    }
    
  } catch (error) {
    console.error('❌ Error checking investors table:', error.message);
    return false;
  }
}

checkInvestorsTable().catch(console.error);