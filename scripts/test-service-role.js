const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testServiceRole() {
  console.log('🧪 Testing Service Role Access\n');
  
  // Test with service role key
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  console.log('1️⃣ Test auth.admin.listUsers()');
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
  
  console.log('\n2️⃣ Test direct table access');
  try {
    const { data: investors, error } = await supabaseAdmin
      .from('investors')
      .select('*');
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log(`✅ Found ${investors.length} investors`);
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
  
  console.log('\n3️⃣ Check environment variables');
  console.log('   SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('   SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
}

testServiceRole();