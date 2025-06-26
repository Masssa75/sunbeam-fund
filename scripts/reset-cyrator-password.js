require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTA0MDQ0NSwiZXhwIjoyMDM0NjE2NDQ1fQ.5NPxNelvwW0kXAd3tRNOOPOhQRU6MkPm0FVMmONgyH4';

async function resetPassword() {
  console.log('Resetting password for marc@cyrator.com...\n');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // First, let's find the user
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error listing users:', userError);
    return;
  }

  const cyratorUser = userData.users.find(u => u.email === 'marc@cyrator.com');
  const minuteUser = userData.users.find(u => u.email === 'marc@minutevideos.com');
  
  console.log('User status:');
  console.log('- marc@cyrator.com:', cyratorUser ? 'Found' : 'Not found');
  console.log('- marc@minutevideos.com:', minuteUser ? 'Found' : 'Not found');
  
  if (cyratorUser) {
    console.log('\nmarc@cyrator.com details:');
    console.log('- User ID:', cyratorUser.id);
    console.log('- Email confirmed:', cyratorUser.email_confirmed_at ? 'Yes' : 'No');
    console.log('- Last sign in:', cyratorUser.last_sign_in_at || 'Never');
    console.log('- Created:', cyratorUser.created_at);
    
    // Reset the password to something new
    const newPassword = 'sunbeam2025';
    
    console.log('\nResetting password to:', newPassword);
    
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      cyratorUser.id,
      { password: newPassword }
    );
    
    if (updateError) {
      console.error('Error updating password:', updateError);
    } else {
      console.log('\n✅ Password successfully reset!');
      console.log('\nNew credentials:');
      console.log('Email: marc@cyrator.com');
      console.log('Password:', newPassword);
      console.log('\nTry logging in with these credentials now.');
    }
  }
  
  // Also test if the accounts are in the investors table
  console.log('\n\nChecking investors table...');
  const { data: investors, error: invError } = await supabase
    .from('investors')
    .select('*')
    .in('email', ['marc@cyrator.com', 'marc@minutevideos.com']);
    
  if (investors) {
    console.log('Investors found:', investors.length);
    investors.forEach(inv => {
      console.log(`- ${inv.email}: ${inv.name} (${inv.share_percentage}%)`);
    });
  }
}

resetPassword().catch(console.error);