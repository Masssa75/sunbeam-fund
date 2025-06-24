// Debug investor creation issue
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function debugInvestorCreation() {
  console.log('🔍 Debugging investor creation...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.8V_9hWPPzQqWfMgGqnCXlzZNbZcAdowOk9kHWPNJb0s'
  );

  try {
    // Check existing investors
    console.log('📋 Checking existing investors...');
    const { data: investors, error: investorsError } = await supabase
      .from('investors')
      .select('*');
    
    if (investorsError) {
      console.log('❌ Error fetching investors:', investorsError);
    } else {
      console.log('👥 Existing investors:', investors);
    }
    
    // Check auth users
    console.log('📋 Checking auth users...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error fetching users:', usersError);
    } else {
      console.log('👤 Auth users count:', users.length);
      users.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`);
      });
    }
    
    // Try to create a test investor with proper data
    console.log('📋 Testing investor creation...');
    
    // Find a user that's not already an investor
    const existingInvestorIds = investors.map(inv => inv.id);
    const nonInvestorUser = users.find(user => !existingInvestorIds.includes(user.id));
    
    if (!nonInvestorUser) {
      console.log('❌ No non-investor users found to test with');
      return;
    }
    
    console.log(`🧪 Testing with user: ${nonInvestorUser.email} (${nonInvestorUser.id})`);
    
    const testData = {
      id: nonInvestorUser.id,
      email: nonInvestorUser.email,
      name: 'Test Investor',
      account_number: 'TEST-001',
      share_percentage: 10.5,
      initial_investment: 50000,
      notes: 'Test investor created via debug script'
    };
    
    console.log('📝 Test data:', testData);
    
    const { data: newInvestor, error: createError } = await supabase
      .from('investors')
      .insert(testData)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Error creating investor:', createError);
      console.log('Error details:', {
        message: createError.message,
        code: createError.code,
        details: createError.details,
        hint: createError.hint
      });
    } else {
      console.log('✅ Successfully created investor:', newInvestor);
      
      // Clean up - delete the test investor
      const { error: deleteError } = await supabase
        .from('investors')
        .delete()
        .eq('id', newInvestor.id);
      
      if (deleteError) {
        console.log('⚠️ Could not clean up test investor:', deleteError.message);
      } else {
        console.log('🧹 Cleaned up test investor');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugInvestorCreation().catch(console.error);