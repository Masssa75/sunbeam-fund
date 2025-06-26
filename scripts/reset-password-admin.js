require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function resetPasswordAdmin() {
  console.log('=== Admin Password Reset for marc@cyrator.com ===\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Create admin client
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Get user by email
    console.log('1. Finding user marc@cyrator.com...');
    const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return;
    }
    
    const user = users.users.find(u => u.email === 'marc@cyrator.com');
    
    if (!user) {
      console.error('❌ User marc@cyrator.com not found');
      return;
    }
    
    console.log('✅ Found user:', user.id);
    console.log('Email confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
    
    // Update password
    console.log('\n2. Updating password to "123456"...');
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: '123456' }
    );
    
    if (updateError) {
      console.error('❌ Error updating password:', updateError);
    } else {
      console.log('✅ Password updated successfully!');
      console.log('\n📝 Login credentials:');
      console.log('Email: marc@cyrator.com');
      console.log('Password: 123456');
      console.log('\nYou can now login at: https://sunbeam.capital/login');
    }
    
  } catch (error) {
    console.error('Admin reset failed:', error);
  }
}

resetPasswordAdmin().catch(console.error);