// Test investor creation with the actual user that the form is trying to convert
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testManualInvestorCreation() {
  console.log('🧪 Testing manual investor creation...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.8V_9hWPPzQqWfMgGqnCXlzZNbZcAdowOk9kHWPNJb0s'
  );

  try {
    // Get the specific user marc@cyrator.com
    console.log('📋 Finding marc@cyrator.com user...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error fetching users:', usersError);
      return;
    }
    
    const marcUser = users.find(user => user.email === 'marc@cyrator.com');
    if (!marcUser) {
      console.log('❌ marc@cyrator.com user not found');
      return;
    }
    
    console.log('✅ Found user:', {
      id: marcUser.id,
      email: marcUser.email,
      created_at: marcUser.created_at
    });
    
    // Check if this user is already an investor
    const { data: existingInvestor, error: existingError } = await supabase
      .from('investors')
      .select('*')
      .eq('id', marcUser.id)
      .single();
    
    if (existingInvestor) {
      console.log('⚠️ User is already an investor:', existingInvestor);
      // Delete the existing investor first for testing
      const { error: deleteError } = await supabase
        .from('investors')
        .delete()
        .eq('id', marcUser.id);
      
      if (deleteError) {
        console.log('❌ Could not delete existing investor:', deleteError);
        return;
      } else {
        console.log('🧹 Deleted existing investor for testing');
      }
    }
    
    // Now try to create the investor exactly as the form would
    console.log('📋 Creating investor...');
    const investorData = {
      id: marcUser.id,
      email: marcUser.email,
      name: marcUser.email, // Form pre-fills with email
      account_number: 'ACC-MARC-001',
      share_percentage: 15.5,
      initial_investment: 75000,
      notes: 'Test investor created manually'
    };
    
    console.log('📝 Investor data:', investorData);
    
    const { data: newInvestor, error: createError } = await supabase
      .from('investors')
      .insert(investorData)
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
      
      // Test that we can query it
      const { data: queriedInvestor, error: queryError } = await supabase
        .from('investors')
        .select('*')
        .eq('id', newInvestor.id)
        .single();
      
      if (queryError) {
        console.log('❌ Error querying created investor:', queryError);
      } else {
        console.log('✅ Successfully queried investor:', queriedInvestor);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testManualInvestorCreation().catch(console.error);