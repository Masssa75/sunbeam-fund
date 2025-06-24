// Create a test user directly in the database to test welcome message

const { createClient } = require('@supabase/supabase-js');

async function createTestUser() {
  console.log('🛠️  Creating test user directly in database...');
  
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4' // service role key
  );
  
  try {
    // Create a test user via admin API
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: 'testuser@sunbeam.capital',
      password: 'testpassword123',
      email_confirm: true // Skip email confirmation
    });
    
    if (createError) {
      if (createError.message.includes('already registered')) {
        console.log('✅ Test user already exists');
        return;
      } else {
        throw createError;
      }
    }
    
    console.log('✅ Test user created successfully:', user.user.email);
    console.log('📧 Email:', user.user.email);
    console.log('🔑 Password: testpassword123');
    console.log('📝 This user is NOT an admin and NOT an investor');
    console.log('👁️  Should see welcome message when logging in');
    
  } catch (error) {
    console.error('❌ Failed to create test user:', error.message);
  }
}

createTestUser().catch(console.error);