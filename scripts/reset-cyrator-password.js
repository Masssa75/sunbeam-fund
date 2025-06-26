#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function resetPassword() {
  console.log('Resetting password for marc@cyrator.com...\n');

  // Use service role to update password
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4'
  );

  // First find the user
  const { data: users, error: findError } = await supabase.auth.admin.listUsers();
  
  if (findError) {
    console.error('Error finding users:', findError);
    return;
  }

  const cyrator = users.users.find(u => u.email === 'marc@cyrator.com');
  if (!cyrator) {
    console.error('User marc@cyrator.com not found');
    return;
  }

  console.log('Found user:', cyrator.id, cyrator.email);

  // Update password to 123456
  const { data, error } = await supabase.auth.admin.updateUserById(
    cyrator.id,
    { password: '123456' }
  );

  if (error) {
    console.error('Error updating password:', error);
  } else {
    console.log('✅ Password updated successfully to: 123456');
  }
}

resetPassword().catch(console.error);