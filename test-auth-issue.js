const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://gualxudgbmpuhjbumfeh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('Testing authentication for marc@cyrator.com...\n');
  
  // First, check if the user exists in auth.users
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4';
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  
  // Check if user exists
  const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
  if (userError) {
    console.error('Error fetching users:', userError);
    return;
  }
  
  const marcUser = users.users.find(u => u.email === 'marc@cyrator.com');
  if (!marcUser) {
    console.log('❌ User marc@cyrator.com not found in auth.users');
    return;
  }
  
  console.log('✅ User found:', {
    id: marcUser.id,
    email: marcUser.email,
    created_at: marcUser.created_at,
    last_sign_in_at: marcUser.last_sign_in_at,
    email_confirmed_at: marcUser.email_confirmed_at
  });
  
  // Check if email is confirmed
  if (!marcUser.email_confirmed_at) {
    console.log('\n⚠️  Email not confirmed! This might be causing login issues.');
  }
  
  // Try different passwords
  const passwords = ['123456', 'password123', 'testpassword123', 'sunbeam123'];
  
  console.log('\nTrying different passwords...');
  for (const password of passwords) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'marc@cyrator.com',
      password: password
    });
    
    if (!error) {
      console.log(`\n✅ SUCCESS! Password is: ${password}`);
      console.log('Session created:', !!data.session);
      return;
    } else {
      console.log(`❌ ${password}: ${error.message}`);
    }
  }
  
  console.log('\n📝 None of the common passwords worked.');
  console.log('The user exists but has a different password.');
  console.log('\nNext steps:');
  console.log('1. Use password reset functionality');
  console.log('2. Or update the password directly via Supabase admin');
}

testAuth().catch(console.error);