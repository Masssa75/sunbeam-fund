const { createBrowserClient } = require('@supabase/ssr');

// Test the client-side login flow
async function testBrowserFlow() {
  console.log('Testing browser-like login flow...\n');

  // Create a browser client
  const supabase = createBrowserClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  );

  try {
    // 1. Sign in
    console.log('1. Signing in with marc@minutevideos.com...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'marc@minutevideos.com',
      password: '123456'
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return;
    }

    console.log('   ✅ Sign in successful');
    console.log('   User ID:', signInData.user?.id);
    console.log('   Session:', !!signInData.session);

    // 2. Get session
    console.log('\n2. Getting current session...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('   Session found:', !!session);
    console.log('   User email:', session?.user?.email);

    // 3. Test getting positions directly
    console.log('\n3. Testing direct database query...');
    const { data: positions, error: posError } = await supabase
      .from('positions')
      .select('*');

    if (posError) {
      console.error('   Error fetching positions:', posError);
    } else {
      console.log('   ✅ Positions fetched:', positions?.length || 0);
      if (positions && positions.length > 0) {
        console.log('   First position:', positions[0].project_name);
      }
    }

    // 4. Sign out
    console.log('\n4. Signing out...');
    await supabase.auth.signOut();
    console.log('   ✅ Signed out');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testBrowserFlow();