const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestInvestor() {
  try {
    // First, create a user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test.investor@sunbeam.capital',
      password: 'investor123456',
      email_confirm: true,
      user_metadata: {
        name: 'Test Investor'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('✅ Created auth user:', authData.user.email);

    // Now create the investor record
    const { data: investorData, error: investorError } = await supabase
      .from('investors')
      .insert({
        id: authData.user.id,
        email: 'test.investor@sunbeam.capital',
        name: 'Test Investor',
        account_number: 'TEST001',
        share_percentage: 10.5, // 10.5% share
        initial_investment: 50000,
        join_date: '2024-01-01',
        status: 'active',
        notes: 'Test investor account for development'
      })
      .select()
      .single();

    if (investorError) {
      console.error('Error creating investor record:', investorError);
      // Clean up auth user if investor creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('✅ Created investor record:');
    console.log('   Email:', investorData.email);
    console.log('   Account:', investorData.account_number);
    console.log('   Share:', investorData.share_percentage + '%');
    console.log('   Initial Investment: $' + investorData.initial_investment);
    console.log('');
    console.log('📧 Login credentials:');
    console.log('   Email: test.investor@sunbeam.capital');
    console.log('   Password: investor123456');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestInvestor();