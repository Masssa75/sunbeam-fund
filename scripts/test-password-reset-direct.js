require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testPasswordReset() {
  console.log('=== Testing Password Reset Directly ===\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, anonKey);
  
  try {
    // Test 1: Request password reset
    console.log('1. Requesting password reset for marc@cyrator.com...');
    const { data, error } = await supabase.auth.resetPasswordForEmail('marc@cyrator.com', {
      redirectTo: 'https://sunbeam.capital/login?mode=reset',
    });
    
    if (error) {
      console.error('❌ Password reset error:', error);
    } else {
      console.log('✅ Password reset email sent successfully!');
      console.log('Response:', data);
      console.log('\n📧 IMPORTANT: Check your email for the reset link');
      console.log('- Check spam/junk folder');
      console.log('- Email will be from: noreply@mail.app.supabase.io');
      console.log('- Subject: "Reset Your Password"');
    }
    
    // Test 2: Check Supabase dashboard URL
    console.log('\n2. To check email settings in Supabase:');
    console.log(`Dashboard URL: https://app.supabase.com/project/${supabaseUrl.split('.')[0].split('//')[1]}`);
    console.log('Go to: Authentication > Email Templates');
    console.log('Check if email sending is enabled');
    
    // Test 3: Alternative password reset method
    console.log('\n3. Alternative: Update password directly via admin API');
    console.log('You can run: node scripts/reset-password-admin.js');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPasswordReset().catch(console.error);