require('dotenv').config();

async function checkSupabaseEmailConfig() {
  console.log('=== Checking Supabase Email Configuration ===\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Supabase URL:', supabaseUrl);
  console.log('Service Role Key present:', !!serviceRoleKey);
  
  // Test 1: Check if we can access Supabase auth admin
  try {
    console.log('\n1. Testing Supabase Auth Admin API...');
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Auth Admin API Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Can access auth admin API');
      console.log(`Found ${data.users?.length || 0} users`);
    } else {
      console.log('❌ Cannot access auth admin API');
    }
  } catch (error) {
    console.error('❌ Auth admin API error:', error.message);
  }
  
  // Test 2: Try to trigger a password reset via API
  try {
    console.log('\n2. Testing password reset via Supabase API...');
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const response = await fetch(`${supabaseUrl}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'marc@cyrator.com'
      })
    });
    
    console.log('Password Reset API Status:', response.status);
    const responseText = await response.text();
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ Password reset request sent');
    } else {
      console.log('❌ Password reset failed');
    }
  } catch (error) {
    console.error('❌ Password reset error:', error.message);
  }
  
  // Test 3: Check project settings via Management API
  try {
    console.log('\n3. Checking Supabase project configuration...');
    const managementToken = process.env.SUPABASE_ACCESS_TOKEN;
    const projectId = 'gualxudgbmpuhjbumfeh';
    
    if (managementToken) {
      const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const project = await response.json();
        console.log('Project name:', project.name);
        console.log('Project region:', project.region);
        console.log('Project created:', new Date(project.created_at).toLocaleString());
      }
    } else {
      console.log('⚠️ No management token available to check project config');
    }
  } catch (error) {
    console.error('Project config error:', error.message);
  }
  
  // Test 4: Check if email templates exist
  console.log('\n4. Email Configuration Notes:');
  console.log('- By default, Supabase sends emails from noreply@mail.app.supabase.io');
  console.log('- Custom SMTP can be configured in Supabase Dashboard > Auth > Email Templates');
  console.log('- Check spam folder - Supabase emails often end up there');
  console.log('- Email sending might be disabled for new projects (check dashboard)');
  
  // Test 5: Direct test with known working user
  try {
    console.log('\n5. Testing login with marc@cyrator.com directly...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userData) {
      const marcUser = userData.users.find(u => u.email === 'marc@cyrator.com');
      if (marcUser) {
        console.log('✅ Found user marc@cyrator.com');
        console.log('User ID:', marcUser.id);
        console.log('Email confirmed:', marcUser.email_confirmed_at ? 'Yes' : 'No');
        console.log('Last sign in:', marcUser.last_sign_in_at || 'Never');
        console.log('Created:', new Date(marcUser.created_at).toLocaleString());
      } else {
        console.log('❌ User marc@cyrator.com not found');
      }
    }
  } catch (error) {
    console.error('User lookup error:', error.message);
  }
}

checkSupabaseEmailConfig().catch(console.error);