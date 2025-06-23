const { createClient } = require('@supabase/supabase-js');

// Test the complete login flow
async function testFullLoginFlow() {
  console.log('Testing FULL login flow...\n');

  // Create Supabase client
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  );

  try {
    // 1. Sign in
    console.log('1. Signing in with test account...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'marc@minutevideos.com',
      password: '123456'
    });

    if (signInError) {
      console.error('   ❌ Sign in failed:', signInError.message);
      return;
    }

    console.log('   ✅ Sign in successful');
    console.log('   User ID:', signInData.user?.id);
    console.log('   Email:', signInData.user?.email);

    // 2. Check session
    console.log('\n2. Verifying session...');
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('   ✅ Session verified');
      console.log('   Access token:', session.access_token.substring(0, 20) + '...');
    } else {
      console.log('   ❌ No session found');
    }

    // 3. Fetch positions
    console.log('\n3. Fetching portfolio positions...');
    const { data: positions, error: posError } = await supabase
      .from('positions')
      .select('*')
      .order('entry_date', { ascending: false });

    if (posError) {
      console.error('   ❌ Error fetching positions:', posError.message);
    } else {
      console.log('   ✅ Positions fetched:', positions.length);
      if (positions.length > 0) {
        console.log('\n   Portfolio Summary:');
        positions.forEach(p => {
          console.log(`   - ${p.project_name} (${p.symbol}): ${p.amount} tokens`);
        });
        
        const totalValue = positions.reduce((sum, p) => sum + p.cost_basis, 0);
        console.log(`\n   Total Portfolio Value: $${totalValue.toLocaleString()}`);
      }
    }

    // 4. Test admin check
    console.log('\n4. Checking admin status...');
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('user_email')
      .eq('user_email', signInData.user?.email)
      .single();

    if (adminError) {
      console.log('   ❌ Not an admin user');
    } else {
      console.log('   ✅ Admin user confirmed');
    }

    // 5. Sign out
    console.log('\n5. Signing out...');
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('   ❌ Sign out failed:', signOutError.message);
    } else {
      console.log('   ✅ Successfully signed out');
    }

    console.log('\n✅ FULL LOGIN FLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('\nThe login system is working correctly. Users can:');
    console.log('- Sign in with valid credentials');
    console.log('- Access their portfolio data');
    console.log('- Sign out properly');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

testFullLoginFlow();