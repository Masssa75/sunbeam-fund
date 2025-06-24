// Test if the service role key itself is valid
const { createClient } = require('@supabase/supabase-js');

async function testServiceRoleKey() {
  console.log('🔑 Testing service role key validity...');
  
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    // Test basic query
    console.log('📋 Testing basic query...');
    const { data, error } = await supabase
      .from('investors')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Error with basic query:', error);
      return false;
    } else {
      console.log('✅ Basic query works:', data);
    }
    
    // Test admin operations
    console.log('📋 Testing admin auth operations...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error with admin auth:', usersError);
      return false;
    } else {
      console.log('✅ Admin auth works, found', users.length, 'users');
    }
    
    // Test a simple insert/delete to verify permissions
    console.log('📋 Testing insert/delete permissions...');
    const testData = {
      id: '00000000-0000-0000-0000-000000000000', // Use a dummy UUID
      email: 'test@test.com',
      name: 'Test',
      account_number: 'TEST-PERMISSIONS',
      share_percentage: 1.0
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('investors')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Error with insert:', insertError);
      return false;
    } else {
      console.log('✅ Insert works:', insertData);
      
      // Clean up
      const { error: deleteError } = await supabase
        .from('investors')
        .delete()
        .eq('id', testData.id);
      
      if (deleteError) {
        console.log('⚠️ Could not clean up test record:', deleteError);
      } else {
        console.log('🧹 Cleaned up test record');
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

testServiceRoleKey().then(success => {
  if (success) {
    console.log('🎉 Service role key is working correctly!');
  } else {
    console.log('💥 Service role key has issues');
  }
}).catch(console.error);