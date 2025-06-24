const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestAdmin() {
  try {
    // First, create a user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'claude.admin@sunbeam.capital',
      password: 'admin123456',
      email_confirm: true,
      user_metadata: {
        name: 'Claude Admin'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('✅ Created auth user:', authData.user.email);

    // Now add to admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        user_email: 'claude.admin@sunbeam.capital',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (adminError) {
      console.error('Error creating admin record:', adminError);
      // Clean up auth user if admin creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('✅ Created admin record');
    console.log('');
    console.log('🔐 Admin Login Credentials:');
    console.log('   Email: claude.admin@sunbeam.capital');
    console.log('   Password: admin123456');
    console.log('');
    console.log('🎯 Use these credentials for:');
    console.log('   - Headless browser testing');
    console.log('   - Admin functionality testing');
    console.log('   - Managing investors');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestAdmin();