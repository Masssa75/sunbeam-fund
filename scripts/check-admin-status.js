const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminStatus() {
  try {
    console.log('🔍 Checking Admin Status...\n');
    
    // Check all admin users
    console.log('1️⃣ All Admin Users:');
    const { data: admins, error: adminError } = await supabase
      .from('admin_users')
      .select('*');
    
    if (adminError) {
      console.error('Error fetching admins:', adminError);
    } else {
      console.log('Found', admins.length, 'admin users:');
      admins.forEach(admin => {
        console.log(`   - ID: ${admin.id}`);
        console.log(`     Email: ${admin.user_email}`);
        console.log(`     Created: ${admin.created_at}`);
        console.log('');
      });
    }
    
    // Check for claude admin specifically
    console.log('2️⃣ Checking Claude Admin:');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error listing users:', usersError);
      return;
    }
    
    const claudeAdmin = users.find(u => u.email === 'claude.admin@sunbeam.capital');
    if (claudeAdmin) {
      console.log('✅ Claude admin user exists:');
      console.log(`   ID: ${claudeAdmin.id}`);
      console.log(`   Email: ${claudeAdmin.email}`);
      
      // Check if in admin_users table
      const { data: adminRecord } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', claudeAdmin.id)
        .single();
      
      if (adminRecord) {
        console.log('✅ Claude admin is in admin_users table');
      } else {
        console.log('❌ Claude admin NOT in admin_users table');
        console.log('   Need to add to admin_users table');
      }
    } else {
      console.log('❌ Claude admin user not found');
    }
    
    // Check all investors
    console.log('\n3️⃣ All Investors:');
    const { data: investors, error: investorError } = await supabase
      .from('investors')
      .select('*');
    
    if (investorError) {
      console.error('Error fetching investors:', investorError);
    } else {
      console.log('Found', investors.length, 'investors:');
      investors.forEach(inv => {
        console.log(`   - ${inv.name} (${inv.email})`);
        console.log(`     Account: ${inv.account_number}`);
        console.log(`     Share: ${inv.share_percentage}%`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAdminStatus();